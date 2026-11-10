const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDemoIdentityPlan } = require('../Services/demoIdentity');

const avatars = Array.from({ length: 50 }, (_, index) => `avatar-${String(index).padStart(2, '0')}.png`);

test('demo identity plan is stable, unique, and uses the existing avatar set', () => {
  const first = buildDemoIdentityPlan(avatars, ['Alex Morgan']);
  const second = buildDemoIdentityPlan(avatars, ['Alex Morgan']);

  assert.equal(first.size, 130);
  assert.deepEqual([...first], [...second]);
  assert.equal(new Set([...first.values()].map(({ name }) => name.toLowerCase())).size, 130);
  assert.equal(first.get('demo.tourist.001@rafiq.test').name, 'Sofia Morgan');
  assert.equal(first.get('demo.guide.25@rafiq.test').name, 'Adel Mansour');
  assert.equal(first.get('demo.pending.01@rafiq.test').avatarUrl, '/avatars/avatar-25.png');
  assert.ok([...first.values()].every(({ name }) => !/\b(demo|tourist|guide|pending)\b|\d{2,}/i.test(name)));
});

test('demo identity plan rejects an empty avatar directory', () => {
  assert.throws(() => buildDemoIdentityPlan([]), /requires the existing avatar files/);
});
