const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-bytes';

const User = require('../Models/User');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Profile = require('../Models/TouristProfile');
const userController = require('../Controllers/User');
const { verifyToken } = require('../Middleware/Auth');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request({ body = {}, authorization } = {}) {
  return {
    body,
    get(name) { return name.toLowerCase() === 'authorization' ? authorization : undefined; },
  };
}

test('registration hashes the password, ignores forged roles, and returns a safe user', async (t) => {
  let saved;
  const originalSave = User.prototype.save;
  User.prototype.save = async function save() { saved = this; return this; };
  t.after(() => { User.prototype.save = originalSave; });

  const res = response();
  await userController.createUser(request({ body: {
    name: '  Test Tourist ', email: ' TEST@example.com ', password: 'correct horse', location: ' Cairo ', role: 'admin',
  } }), res);

  assert.equal(res.statusCode, 201);
  assert.equal(saved.role, 'tourist');
  assert.equal(saved.email, 'test@example.com');
  assert.notEqual(saved.password, 'correct horse');
  assert.equal(await bcrypt.compare('correct horse', saved.password), true);
  assert.equal(Object.hasOwn(res.body.user, 'password'), false);
});

test('guide registration creates a pending profile without granting guide or admin role', async (t) => {
  let saved;
  let application;
  let touristProfile;
  const originalSave = User.prototype.save;
  const originalCreate = TourGuideProfile.create;
  const originalProfileCreate = Profile.create;
  User.prototype.save = async function save() { saved = this; return this; };
  TourGuideProfile.create = async (profile) => { application = profile; return profile; };
  Profile.create = async (profile) => { touristProfile = profile; return profile; };
  t.after(() => { User.prototype.save = originalSave; TourGuideProfile.create = originalCreate; Profile.create = originalProfileCreate; });

  const res = response();
  await userController.createUser(request({ body: {
    name: 'Guide Applicant', email: 'GUIDE@example.com', password: 'correct horse', location: 'Luxor, Egypt',
    accountType: 'tourguide', role: 'admin', guideProfile: { city: 'Luxor', bio: 'Local history guide.', languages: ['Arabic', ' English '] },
  } }), res);

  assert.equal(res.statusCode, 201);
  assert.equal(saved.role, 'tourist');
  assert.equal(application.status, 'pending');
  assert.equal(application.verified, false);
  assert.equal(touristProfile.ownerName, 'Guide Applicant');
  assert.equal(touristProfile.bio, 'Local history guide.');
  assert.deepEqual(application.languages, ['Arabic', 'English']);
  assert.equal(res.body.applicationStatus, 'pending');
  assert.equal(Object.hasOwn(res.body.user, 'password'), false);
});

test('login compares the password hash and returns a verifiable expiring JWT', async (t) => {
  const originalFindOne = User.findOne;
  const originalGuideFindOne = TourGuideProfile.findOne;
  const hashed = await bcrypt.hash('correct horse', 4);
  User.findOne = () => ({ select: async () => ({
    _id: '507f1f77bcf86cd799439011', name: 'Test Tourist', email: 'test@example.com', password: hashed, role: 'tourist',
    toObject() { return { _id: this._id, name: this.name, email: this.email, password: this.password, role: this.role }; },
  }) });
  TourGuideProfile.findOne = () => ({ select: async () => null });
  t.after(() => { User.findOne = originalFindOne; TourGuideProfile.findOne = originalGuideFindOne; });

  const res = response();
  await userController.loginUser(request({ body: { email: 'test@example.com', password: 'correct horse' } }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(Object.hasOwn(res.body.user, 'password'), false);
  const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.id, '507f1f77bcf86cd799439011');
  assert.ok(decoded.exp > decoded.iat);
});

test('login rejects an incorrect password with a generic authentication response', async (t) => {
  const originalFindOne = User.findOne;
  const hashed = await bcrypt.hash('correct horse', 4);
  User.findOne = () => ({ select: async () => ({ password: hashed }) });
  t.after(() => { User.findOne = originalFindOne; });

  const res = response();
  await userController.loginUser(request({ body: { email: 'test@example.com', password: 'wrong password' } }), res);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: 'Invalid email or password.' });
});

test('authentication middleware rejects missing, malformed, invalid, and expired tokens', () => {
  const cases = [
    undefined,
    'Basic abc',
    `Bearer ${jwt.sign({ id: 'user-1' }, 'wrong-secret')}`,
    `Bearer ${jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: -1 })}`,
  ];

  for (const authorization of cases) {
    const res = response();
    let nextCalled = false;
    verifyToken(request({ authorization }), res, () => { nextCalled = true; });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.equal(res.body.message.includes(process.env.JWT_SECRET), false);
  }
});

test('authentication middleware attaches claims from a valid token', () => {
  const token = jwt.sign({ id: 'user-1', role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const req = request({ authorization: `Bearer ${token}` });
  const res = response();
  let nextCalled = false;

  verifyToken(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 'user-1');
});
