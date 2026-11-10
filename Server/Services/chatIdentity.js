const User = require('../Models/User');
const TouristProfile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');

function toPlainChat(chat) {
  return chat?.toObject ? chat.toObject() : { ...chat };
}

async function findParticipant(userId, role) {
  const [account, profile] = await Promise.all([
    User.findById(userId).select('name'),
    role === 'tourguide'
      ? TourGuideProfile.findOne({ owner: userId }).select('avatarUrl')
      : TouristProfile.findOne({ owner: userId }).select('avatarUrl'),
  ]);

  return {
    _id: String(userId),
    name: account?.name || 'Unknown traveler',
    avatarUrl: profile?.avatarUrl || '',
  };
}

async function serializeChat(chat) {
  const value = toPlainChat(chat);
  const touristId = String(value.touristId?._id || value.touristId);
  const tourGuideId = String(value.tourGuideId?._id || value.tourGuideId);
  const [tourist, tourGuide] = await Promise.all([
    findParticipant(touristId, 'tourist'),
    findParticipant(tourGuideId, 'tourguide'),
  ]);
  const identities = new Map([[touristId, tourist], [tourGuideId, tourGuide]]);

  return {
    ...value,
    touristId,
    tourGuideId,
    participants: { tourist, tourGuide },
    messages: (value.messages || []).map((message) => {
      const writerId = String(message.writerId?._id || message.writerId);
      return {
        ...message,
        writerId,
        author: identities.get(writerId) || { _id: writerId, name: 'Unknown traveler', avatarUrl: '' },
      };
    }),
  };
}

module.exports = serializeChat;
