const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../Models/User');
const TourGuideProfile = require('../Models/TourGuideProfile');
const controller = require('../Controllers/TourGuideProfile');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('admin approval verifies the profile and promotes only its owner to guide', async (t) => {
  let roleUpdate;
  const profile = {
    _id: 'profile-id', owner: 'guide-user-id', status: 'pending', verified: false,
    save: async function save() { return this; },
    toObject() { return { _id: this._id, owner: this.owner, status: this.status, verified: this.verified }; },
  };
  const originalFindById = TourGuideProfile.findById;
  const originalUpdateOne = User.updateOne;
  TourGuideProfile.findById = async () => profile;
  User.updateOne = async (...args) => { roleUpdate = args; return { modifiedCount: 1 }; };
  t.after(() => { TourGuideProfile.findById = originalFindById; User.updateOne = originalUpdateOne; });

  const res = response();
  await controller.updateTourGuideProfile({
    params: { id: 'profile-id' }, user: { id: 'admin-id', role: 'admin' },
    body: { status: 'approved', verified: true },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(profile.status, 'approved');
  assert.equal(profile.verified, true);
  assert.deepEqual(roleUpdate[0], { _id: 'guide-user-id', role: { $ne: 'admin' } });
  assert.deepEqual(roleUpdate[1], { $set: { role: 'tourguide' } });
});

test('guide owners cannot change their own approval state', async (t) => {
  const profile = {
    _id: 'profile-id', owner: 'guide-user-id', status: 'pending', verified: false,
    save: async function save() { return this; },
  };
  const originalFindById = TourGuideProfile.findById;
  TourGuideProfile.findById = async () => profile;
  t.after(() => { TourGuideProfile.findById = originalFindById; });

  const res = response();
  await controller.updateTourGuideProfile({
    params: { id: 'profile-id' }, user: { id: 'guide-user-id', role: 'tourguide' },
    body: { status: 'approved', verified: true },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(profile.status, 'pending');
  assert.equal(profile.verified, false);
});
