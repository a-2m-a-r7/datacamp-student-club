import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchQuery } from '../src/lib/watchQuery';

function environment(t: any) {
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const window = new EventTarget(), navigator = { onLine: true };
  const names = ['document', 'window', 'navigator'] as const;
  const previous = names.map(name => Object.getOwnPropertyDescriptor(globalThis, name));
  for (const [name, value] of Object.entries({ document, window, navigator })) Object.defineProperty(globalThis, name, { configurable: true, value });
  t.after(() => names.forEach((name, index) => { const old = previous[index]; if (old) Object.defineProperty(globalThis, name, old); else delete (globalThis as any)[name]; }));
  t.mock.timers.enable({ apis: ['setInterval', 'Date'], now: 100000 });
  return { document, window, navigator };
}
const flush = () => new Promise<void>(resolve => setImmediate(resolve));

test('background refresh needs no realtime connection; hidden/offline tabs stop work and resume fresh', async t => {
  const env = environment(t); let reads = 0, sockets = 0; const values: number[] = [];
  const stop = watchQuery(async () => ++reads, value => values.push(value), () => { sockets++; return () => {}; });
  await flush(); assert.deepEqual(values, [1]); assert.equal(sockets, 0);
  env.document.visibilityState = 'hidden'; t.mock.timers.tick(150000); await flush(); assert.equal(reads, 1);
  env.navigator.onLine = false; env.document.visibilityState = 'visible'; env.document.dispatchEvent(new Event('visibilitychange')); t.mock.timers.tick(150000); await flush(); assert.equal(reads, 1);
  env.navigator.onLine = true; env.window.dispatchEvent(new Event('online')); await flush(); assert.deepEqual(values, [1, 2]);
  stop(); t.mock.timers.tick(150000); env.window.dispatchEvent(new Event('online')); await flush(); assert.equal(reads, 2);
});

test('slow responses do not overlap and cannot repopulate state after logout/unmount', async t => {
  environment(t); let finish!: (value: string) => void, reads = 0; const values: string[] = [];
  const stop = watchQuery(() => { reads++; return new Promise<string>(resolve => { finish = resolve; }); }, value => values.push(value));
  t.mock.timers.tick(300000); await flush(); assert.equal(reads, 1);
  stop(); finish('old-account'); await flush(); assert.deepEqual(values, []);
});

test('a temporary backend failure retains known data and a later refresh receives the real update', async t => {
  environment(t); let reads = 0; const values: string[] = [];
  const stop = watchQuery(async () => { reads++; if (reads === 2) throw Error('temporary network failure'); return reads === 1 ? 'saved' : 'updated'; }, value => values.push(value));
  await flush(); t.mock.timers.tick(75000); await flush(); assert.deepEqual(values, ['saved']);
  t.mock.timers.tick(75000); await flush(); assert.deepEqual(values, ['saved', 'updated']);
  stop();
});
