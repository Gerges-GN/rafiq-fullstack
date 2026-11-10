const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-bytes';

const Profile = require('../Models/TouristProfile');
const GuideProfile = require('../Models/TourGuideProfile');
const Post = require('../Models/Post');
const Trip = require('../Models/Trip');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const User = require('../Models/User');
const Place = require('../Models/Place');
const touristProfileController = require('../Controllers/TouristProfile');
const guideProfileController = require('../Controllers/TourGuideProfile');
const postController = require('../Controllers/Post');
const tripController = require('../Controllers/Trip');
const bookingController = require('../Controllers/Booking');
const reviewController = require('../Controllers/Review');
const uploadController = require('../Controllers/Upload');
const placeController = require('../Controllers/Place');

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request({ id = 'owner-1', role = 'tourist', params = {}, body = {}, query = {} } = {}) {
  return { user: { id, role }, params, body, query };
}

test('tourist profile updates are owner-scoped and ignore owner, status, and counters', async (t) => {
  const original = Profile.findOneAndUpdate;
  let updateArgs;
  Profile.findOneAndUpdate = async (...args) => {
    updateArgs = args;
    return { owner: 'owner-1', bio: 'Updated' };
  };
  t.after(() => { Profile.findOneAndUpdate = original; });

  const res = response();
  await touristProfileController.updateProfile(request({
    params: { userId: 'owner-1' },
    body: { bio: 'Updated', owner: 'victim', status: 'suspicious', isVerified: true, num_followers: 999 },
  }), res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(updateArgs[0], { owner: 'owner-1' });
  assert.deepEqual(updateArgs[1], { $set: { bio: 'Updated' } });
  const denied = response();
  await touristProfileController.getProfileByUserId(request({ id: 'owner-1', params: { userId: 'victim' } }), denied);
  assert.equal(denied.statusCode, 403);
});

test('public guide profiles omit contact information and only list approved verified profiles', async (t) => {
  const originalFindOne = GuideProfile.findOne;
  const originalFind = GuideProfile.find;
  const profile = {
    _id: 'guide-profile-1', owner: 'guide-1', name: 'Guide', city: 'Cairo', status: 'approved', verified: true,
    phone: 'private-phone', email: 'private@example.com', toObject() { return { ...this }; },
  };
  let filter;
  GuideProfile.findOne = () => ({ select: async () => profile });
  GuideProfile.find = (query) => {
    filter = query;
    return { select: () => ({ sort: async () => [profile] }) };
  };
  t.after(() => { GuideProfile.findOne = originalFindOne; GuideProfile.find = originalFind; });

  const oneRes = response();
  await guideProfileController.getTourGuideProfileByOwnerId(request({ params: { ownerId: 'guide-1' } }), oneRes);
  assert.equal(oneRes.statusCode, 200);
  assert.equal(Object.hasOwn(oneRes.body, 'phone'), false);
  assert.equal(Object.hasOwn(oneRes.body, 'email'), false);

  const listRes = response();
  await guideProfileController.getTourGuideProfiles(request({ query: { verified: 'false' } }), listRes);
  assert.deepEqual(filter, { status: 'approved', verified: true });
  assert.equal(Object.hasOwn(listRes.body[0], 'email'), false);
});

test('post creation derives its owner and ignores forged ownership and counters', async (t) => {
  const originalCreate = Post.create;
  const originalProfileFindOne = Profile.findOne;
  const originalFindOneAndUpdate = Profile.findOneAndUpdate;
  const originalUserFindById = User.findById;
  let created;
  Post.create = async (doc) => { created = { _id: 'post-1', ...doc, toObject() { return { ...this }; } }; return created; };
  User.findById = () => ({ select: async () => ({ name: 'Stored owner', role: 'tourist' }) });
  Profile.findOne = () => ({ select: async () => ({ bio: 'Travel notes.', location: 'Cairo, Egypt' }) });
  Profile.findOneAndUpdate = async () => null;
  t.after(() => { Post.create = originalCreate; Profile.findOne = originalProfileFindOne; Profile.findOneAndUpdate = originalFindOneAndUpdate; User.findById = originalUserFindById; });

  const res = response();
  await postController.createPost(request({ body: {
    owner: 'victim', title: 'My trip', tripLocation: 'Cairo', images: ['https://image.test/a.jpg'], numLikes: 500, saved: true,
  } }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.owner, 'owner-1');
  assert.equal(created.numLikes, undefined);
  assert.equal(Object.hasOwn(res.body, 'saved'), false);
  assert.deepEqual(res.body.author, { _id: 'owner-1', name: 'Stored owner', avatarUrl: '' });
});

test('tourist memories require both a profile bio and location', async (t) => {
  const originalCreate = Post.create;
  const originalProfileFindOne = Profile.findOne;
  let createCalled = false;
  Post.create = async () => { createCalled = true; return {}; };
  Profile.findOne = () => ({ select: async () => ({ bio: 'A traveler.', location: '' }) });
  t.after(() => { Post.create = originalCreate; Profile.findOne = originalProfileFindOne; });

  const res = response();
  await postController.createPost(request({ body: { title: 'A memory' } }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, 'PROFILE_INCOMPLETE');
  assert.deepEqual(res.body.missingFields, ['location']);
  assert.equal(createCalled, false);
});

test('tour owner fields cannot be assigned or changed by trip requests', async (t) => {
  const originalCreate = Trip.create;
  const originalGuideFindOne = GuideProfile.findOne;
  let created;
  Trip.create = async (doc) => { created = doc; return doc; };
  GuideProfile.findOne = () => ({ select: async () => ({ status: 'approved', verified: true }) });
  t.after(() => { Trip.create = originalCreate; GuideProfile.findOne = originalGuideFindOne; });

  const res = response();
  await tripController.createTrip(request({ role: 'tourguide', body: {
    title: 'Walk', location: 'Cairo', days: 1, tourGuideId: 'victim', owner: 'victim',
  } }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.tourGuideId, 'owner-1');
  assert.equal(Object.hasOwn(created, 'owner'), false);
});

test('trips with bookings cannot be deleted through the Guide endpoint', async (t) => {
  const originalTripFindById = Trip.findById;
  const originalBookingExists = Booking.exists;
  let deleted = false;
  Trip.findById = async () => ({ _id: 'trip-1', tourGuideId: 'owner-1', async deleteOne() { deleted = true; } });
  Booking.exists = async () => ({ _id: 'booking-1' });
  t.after(() => { Trip.findById = originalTripFindById; Booking.exists = originalBookingExists; });

  const res = response();
  await tripController.deleteTrip(request({ role: 'tourguide', params: { id: 'trip-1' } }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(deleted, false);
});

test('Places with reviews cannot be deleted through the Admin endpoint', async (t) => {
  const originalReviewExists = Review.exists;
  const originalPlaceDelete = Place.findByIdAndDelete;
  let deleted = false;
  Review.exists = async () => ({ _id: 'review-1' });
  Place.findByIdAndDelete = async () => { deleted = true; return null; };
  t.after(() => { Review.exists = originalReviewExists; Place.findByIdAndDelete = originalPlaceDelete; });

  const res = response();
  await placeController.deletePlace(request({ id: 'admin-1', role: 'admin', params: { id: 'place-1' } }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(deleted, false);
});

test('booking creation derives the tourist, guide, trip, and display details from stored records', async (t) => {
  const originals = {
    trip: Trip.findById,
    user: User.findById,
    profile: Profile.findOne,
    guide: GuideProfile.findOne,
    create: Booking.create,
  };
  let created;
  Trip.findById = async () => ({ _id: 'trip-1', tourGuideId: 'guide-1', title: 'Stored trip', days: 2 });
  User.findById = (id) => ({ select: async () => ({ name: id === 'guide-1' ? 'Stored guide account' : 'Stored tourist' }) });
  Profile.findOne = () => ({ select: async () => ({ ownerName: 'Stored tourist profile', avatarUrl: 'tourist-avatar' }) });
  GuideProfile.findOne = () => ({ select: async () => ({ name: 'Stored guide', avatarUrl: 'guide-avatar', status: 'approved', verified: true }) });
  Booking.create = async (doc) => { created = doc; return doc; };
  t.after(() => {
    Trip.findById = originals.trip; User.findById = originals.user; Profile.findOne = originals.profile;
    GuideProfile.findOne = originals.guide; Booking.create = originals.create;
  });

  const res = response();
  await bookingController.createBooking(request({ body: {
    tripId: 'trip-1', touristId: 'victim', tourGuideId: 'attacker', touristName: 'Forged',
    tourGuideName: 'Forged guide', tripTitle: 'Forged trip', status: 'Confirmed',
  } }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.touristId, 'owner-1');
  assert.equal(created.tourGuideId, 'guide-1');
  assert.equal(created.touristName, 'Stored tourist');
  assert.equal(created.tourGuideName, 'Stored guide account');
  assert.equal(created.tripTitle, 'Stored trip');
  assert.equal(created.status, 'Pending');
});

test('booking list and status updates reject requests for another tourist', async () => {
  const listRes = response();
  await bookingController.getBookingsByTouristId(request({ id: 'owner-1', params: { touristId: 'victim' } }), listRes);
  assert.equal(listRes.statusCode, 403);

  const originalFindById = Booking.findById;
  Booking.findById = async () => ({ touristId: 'victim', tourGuideId: 'guide-1', status: 'Pending' });
  try {
    const updateRes = response();
    await bookingController.updateBooking(request({ id: 'owner-1', params: { id: 'booking-1' }, body: { status: 'Confirmed', touristId: 'owner-1' } }), updateRes);
    assert.equal(updateRes.statusCode, 404);
  } finally {
    Booking.findById = originalFindById;
  }
});

test('review authorship and target details come from authenticated and stored records', async (t) => {
  const originals = { user: User.findById, profile: Profile.findOne, guide: GuideProfile.findOne, create: Review.create };
  let created;
  User.findById = (id) => ({ select: async () => ({ name: id === 'guide-1' ? 'Stored guide account' : 'Stored reviewer' }) });
  Profile.findOne = () => ({ select: async () => ({ avatarUrl: 'avatar' }) });
  GuideProfile.findOne = () => ({ select: async () => ({ owner: 'guide-1', name: 'Stored guide', avatarUrl: 'guide-avatar', status: 'approved', verified: true }) });
  Review.create = async (doc) => { created = doc; return { ...doc, toObject() { return { ...this }; } }; };
  t.after(() => {
    User.findById = originals.user; Profile.findOne = originals.profile;
    GuideProfile.findOne = originals.guide; Review.create = originals.create;
  });

  const res = response();
  await reviewController.createReview(request({ body: {
    entityType: 'Guide', tourGuideId: 'guide-1', reviewerId: 'victim', reviewerName: 'Forged', entityName: 'Forged', rating: 5, text: 'Great', status: 'FLAGGED',
  } }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(created.reviewerId, 'owner-1');
  assert.equal(created.reviewerName, 'Stored reviewer');
  assert.equal(created.entityName, 'Stored guide account');
  assert.equal(created.status, 'PUBLISHED');
});

test('public review listing always queries published status and strips moderation fields', async (t) => {
  const originalFind = Review.find;
  let filter;
  Review.find = (query) => {
    filter = query;
    return { sort: async () => [{
      _id: 'review-1', reviewerName: 'Reviewer', reviewerId: 'private-id', text: 'Good', status: 'PUBLISHED', flagged: false,
      toObject() { return { ...this }; },
    }] };
  };
  t.after(() => { Review.find = originalFind; });

  const res = response();
  await reviewController.getReviews(request({ query: { status: 'FLAGGED' } }), res);
  assert.deepEqual(filter, { status: 'PUBLISHED' });
  assert.equal(Object.hasOwn(res.body[0], 'reviewerId'), false);
  assert.equal(Object.hasOwn(res.body[0], 'flagged'), false);
});

test('upload controller rejects spoofed non-image bytes before cloud upload', async () => {
  const res = response();
  await uploadController.uploadImage({ file: { buffer: Buffer.from('not an image') } }, res);
  assert.equal(res.statusCode, 400);
});

test('reports, place writes, and uploads reject requests without a token', async (t) => {
  const app = express();
  app.use('/api/reports', require('../Routes/Report'));
  app.use('/api/places', require('../Routes/Place'));
  app.use('/api/upload', require('../Routes/Upload'));
  app.use('/api/tourguide-profiles', require('../Routes/TourGuideProfile'));
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const responses = await Promise.all([
    fetch(`${base}/reports/generate`, { method: 'POST' }),
    fetch(`${base}/reports`, { method: 'GET' }),
    fetch(`${base}/places/add`, { method: 'POST' }),
    fetch(`${base}/upload/image`, { method: 'POST' }),
    fetch(`${base}/tourguide-profiles/admin/all`, { method: 'GET' }),
  ]);
  assert.deepEqual(responses.map((res) => res.status), [401, 401, 401, 401, 401]);
});

test('valid public place reads return only place content fields', async (t) => {
  const originalFindById = Place.findById;
  const place = { _id: 'place-1', name: 'Museum', city: 'Cairo', category: 'Historical', imageUrl: 'img', description: 'Public' };
  Place.findById = async () => place;
  t.after(() => { Place.findById = originalFindById; });
  const controller = require('../Controllers/Place');
  const res = response();
  await controller.getPlaceById({ params: { id: 'place-1' } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, 'Museum');
});
