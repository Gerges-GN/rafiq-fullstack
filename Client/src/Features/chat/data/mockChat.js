// src/features/chat/data/mockChat.js

export const mockGuide = {
  _id: "guide_1",
  name: "Ahmed Hassan",
  avatarUrl: "https://i.pravatar.cc/100?img=12",
  isOnline: true,
};

export const mockTourist = {
  _id: "user_1",
  name: "Sarah Johnson",
  avatarUrl: "https://i.pravatar.cc/100?img=5",
  isOnline: false,
};

export const mockChat = {
  _id: "chat_1",
  touristId: "user_1",
  tourGuideId: "guide_1",
  messages: [
    {
      _id: "msg_1",
      writerId: "guide_1",
      content: "Hello! Welcome to Rafiq 👋 How can I help you plan your trip to Egypt?",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      _id: "msg_2",
      writerId: "user_1",
      content: "Hi! I'm interested in a 3-day tour of Luxor and Aswan.",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      _id: "msg_3",
      writerId: "guide_1",
      content: "Great choice! I can put together an itinerary covering the Valley of the Kings, Karnak Temple, and a Nile cruise.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
};

export const mockChatList = [
  {
    _id: "chat_1",
    tourist: mockTourist,
    guide: mockGuide,
    lastMessage: {
      content: "That sounds perfect, thank you!",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      writerId: "user_1",
    },
    unreadCount: 2,
  },
  {
    _id: "chat_2",
    tourist: {
      _id: "user_2",
      name: "Michael Chen",
      avatarUrl: "https://i.pravatar.cc/100?img=8",
    },
    guide: mockGuide,
    lastMessage: {
      content: "Is the tour available next Friday?",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      writerId: "user_2",
    },
    unreadCount: 0,
  },
];