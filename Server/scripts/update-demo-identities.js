require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const User = require('../Models/User');
const TouristProfile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Trip = require('../Models/Trip');
const Post = require('../Models/Post');
const Chat = require('../Models/Chat');
const { buildDemoIdentityPlan } = require('../Services/demoIdentity');

const avatarDirectory = path.join(__dirname, '..', '..', 'Client', 'public', 'avatars');
const avatarFiles = fs.readdirSync(avatarDirectory)
  .filter((file) => file.toLowerCase().endsWith('.png'))
  .sort();

function fail(message) {
  throw new Error(`Safety stop: ${message} No database records were changed.`);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  if (avatarFiles.length !== 50) fail(`expected 50 existing PNG avatars; found ${avatarFiles.length}.`);
  await mongoose.connect(process.env.MONGO_URI);

  const [nonDemoUsers, demoUsers] = await Promise.all([
    User.find({ email: { $not: /^demo\./i } }).select('_id role name').lean(),
    User.find({ email: /^demo\./i }).select('_id email name role').lean(),
  ]);
  const nonDemoRoles = nonDemoUsers.reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1;
    return counts;
  }, {});
  if (nonDemoUsers.length !== 4 || nonDemoRoles.tourist !== 2 || nonDemoRoles.admin !== 1 || nonDemoRoles.tourguide !== 1) {
    fail('the original account set does not match 2 Tourists, 1 Admin, and 1 pre-existing Guide.');
  }

  const demoIdentities = buildDemoIdentityPlan(avatarFiles, nonDemoUsers.map((user) => user.name));
  const demoEmails = new Set(demoUsers.map((user) => user.email.toLowerCase()));
  if (demoUsers.length !== demoIdentities.size || demoEmails.size !== demoUsers.length || [...demoIdentities.keys()].some((email) => !demoEmails.has(email))) {
    fail(`found ${demoUsers.length} demo accounts but expected exactly ${demoIdentities.size} known demo identities.`);
  }

  const touristProfiles = await TouristProfile.find({ owner: { $in: demoUsers.map((user) => user._id) } }).lean();
  const guideProfiles = await TourGuideProfile.find({ owner: { $in: demoUsers.map((user) => user._id) } }).lean();
  const touristProfileOwners = new Set(touristProfiles.map((profile) => String(profile.owner)));
  const guideProfileByOwner = new Map(guideProfiles.map((profile) => [String(profile.owner), profile]));
  for (const user of demoUsers) {
    const identity = demoIdentities.get(user.email.toLowerCase());
    const guideProfile = guideProfileByOwner.get(String(user._id));
    if (!touristProfileOwners.has(String(user._id)) && !guideProfile) {
      fail(`demo account ${user.email} has no existing profile to update.`);
    }
    if (user.email.toLowerCase().startsWith('demo.guide.') && (!guideProfile || guideProfile.status !== 'approved' || guideProfile.verified !== true || user.role !== 'tourguide')) {
      fail(`approved demo Guide ${user.email} has inconsistent account/profile state.`);
    }
    if (user.email.toLowerCase().startsWith('demo.pending.') && (!guideProfile || (user.role === 'tourguide' && (guideProfile.status !== 'approved' || guideProfile.verified !== true)) || (user.role === 'tourist' && !['pending', 'rejected', 'suspended'].includes(guideProfile.status)))) {
      fail(`demo Guide applicant ${user.email} has inconsistent account/profile state.`);
    }
    if (user.email.toLowerCase().startsWith('demo.tourist.') && user.role !== 'tourist') {
      fail(`demo Tourist ${user.email} has an unexpected account role.`);
    }
    if (!identity.avatarUrl.startsWith('/avatars/')) fail(`demo account ${user.email} has no local avatar assignment.`);
  }

  const nonDemoGuide = nonDemoUsers.find((user) => user.role === 'tourguide');
  const originalGuideProfile = await TourGuideProfile.findOne({ owner: nonDemoGuide._id }).select('status verified').lean();
  if (!originalGuideProfile || originalGuideProfile.status !== 'pending' || originalGuideProfile.verified !== false) {
    fail('the pre-existing non-demo Guide profile is not pending and unverified.');
  }

  const ids = new Map(demoUsers.map((user) => [String(user._id), user.email.toLowerCase()]));
  const totals = Object.fromEntries([
    'users', 'touristProfiles', 'guideProfiles', 'touristBookingIdentities',
    'guideBookingIdentities', 'reviewerRecords', 'guideReviewEntities',
  ].map((key) => [key, { matched: 0, modified: 0 }]));
  const countUpdate = (key, result) => {
    totals[key].matched += result.matchedCount;
    totals[key].modified += result.modifiedCount;
  };
  for (const user of demoUsers) {
    const identity = demoIdentities.get(user.email.toLowerCase());
    const result = await User.updateOne(
      { _id: user._id, email: user.email },
      { $set: { name: identity.name } },
      { timestamps: false },
    );
    if (result.matchedCount !== 1) throw new Error(`Could not update the existing demo account ${user.email}.`);
    countUpdate('users', result);
  }

  for (const profile of touristProfiles) {
    const email = ids.get(String(profile.owner));
    const identity = demoIdentities.get(email);
    const result = await TouristProfile.updateOne(
      { _id: profile._id },
      { $set: { ownerName: identity.name, avatarUrl: identity.avatarUrl } },
      { timestamps: false },
    );
    if (result.matchedCount !== 1) throw new Error(`Could not update Tourist profile ${profile._id}.`);
    countUpdate('touristProfiles', result);
  }
  for (const profile of guideProfiles) {
    const email = ids.get(String(profile.owner));
    const identity = demoIdentities.get(email);
    const result = await TourGuideProfile.updateOne(
      { _id: profile._id },
      { $set: { name: identity.name, avatarUrl: identity.avatarUrl } },
      { timestamps: false },
    );
    if (result.matchedCount !== 1) throw new Error(`Could not update Guide profile ${profile._id}.`);
    countUpdate('guideProfiles', result);
  }

  for (const user of demoUsers) {
    const identity = demoIdentities.get(user.email.toLowerCase());
    const touristBookings = await Booking.updateMany(
      { touristId: user._id },
      { $set: { touristName: identity.name, touristimg: identity.avatarUrl } },
      { timestamps: false },
    );
    const guideBookings = await Booking.updateMany(
      { tourGuideId: user._id },
      { $set: { tourGuideName: identity.name, tourguideimg: identity.avatarUrl } },
      { timestamps: false },
    );
    const reviewerRecords = await Review.updateMany(
      { reviewerId: user._id },
      { $set: { reviewerName: identity.name, reviewerAvatarUrl: identity.avatarUrl } },
      { timestamps: false },
    );
    const guideReviewEntities = await Review.updateMany(
      { entityType: 'Guide', tourGuideId: user._id },
      { $set: { entityName: identity.name, entityAvatarUrl: identity.avatarUrl } },
      { timestamps: false },
    );
    countUpdate('touristBookingIdentities', touristBookings);
    countUpdate('guideBookingIdentities', guideBookings);
    countUpdate('reviewerRecords', reviewerRecords);
    countUpdate('guideReviewEntities', guideReviewEntities);
  }

  console.log(JSON.stringify({
    database: mongoose.connection.name,
    updated: totals,
    preservedNonDemoAccounts: nonDemoUsers.length,
    deletedRecords: 0,
    preservedRecordCounts: {
      trips: await Trip.countDocuments(),
      posts: await Post.countDocuments(),
      chats: await Chat.countDocuments(),
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(`Demo identity update failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
