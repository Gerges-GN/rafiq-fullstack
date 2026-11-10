const Chat = require('../Models/Chat');
const User = require('../Models/User');
const TourGuideProfile = require('../Models/TourGuideProfile');
const serializeChat = require('../Services/chatIdentity');

const MAX_MESSAGE_LENGTH = 5000;

function sameId(left, right) {
  return left != null && right != null && String(left) === String(right);
}

function isParticipant(chat, userId) {
  return sameId(chat.touristId, userId) || sameId(chat.tourGuideId, userId);
}

function notFound(res) {
  return res.status(404).json({ message: 'Chat not found.' });
}

// POST /api/chats
// Creates or returns the chat involving the authenticated user and a valid counterpart.
exports.createChat = async (req, res) => {
  try {
    const { touristId, tourGuideId } = req.body || {};
    const currentUserId = req.user.id;

    if (!touristId || !tourGuideId || sameId(touristId, tourGuideId)) {
      return res.status(400).json({ message: 'Valid touristId and tourGuideId are required.' });
    }

    const isTourist = req.user.role === 'tourist' && sameId(currentUserId, touristId);
    const isGuide = req.user.role === 'tourguide' && sameId(currentUserId, tourGuideId);
    if (!isTourist && !isGuide) {
      return res.status(403).json({ message: 'You can only start chats as yourself.' });
    }

    const counterpartId = isTourist ? tourGuideId : touristId;
    const counterpartRole = isTourist ? 'tourguide' : 'tourist';
    const counterpart = await User.findById(counterpartId).select('role');
    if (!counterpart || counterpart.role !== counterpartRole) {
      return res.status(400).json({ message: 'The other participant is not eligible for this chat.' });
    }
    if (counterpartRole === 'tourguide') {
      const guideProfile = await TourGuideProfile.findOne({ owner: counterpartId }).select('status verified');
      if (!guideProfile || guideProfile.status !== 'approved' || guideProfile.verified !== true) {
        return res.status(400).json({ message: 'The other participant is not eligible for this chat.' });
      }
    }

    let chat = await Chat.findOne({ touristId, tourGuideId });
    if (!chat) chat = await Chat.create({ touristId, tourGuideId, messages: [] });

    return res.status(201).json(await serializeChat(chat));
  } catch {
    return res.status(500).json({ message: 'Unable to create chat.' });
  }
};

// POST /api/chats/:id/messages
exports.sendMessage = async (req, res) => {
  try {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: 'Message content must be between 1 and 5000 characters.' });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) return notFound(res);

    const messageIndex = chat.messages.push({
      writerId: req.user.id,
      content,
      createdAt: new Date(),
    }) - 1;
    const message = chat.messages[messageIndex];
    await chat.save();

    const serialized = await serializeChat(chat);
    const serializedMessage = serialized.messages.find((item) => String(item._id) === String(message._id));
    return res.status(201).json(serializedMessage);
  } catch {
    return res.status(500).json({ message: 'Unable to send message.' });
  }
};

// GET /api/chats/:id
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) return notFound(res);
    return res.status(200).json(await serializeChat(chat));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch chat.' });
  }
};

// GET /api/chats/user/:userId — always returns the authenticated user's chats.
exports.getChatsForUser = async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ touristId: req.user.id }, { tourGuideId: req.user.id }],
    }).sort({ updatedAt: -1 });
    return res.status(200).json(await Promise.all(chats.map(serializeChat)));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch chats.' });
  }
};

// DELETE /api/chats/:id — either participant may remove their conversation.
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) return notFound(res);
    await chat.deleteOne();
    return res.status(200).json({ message: 'Chat deleted successfully.' });
  } catch {
    return res.status(500).json({ message: 'Unable to delete chat.' });
  }
};

// PUT /api/chats/:id/messages/:messageId — only the message author may edit it.
exports.editMessage = async (req, res) => {
  try {
    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (!content || content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ message: 'Message content must be between 1 and 5000 characters.' });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) return notFound(res);
    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (!sameId(message.writerId, req.user.id)) {
      return res.status(403).json({ message: 'Only the message author can edit this message.' });
    }

    message.content = content;
    message.edited = true;
    await chat.save();
    return res.status(200).json(await serializeChat(chat));
  } catch {
    return res.status(500).json({ message: 'Unable to edit message.' });
  }
};

// DELETE /api/chats/:id/messages/:messageId — only the message author may delete it.
exports.deleteMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat || !isParticipant(chat, req.user.id)) return notFound(res);
    const message = chat.messages.id(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    if (!sameId(message.writerId, req.user.id)) {
      return res.status(403).json({ message: 'Only the message author can delete this message.' });
    }

    message.deleteOne();
    await chat.save();
    return res.status(200).json({ message: 'Message deleted successfully.', chat: await serializeChat(chat) });
  } catch {
    return res.status(500).json({ message: 'Unable to delete message.' });
  }
};
