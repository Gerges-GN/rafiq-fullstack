// Read-only preflight: prints only the database name and document counts.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/User');
const models = {
  TouristProfile: require('../Models/TouristProfile'),
  TourGuideProfile: require('../Models/TourGuideProfile'),
  Place: require('../Models/Place'),
  Trip: require('../Models/Trip'),
  Booking: require('../Models/Booking'),
  Review: require('../Models/Review'),
  Post: require('../Models/Post'),
  Chat: require('../Models/Chat'),
};

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);
  const roles = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const counts = {};
  for (const [name, Model] of Object.entries(models)) counts[name] = await Model.countDocuments();
  const database = mongoose.connection.name;
  const [users, touristProfiles, guideProfiles, places, trips, bookings, reviews, posts, chats] = await Promise.all([
    User.find().select('_id role email name').lean(),
    models.TouristProfile.find().select('owner avatarUrl coverUrl').lean(),
    models.TourGuideProfile.find().select('owner status verified avatarUrl').lean(),
    models.Place.find().select('_id imageUrl').lean(),
    models.Trip.find().select('_id tourGuideId images').lean(),
    models.Booking.find().select('touristId tourGuideId tripId status touristimg tourguideimg').lean(),
    models.Review.find().select('reviewerId entityType tourGuideId placeId rating reviewerAvatarUrl entityAvatarUrl').lean(),
    models.Post.find().select('owner images').lean(),
    models.Chat.find().select('touristId tourGuideId messages.writerId').lean(),
  ]);
  const userById = new Map(users.map((user) => [String(user._id), user]));
  const guideByOwner = new Map(guideProfiles.map((profile) => [String(profile.owner), profile]));
  const placeIds = new Set(places.map((place) => String(place._id)));
  const tripById = new Map(trips.map((trip) => [String(trip._id), trip]));
  const orphaned = {
    touristProfiles: touristProfiles.filter((profile) => !userById.has(String(profile.owner))).length,
    guideProfiles: guideProfiles.filter((profile) => !userById.has(String(profile.owner))).length,
    trips: trips.filter((trip) => userById.get(String(trip.tourGuideId))?.role !== 'tourguide' || guideByOwner.get(String(trip.tourGuideId))?.status !== 'approved' || guideByOwner.get(String(trip.tourGuideId))?.verified !== true).length,
    bookings: bookings.filter((booking) => userById.get(String(booking.touristId))?.role !== 'tourist' || userById.get(String(booking.tourGuideId))?.role !== 'tourguide' || tripById.get(String(booking.tripId))?.tourGuideId.toString() !== String(booking.tourGuideId)).length,
    reviews: reviews.filter((review) => !userById.has(String(review.reviewerId)) || (review.entityType === 'Guide' && !guideByOwner.has(String(review.tourGuideId))) || (review.entityType === 'Place' && !placeIds.has(String(review.placeId))) || review.rating < 1 || review.rating > 5).length,
    posts: posts.filter((post) => !userById.has(String(post.owner))).length,
    chats: chats.filter((chat) => userById.get(String(chat.touristId))?.role !== 'tourist' || userById.get(String(chat.tourGuideId))?.role !== 'tourguide' || chat.messages.some((message) => ![String(chat.touristId), String(chat.tourGuideId)].includes(String(message.writerId)))).length,
  };
  const duplicateDemoAccounts = await User.aggregate([
    { $match: { email: /^demo\./i } },
    { $group: { _id: '$email', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'count' },
  ]);
  const demoNamespaceUsers = await User.countDocuments({ email: /^demo\./i });
  const legacyGuides = await User.find({ role: 'tourguide', email: { $not: /^demo\./i } }).select('_id createdAt').lean();
  const legacyGuideDetails = [];
  for (const guide of legacyGuides) {
    const profile = await models.TourGuideProfile.findOne({ owner: guide._id }).select('status verified').lean();
    legacyGuideDetails.push({ createdAt: guide.createdAt || null, profileStatus: profile?.status || null, verified: profile?.verified || false });
  }
  const demoUserIds = new Set(users.filter((user) => /^demo\./i.test(user.email)).map((user) => String(user._id)));
  const candidateImages = [
    ...touristProfiles.filter((profile) => demoUserIds.has(String(profile.owner))).flatMap((profile) => [profile.avatarUrl, profile.coverUrl]),
    ...guideProfiles.filter((profile) => demoUserIds.has(String(profile.owner))).map((profile) => profile.avatarUrl),
    ...places.map((place) => place.imageUrl),
    ...trips.filter((trip) => demoUserIds.has(String(trip.tourGuideId))).flatMap((trip) => trip.images),
    ...bookings.filter((booking) => demoUserIds.has(String(booking.touristId))).flatMap((booking) => [booking.touristimg, booking.tourguideimg]),
    ...reviews.filter((review) => demoUserIds.has(String(review.reviewerId))).flatMap((review) => [review.reviewerAvatarUrl, review.entityAvatarUrl]),
    ...posts.filter((post) => demoUserIds.has(String(post.owner))).flatMap((post) => post.images),
  ].filter((url) => typeof url === 'string' && url.startsWith('http'));
  const uniqueImages = [...new Set(candidateImages)];
  const cloudinaryImages = uniqueImages.filter((url) => url.includes('res.cloudinary.com'));
  const imageChecks = [];
  for (const url of cloudinaryImages) {
    try {
      const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(12000) });
      imageChecks.push({ ok: response.ok, imageContentType: response.headers.get('content-type')?.startsWith('image/') || false });
    } catch {
      imageChecks.push({ ok: false, imageContentType: false });
    }
  }
  const images = {
    uniqueUrls: uniqueImages.length,
    cloudinaryUrls: cloudinaryImages.length,
    unsplashUrlsRemaining: uniqueImages.filter((url) => url.includes('images.unsplash.com')).length,
    optimizedDeliveryUrls: cloudinaryImages.filter((url) => url.includes('f_auto') && url.includes('q_auto') && url.includes('w_900') && url.includes('h_600')).length,
    healthChecks: imageChecks.length,
    healthyImageResponses: imageChecks.filter((item) => item.ok && item.imageContentType).length,
  };
  console.log(JSON.stringify({ database, usersByRole: roles, demoNamespaceUsers, existingNonDemoGuides: legacyGuideDetails, counts, duplicateDemoAccountEmails: duplicateDemoAccounts[0]?.count || 0, orphaned, images }, null, 2));
}

main().catch(() => {
  console.error('Read-only database inspection failed. No records were changed.');
  process.exitCode = 1;
}).finally(async () => { await mongoose.disconnect(); });
