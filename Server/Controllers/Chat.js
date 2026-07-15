const Chat = require('../Models/Chat');

// POST /api/chats
// Creates a chat between a tourist and a tour guide (or returns the existing one)
exports.createChat = async (req, res) => {
  try {
    const { touristId, tourGuideId } = req.body;

    if (!touristId || !tourGuideId) {
      return res
        .status(400)
        .json({ message: 'touristId and tourGuideId are required.' });
    }

    let chat = await Chat.findOne({ touristId, tourGuideId });

    if (!chat) {
      chat = await Chat.create({ touristId, tourGuideId, messages: [] });
    }

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/chats/:id/messages
// Adds a message to an existing chat
exports.sendMessage = async (req, res) => {
  try {
    const { writerId, content } = req.body;

    if (!writerId || !content) {
      return res
        .status(400)
        .json({ message: 'writerId and content are required.' });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      writerId,
      content,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chats/:id
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/chats/user/:userId
// Returns all chats where the user is either the tourist or the tour guide
exports.getChatsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      $or: [{ touristId: userId }, { tourGuideId: userId }],
    }).sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/chats/:id
exports.deleteChat = async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);

    if (!deletedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/chats/:id/messages/:messageId
exports.editMessage = async (req, res) => {
  try {
    const { content, writerId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (writerId && message.writerId.toString() !== writerId.toString()) {
      return res
        .status(403)
        .json({ message: 'Only the message author can edit this message.' });
    }

    message.content = content.trim();
    message.edited = true;

    await chat.save();

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/chats/:id/messages/:messageId
exports.deleteMessage = async (req, res) => {
  try {
    const { writerId } = req.body;

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (writerId && message.writerId.toString() !== writerId.toString()) {
      return res
        .status(403)
        .json({ message: 'Only the message author can delete this message.' });
    }

    message.deleteOne();
    await chat.save();

    res.status(200).json({ message: 'Message deleted successfully', chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};