const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-bytes';

const User = require('../Models/User');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Profile = require('../Models/TouristProfile');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Trip = require('../Models/Trip');
const Post = require('../Models/Post');
const Chat = require('../Models/Chat');
const userController = require('../Controllers/User');
const { requireRole } = require('../Middleware/Auth');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function accountRequest({ id = 'user-1', role = 'tourist', params = {}, body = {} } = {}) {
  return { user: { id, role }, params, body };
}

test('a user cannot read another account', async () => {
  const res = response();
  await userController.getUserById(accountRequest({ params: { id: 'user-2' } }), res);
  assert.equal(res.statusCode, 403);
});

test('a user cannot update another account', async () => {
  const res = response();
  await userController.updateUser(accountRequest({ params: { id: 'user-2' }, body: { name: 'Changed' } }), res);
  assert.equal(res.statusCode, 403);
});

test('current-user endpoint uses the verified token identity and never returns a password', async (t) => {
  const originalFindById = User.findById;
  const originalGuideFindOne = TourGuideProfile.findOne;
  let requestedId;
  const account = {
    _id: 'verified-user-id', name: 'Current Tourist', email: 'tourist@example.com',
    role: 'tourist', location: 'Cairo', password: 'hash-must-not-leak',
    toObject() { return { ...this }; },
  };
  User.findById = async (id) => { requestedId = id; return account; };
  TourGuideProfile.findOne = () => ({ select: async () => null });
  t.after(() => { User.findById = originalFindById; TourGuideProfile.findOne = originalGuideFindOne; });

  const req = { user: { id: 'verified-user-id', role: 'tourist' }, params: { id: 'attacker-selected-id' } };
  const res = response();
  await userController.getCurrentUser(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(requestedId, 'verified-user-id');
  assert.equal(res.body.user.role, 'tourist');
  assert.equal(res.body.user.guideApplicationStatus, null);
  assert.equal(Object.hasOwn(res.body.user, 'password'), false);
});

test('GET /users/me returns the current database role and rejects missing, invalid, and expired tokens', async (t) => {
  const originalFindById = User.findById;
  const originalGuideFindOne = TourGuideProfile.findOne;
  const currentAccount = {
    _id: 'verified-tourist-id', name: 'Tourist', email: 'tourist@example.com',
    location: 'Cairo', role: 'tourist', password: 'must-not-return',
    toObject() { return { ...this }; },
  };
  User.findById = (id) => ({
    select: async () => ({ role: currentAccount._id === id ? 'tourist' : null }),
    then(resolve, reject) {
      return Promise.resolve(currentAccount._id === id ? currentAccount : null).then(resolve, reject);
    },
  });
  TourGuideProfile.findOne = () => ({ select: async () => null });

  const app = express();
  app.use('/api/users', require('../Routes/User'));
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    User.findById = originalFindById;
    TourGuideProfile.findOne = originalGuideFindOne;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/api/users/me`;

  const missing = await fetch(endpoint);
  const invalid = await fetch(endpoint, { headers: { Authorization: 'Bearer invalid.token.value' } });
  const expiredToken = jwt.sign({ id: currentAccount._id }, process.env.JWT_SECRET, { expiresIn: -1 });
  const expired = await fetch(endpoint, { headers: { Authorization: `Bearer ${expiredToken}` } });
  assert.deepEqual([missing.status, invalid.status, expired.status], [401, 401, 401]);

  // A valid token's role claim is deliberately forged; the response must use the database role.
  const token = jwt.sign({ id: currentAccount._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const valid = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  const payload = await valid.json();
  assert.equal(valid.status, 200);
  assert.equal(payload.user.role, 'tourist');
  assert.equal(Object.hasOwn(payload.user, 'password'), false);
});

test('self-service update ignores role and other unapproved fields', async (t) => {
  const originals = {
    user: User.findByIdAndUpdate,
    profile: Profile.updateMany,
    guide: TourGuideProfile.updateMany,
    review: Review.updateMany,
    booking: Booking.updateMany,
  };
  let updateCall;
  let syncCalls = 0;
  const savedUser = {
    _id: 'user-1', name: 'New Name', email: 'user@example.com', location: 'Cairo', role: 'tourist', password: 'hidden',
    toObject() { return { ...this }; },
  };
  User.findByIdAndUpdate = async (...args) => { updateCall = args; return savedUser; };
  for (const Model of [Profile, TourGuideProfile, Review, Booking]) {
    Model.updateMany = async () => { syncCalls += 1; return {}; };
  }
  t.after(() => {
    User.findByIdAndUpdate = originals.user;
    Profile.updateMany = originals.profile;
    TourGuideProfile.updateMany = originals.guide;
    Review.updateMany = originals.review;
    Booking.updateMany = originals.booking;
  });

  const res = response();
  await userController.updateUser(accountRequest({ params: { id: 'user-1' }, body: {
    name: ' New Name ', role: 'admin', password: 'attacker-controlled', isAdmin: true,
  } }), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(updateCall[1], { $set: { name: 'New Name' } });
  assert.equal(syncCalls, 6);
  assert.equal(Object.hasOwn(res.body.user, 'password'), false);
});

test('account deletion refuses to orphan related travel records', async (t) => {
  const originals = {
    findById: User.findById,
    findByIdAndDelete: User.findByIdAndDelete,
    profile: Profile.exists,
    guide: TourGuideProfile.exists,
    trip: Trip.exists,
    booking: Booking.exists,
    review: Review.exists,
    post: Post.exists,
    chat: Chat.exists,
  };
  let deletionCalled = false;
  User.findById = () => ({ select: async () => ({ role: 'tourist' }) });
  User.findByIdAndDelete = async () => { deletionCalled = true; return {}; };
  for (const Model of [Profile, TourGuideProfile, Trip, Booking, Review, Post, Chat]) Model.exists = async () => null;
  Booking.exists = async () => ({ _id: 'booking-id' });
  t.after(() => {
    User.findById = originals.findById;
    User.findByIdAndDelete = originals.findByIdAndDelete;
    Profile.exists = originals.profile;
    TourGuideProfile.exists = originals.guide;
    Trip.exists = originals.trip;
    Booking.exists = originals.booking;
    Review.exists = originals.review;
    Post.exists = originals.post;
    Chat.exists = originals.chat;
  });

  const res = response();
  await userController.deleteUser(accountRequest({ params: { id: 'user-1' } }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(deletionCalled, false);
});

test('a stale admin claim is replaced with the current database role before authorization', async (t) => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ role: 'tourist' }) });
  t.after(() => { User.findById = originalFindById; });

  const req = { user: { id: 'user-1', role: 'admin' } };
  const res = response();
  let nextCalled = false;
  await requireRole('admin')(req, res, () => { nextCalled = true; });

  assert.equal(req.user.role, 'tourist');
  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
});

test('admin bootstrap refuses an existing admin and releases its lock', async () => {
  const { bootstrapAdmin } = require('../scripts/bootstrap-admin');
  let lockReleased = false;
  const lockCollection = {
    async findOneAndUpdate() { return { owner: 'lock-owner' }; },
    async deleteOne() { lockReleased = true; },
  };

  await assert.rejects(
    bootstrapAdmin({
      UserModel: { async exists() { return true; } },
      lockCollection,
      credentials: { name: 'Admin', email: 'admin@example.com', location: 'Cairo', password: 'correct horse' },
    }),
    /admin account already exists/i,
  );
  assert.equal(lockReleased, true);
});

test('admin bootstrap hashes the password and creates only an admin role', async () => {
  const { bootstrapAdmin } = require('../scripts/bootstrap-admin');
  const bcrypt = require('bcryptjs');
  let created;
  const lockCollection = {
    async findOneAndUpdate() { return { owner: 'lock-owner' }; },
    async deleteOne() {},
  };

  const result = await bootstrapAdmin({
    UserModel: {
      async exists() { return false; },
      async create(user) { created = user; return { _id: 'admin-id' }; },
    },
    lockCollection,
    credentials: { name: 'Admin', email: 'admin@example.com', location: 'Cairo', password: 'correct horse' },
  });

  assert.equal(result.id, 'admin-id');
  assert.equal(created.role, 'admin');
  assert.equal(await bcrypt.compare('correct horse', created.password), true);
});
