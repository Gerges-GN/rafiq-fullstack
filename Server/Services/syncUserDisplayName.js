const Profile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');

module.exports = async function syncUserDisplayName(userId, name) {
  const results = await Promise.allSettled([
    Profile.updateMany({ owner: userId }, { $set: { ownerName: name } }),
    TourGuideProfile.updateMany({ owner: userId }, { $set: { name } }),
    Review.updateMany({ reviewerId: userId }, { $set: { reviewerName: name } }),
    Review.updateMany({ entityType: 'Guide', tourGuideId: userId }, { $set: { entityName: name } }),
    Booking.updateMany({ touristId: userId }, { $set: { touristName: name } }),
    Booking.updateMany({ tourGuideId: userId }, { $set: { tourGuideName: name } }),
  ]);

  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('Related display names could not be synchronized.');
  }
};
