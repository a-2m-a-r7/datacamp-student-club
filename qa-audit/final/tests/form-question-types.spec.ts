import { test, expect, Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { platform, admin, member } from '../../fix-tests/persisted-platform';
import type { FormQuestion } from '../../../src/types/forms';

// Authoring only: the parent agent executes this suite. These tests use the
// localhost:3100 QA build and PGlite transport adapter, never a real provider.
let app: Awaited<ReturnType<typeof platform>>;
test.beforeEach(async () => { app = await platform(); });
test.afterEach(async ({ browser }) => {
  for (const context of browser.contexts()) await context.close();
  await app?.db.close();
});

function question(title: string, type: FormQuestion['type'], position: number,
  extra: Partial<FormQuestion> = {}): FormQuestion {
  return {
    id: randomUUID(), form_id: '', title, type, position, required: false,
    options: [], settings: {}, ...extra,
  };
}

async function createForm(slug: string, questions: FormQuestion[]) {
  const result = await app.asUser(admin, tx => tx.query(
    'SELECT save_form($1, $2) saved',
    [JSON.stringify({
      title: 'QA_TEST_' + slug, slug, status: 'published',
      allow_anonymous: false, one_response_per_user: true, collect_email: false,
      sheets_sync_enabled: false, success_message: 'QA_TEST_RESPONSE_PERSISTED',
    }), JSON.stringify(questions)],
  ));
  return result.rows[0].saved.form as { id: string; slug: string };
}

/**
 * Bridge only this browser's submission endpoint to the actual migrated SQL RPC
 * as its known isolated member. This is not an assertion about the real HTTP
 * handler, Auth server, Sheets, or provider transport; separate suites cover them.
 * Do not return canned success: SQL validation/persistence determines the result.
 */
async function connectRespondent(page: Page) {
  const submissions: { formId: string; answers: { question_id: string; value: unknown }[] }[] = [];
  await app.connect(page, member);
  await page.route('**/api/forms/submit', async route => {
    const body = route.request().postDataJSON();
    submissions.push(body);
    try {
      const result = await app.asUser(member, tx => tx.query(
        'SELECT submit_form_response($1, $2, $3, $4) saved',
        [body.formId, JSON.stringify(body.answers), body.respondentEmail || null,
          JSON.stringify(body.metadata || {})],
      ));
      await route.fulfill({ status: 200, json: result.rows[0].saved });
    } catch (error: any) {
      await route.fulfill({ status: 400, json: { error: error.message } });
    }
  });
  return submissions;
}

test('ranking: public choices drag into a new order and persist the exact option IDs', async ({ page }) => {
  // Source contract: QuestionTypePicker labels ranking "Drag to rank items by
  // preference"; submit_form_response validates an array of option IDs, not text.
  // Current PublicFormView lacks this renderer: a failure at visible choices is
  // an intentional functional regression, not a successful test of reordering.
  const options = [
    { id: 'QA_TEST_RANK_A', text: 'QA_TEST_Analysis' },
    { id: 'QA_TEST_RANK_B', text: 'QA_TEST_Building' },
    { id: 'QA_TEST_RANK_C', text: 'QA_TEST_Collaboration' },
  ];
  const ranking = question('QA_TEST_RANK_PREFERENCES', 'ranking', 0,
    { required: true, options });
  const form = await createForm('qa-test-ranking-contract', [ranking]);
  const submissions = await connectRespondent(page);
  await page.goto('/f/' + form.slug);
  await expect(page.getByText(ranking.title, { exact: true })).toBeVisible();
  for (const option of options) await expect(page.getByText(option.text, { exact: true })).toBeVisible();

  // Drag contract comes from the picker. No guessed hidden input or direct state
  // injection is used. Each displayed option must have a draggable ancestor.
  const rowFor = (text: string) => page.getByText(text, { exact: true })
    .locator('xpath=ancestor-or-self::*[@draggable="true"][1]');
  await expect(rowFor(options[2].text)).toBeVisible();
  await rowFor(options[2].text).dragTo(rowFor(options[0].text));
  const displayed = await page.locator('[draggable="true"]').allTextContents();
  const ordered = displayed.map(text => options.find(option => text.includes(option.text))?.id)
    .filter(Boolean);
  expect(ordered).toEqual(['QA_TEST_RANK_C', 'QA_TEST_RANK_A', 'QA_TEST_RANK_B']);
  await page.getByRole('button', { name: 'Submit Form', exact: true }).click();
  await expect(page.getByText('QA_TEST_RESPONSE_PERSISTED', { exact: true })).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0].answers).toEqual([{
    question_id: ranking.id, value: ['QA_TEST_RANK_C', 'QA_TEST_RANK_A', 'QA_TEST_RANK_B'],
  }]);
  const responses = (await app.db.query<any>('SELECT * FROM form_responses WHERE form_id=$1', [form.id])).rows;
  expect(responses).toHaveLength(1);
  expect(responses[0].respondent_id).toBe(member);
  const answers = (await app.db.query<any>(
    'SELECT question_id,value FROM form_answers WHERE response_id=$1', [responses[0].id],
  )).rows;
  expect(answers).toEqual([{
    question_id: ranking.id, value: ['QA_TEST_RANK_C', 'QA_TEST_RANK_A', 'QA_TEST_RANK_B'],
  }]);
});

