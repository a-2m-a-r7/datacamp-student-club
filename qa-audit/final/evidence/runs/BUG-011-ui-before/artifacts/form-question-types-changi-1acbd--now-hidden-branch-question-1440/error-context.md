# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: form-question-types.spec.ts >> changing an earlier branch ignores the answer of a now-hidden branch question
- Location: qa-audit\final\tests\form-question-types.spec.ts:201:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('QA_TEST_REACHABLE_TARGET', { exact: true })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('QA_TEST_REACHABLE_TARGET', { exact: true }) with timeout 20000ms
  - waiting for getByText('QA_TEST_REACHABLE_TARGET', { exact: true })

```

```yaml
- link "DataCamp Emblem Innovation University Crest":
  - /url: /
  - img "DataCamp Emblem"
  - img "Innovation University Crest"
- text: QA_TEST_MEMBER@example.invalid
- heading "QA_TEST_qa-test-branch-change" [level=1]
- textbox
- text: QA_TEST_START_BRANCH
- combobox:
  - option "-- Select an option --"
  - option "QA_TEST_Continue"
  - option "QA_TEST_Jump" [selected]
- button "Submit Form"
- paragraph: Powered by DataCamp Student Club • Secured with Supabase RLS
- region "Notifications alt+T"
```

# Test source

```ts
  108 |     required: true,
  109 |     options: [
  110 |       { id: 'QA_TEST_SKIP', text: 'QA_TEST_Skip_to_finish' },
  111 |       { id: 'QA_TEST_CONTINUE', text: 'QA_TEST_Continue_normally' },
  112 |     ],
  113 |   });
  114 |   const optional = question('QA_TEST_INTERMEDIATE_OPTIONAL', 'short_text', 1,
  115 |     { settings: { placeholder: 'QA_TEST_OPTIONAL_ANSWER' } });
  116 |   const required = question('QA_TEST_INTERMEDIATE_REQUIRED', 'short_text', 2,
  117 |     { required: true, settings: { placeholder: 'QA_TEST_REQUIRED_ANSWER' } });
  118 |   const target = question('QA_TEST_BRANCH_TARGET', 'short_text', 3,
  119 |     { required: true, settings: { placeholder: 'QA_TEST_FINAL_ANSWER' } });
  120 |   const form = await createForm('qa-test-forward-branch-contract', [route, optional, required, target]);
  121 |   return { form, route, optional, required, target };
  122 | }
  123 | 
  124 | async function configureForwardBranch(page: Page, fixture: Awaited<ReturnType<typeof branchFixture>>) {
  125 |   await app.connect(page, admin);
  126 |   await page.goto('/admin/forms/builder/' + fixture.form.id);
  127 |   const card = page.locator('div.relative.rounded-2xl').filter({
  128 |     has: page.locator('input[value="QA_TEST_BRANCH_ROUTE"]'),
  129 |   });
  130 |   await expect(card).toHaveCount(1);
  131 |   await card.locator('input[value="QA_TEST_BRANCH_ROUTE"]').click();
  132 |   await card.getByRole('button', { name: 'Branching Logic', exact: true }).click();
  133 |   // Two selectors correspond to the two options in their persisted order.
  134 |   await expect(card.getByRole('combobox')).toHaveCount(2);
  135 |   await card.getByRole('combobox').first().selectOption(fixture.target.id);
  136 |   await expect.poll(async () => {
  137 |     const row = (await app.db.query<any>('SELECT options FROM form_questions WHERE id=$1', [fixture.route.id])).rows[0];
  138 |     return row.options[0].goToQuestionId;
  139 |   }).toBe(fixture.target.id);
  140 | }
  141 | 
  142 | test('branching builder: explicit forward target survives autosave and editor reload', async ({ page }) => {
  143 |   const fixture = await branchFixture();
  144 |   await configureForwardBranch(page, fixture);
  145 |   await page.reload();
  146 |   const card = page.locator('div.relative.rounded-2xl').filter({
  147 |     has: page.locator('input[value="QA_TEST_BRANCH_ROUTE"]'),
  148 |   });
  149 |   await card.locator('input[value="QA_TEST_BRANCH_ROUTE"]').click();
  150 |   await card.getByRole('button', { name: 'Branching Logic', exact: true }).click();
  151 |   await expect(card.getByRole('combobox').first()).toHaveValue(fixture.target.id);
  152 |   await expect(card.getByRole('combobox').nth(1)).toHaveValue('');
  153 |   const rows = (await app.db.query<any>(
  154 |     'SELECT id,required,options FROM form_questions WHERE form_id=$1 ORDER BY position', [fixture.form.id],
  155 |   )).rows;
  156 |   expect(rows.map(row => row.id)).toEqual([
  157 |     fixture.route.id, fixture.optional.id, fixture.required.id, fixture.target.id,
  158 |   ]);
  159 |   expect(rows[0].options[0]).toMatchObject({ id: 'QA_TEST_SKIP', goToQuestionId: fixture.target.id });
  160 |   expect(rows[2].required).toBe(true);
  161 | });
  162 | 
  163 | test('configured-go-to contract: forward branch skips intermediate optional and required questions before saving', async ({ page, context }) => {
  164 |   // Assumption for parent review: an explicit same-section forward question
  165 |   // target skips both intervening questions for rendering AND required validation.
  166 |   // Backward/cyclic targets, multi-select branches and stale answers on changing a
  167 |   // branch are deliberately outside this test and remain Needs decision.
  168 |   const fixture = await branchFixture();
  169 |   await configureForwardBranch(page, fixture);
  170 |   const respondent = await context.newPage();
  171 |   const submissions = await connectRespondent(respondent);
  172 |   await respondent.goto('/f/' + fixture.form.slug);
  173 |   await expect(respondent.getByText(fixture.route.title, { exact: true })).toBeVisible();
  174 |   // The current public select exposes option text as value. Select by displayed
  175 |   // label so the test remains valid when the value is fixed to stable option ID.
  176 |   await respondent.locator('form select').selectOption({ label: fixture.route.options[0].text });
  177 |   await expect(respondent.getByText(fixture.optional.title, { exact: true })).toHaveCount(0);
  178 |   await expect(respondent.getByText(fixture.required.title, { exact: true })).toHaveCount(0);
  179 |   await expect(respondent.getByText(fixture.target.title, { exact: true })).toBeVisible();
  180 |   await respondent.getByPlaceholder('QA_TEST_FINAL_ANSWER', { exact: true }).fill('QA_TEST_FINISHED_BRANCH');
  181 |   await respondent.getByRole('button', { name: 'Submit Form', exact: true }).click();
  182 |   await expect(respondent.getByText('QA_TEST_RESPONSE_PERSISTED', { exact: true })).toBeVisible();
  183 |   expect(submissions).toHaveLength(1);
  184 |   expect(submissions[0].answers).toEqual(expect.arrayContaining([
  185 |     { question_id: fixture.route.id, value: 'QA_TEST_SKIP' },
  186 |     { question_id: fixture.target.id, value: 'QA_TEST_FINISHED_BRANCH' },
  187 |   ]));
  188 |   expect(submissions[0].answers).toHaveLength(2);
  189 |   const responses = (await app.db.query<any>('SELECT * FROM form_responses WHERE form_id=$1', [fixture.form.id])).rows;
  190 |   expect(responses).toHaveLength(1);
  191 |   const saved = (await app.db.query<any>(
  192 |     'SELECT question_id,value FROM form_answers WHERE response_id=$1', [responses[0].id],
  193 |   )).rows;
  194 |   expect(saved).toHaveLength(2);
  195 |   expect(saved).toEqual(expect.arrayContaining([
  196 |     { question_id: fixture.route.id, value: 'QA_TEST_SKIP' },
  197 |     { question_id: fixture.target.id, value: 'QA_TEST_FINISHED_BRANCH' },
  198 |   ]));
  199 | });
  200 | 
  201 | test('changing an earlier branch ignores the answer of a now-hidden branch question',async({page})=>{
  202 |  const target=question('QA_TEST_REACHABLE_TARGET','short_text',2,{required:true,settings:{placeholder:'QA_TEST_TARGET_ANSWER'}});
  203 |  const start=question('QA_TEST_START_BRANCH','dropdown',0,{options:[{id:'QA_TEST_NEXT',text:'QA_TEST_Continue'},{id:'QA_TEST_JUMP',text:'QA_TEST_Jump',goToQuestionId:target.id}]});
  204 |  const hidden=question('QA_TEST_NESTED_BRANCH','dropdown',1,{options:[{id:'QA_TEST_NESTED_NEXT',text:'QA_TEST_Nested_continue'},{id:'QA_TEST_END',text:'QA_TEST_End',goToQuestionId:'end'}]});
  205 |  const form=await createForm('qa-test-branch-change',[start,hidden,target]);const submissions=await connectRespondent(page);await page.goto('/f/'+form.slug);
  206 |  const cards=(title:string)=>page.getByText(title,{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
  207 |  await cards(hidden.title).locator('select').selectOption('QA_TEST_END');await expect(page.getByText(target.title,{exact:true})).toHaveCount(0);
> 208 |  await cards(start.title).locator('select').selectOption('QA_TEST_JUMP');await expect(page.getByText(target.title,{exact:true})).toBeVisible();
      |                                                                                                                                  ^ Error: expect(locator).toBeVisible() failed
  209 |  await page.getByPlaceholder('QA_TEST_TARGET_ANSWER').fill('QA_TEST_REACHABLE');await page.getByRole('button',{name:'Submit Form',exact:true}).click();await expect(page.getByText('QA_TEST_RESPONSE_PERSISTED',{exact:true})).toBeVisible();
  210 |  expect(submissions[0].answers.map(a=>a.question_id)).toEqual([start.id,target.id]);
  211 | });
  212 | 
```