async function branchFixture() {
  const route = question('QA_TEST_BRANCH_ROUTE', 'dropdown', 0, {
    required: true,
    options: [
      { id: 'QA_TEST_SKIP', text: 'QA_TEST_Skip_to_finish' },
      { id: 'QA_TEST_CONTINUE', text: 'QA_TEST_Continue_normally' },
    ],
  });
  const optional = question('QA_TEST_INTERMEDIATE_OPTIONAL', 'short_text', 1,
    { settings: { placeholder: 'QA_TEST_OPTIONAL_ANSWER' } });
  const required = question('QA_TEST_INTERMEDIATE_REQUIRED', 'short_text', 2,
    { required: true, settings: { placeholder: 'QA_TEST_REQUIRED_ANSWER' } });
  const target = question('QA_TEST_BRANCH_TARGET', 'short_text', 3,
    { required: true, settings: { placeholder: 'QA_TEST_FINAL_ANSWER' } });
  const form = await createForm('qa-test-forward-branch-contract', [route, optional, required, target]);
  return { form, route, optional, required, target };
}

async function configureForwardBranch(page: Page, fixture: Awaited<ReturnType<typeof branchFixture>>) {
  await app.connect(page, admin);
  await page.goto('/admin/forms/builder/' + fixture.form.id);
  const card = page.locator('div.relative.rounded-2xl').filter({
    has: page.locator('input[value="QA_TEST_BRANCH_ROUTE"]'),
  });
  await expect(card).toHaveCount(1);
  await card.locator('input[value="QA_TEST_BRANCH_ROUTE"]').click();
  await card.getByRole('button', { name: 'Branching Logic', exact: true }).click();
  // Two selectors correspond to the two options in their persisted order.
  await expect(card.getByRole('combobox')).toHaveCount(2);
  await card.getByRole('combobox').first().selectOption(fixture.target.id);
  await expect.poll(async () => {
    const row = (await app.db.query<any>('SELECT options FROM form_questions WHERE id=$1', [fixture.route.id])).rows[0];
    return row.options[0].goToQuestionId;
  }).toBe(fixture.target.id);
}

test('branching builder: explicit forward target survives autosave and editor reload', async ({ page }) => {
  const fixture = await branchFixture();
  await configureForwardBranch(page, fixture);
  await page.reload();
  const card = page.locator('div.relative.rounded-2xl').filter({
    has: page.locator('input[value="QA_TEST_BRANCH_ROUTE"]'),
  });
  await card.locator('input[value="QA_TEST_BRANCH_ROUTE"]').click();
  await card.getByRole('button', { name: 'Branching Logic', exact: true }).click();
  await expect(card.getByRole('combobox').first()).toHaveValue(fixture.target.id);
  await expect(card.getByRole('combobox').nth(1)).toHaveValue('');
  const rows = (await app.db.query<any>(
    'SELECT id,required,options FROM form_questions WHERE form_id=$1 ORDER BY position', [fixture.form.id],
  )).rows;
  expect(rows.map(row => row.id)).toEqual([
    fixture.route.id, fixture.optional.id, fixture.required.id, fixture.target.id,
  ]);
  expect(rows[0].options[0]).toMatchObject({ id: 'QA_TEST_SKIP', goToQuestionId: fixture.target.id });
  expect(rows[2].required).toBe(true);
});

test('configured-go-to contract: forward branch skips intermediate optional and required questions before saving', async ({ page, context }) => {
  // Assumption for parent review: an explicit same-section forward question
  // target skips both intervening questions for rendering AND required validation.
  // Backward/cyclic targets, multi-select branches and stale answers on changing a
  // branch are deliberately outside this test and remain Needs decision.
  const fixture = await branchFixture();
  await configureForwardBranch(page, fixture);
  const respondent = await context.newPage();
  const submissions = await connectRespondent(respondent);
  await respondent.goto('/f/' + fixture.form.slug);
  await expect(respondent.getByText(fixture.route.title, { exact: true })).toBeVisible();
  // The current public select exposes option text as value. Select by displayed
  // label so the test remains valid when the value is fixed to stable option ID.
  await respondent.locator('form select').selectOption({ label: fixture.route.options[0].text });
  await expect(respondent.getByText(fixture.optional.title, { exact: true })).toHaveCount(0);
  await expect(respondent.getByText(fixture.required.title, { exact: true })).toHaveCount(0);
  await expect(respondent.getByText(fixture.target.title, { exact: true })).toBeVisible();
  await respondent.getByPlaceholder('QA_TEST_FINAL_ANSWER', { exact: true }).fill('QA_TEST_FINISHED_BRANCH');
  await respondent.getByRole('button', { name: 'Submit Form', exact: true }).click();
  await expect(respondent.getByText('QA_TEST_RESPONSE_PERSISTED', { exact: true })).toBeVisible();
  expect(submissions).toHaveLength(1);
  expect(submissions[0].answers).toEqual(expect.arrayContaining([
    { question_id: fixture.route.id, value: 'QA_TEST_SKIP' },
    { question_id: fixture.target.id, value: 'QA_TEST_FINISHED_BRANCH' },
  ]));
  expect(submissions[0].answers).toHaveLength(2);
  const responses = (await app.db.query<any>('SELECT * FROM form_responses WHERE form_id=$1', [fixture.form.id])).rows;
  expect(responses).toHaveLength(1);
  const saved = (await app.db.query<any>(
    'SELECT question_id,value FROM form_answers WHERE response_id=$1', [responses[0].id],
  )).rows;
  expect(saved).toHaveLength(2);
  expect(saved).toEqual(expect.arrayContaining([
    { question_id: fixture.route.id, value: 'QA_TEST_SKIP' },
    { question_id: fixture.target.id, value: 'QA_TEST_FINISHED_BRANCH' },
  ]));
});
