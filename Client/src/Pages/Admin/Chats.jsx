import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Users, 
  MessageCircle,
  HelpCircle,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../Components/Layout/DashboardLayout.jsx";
import { currentAdmin } from "../../data/mockData.js";
import { fetchChats, fetchChatDetails, deleteChat } from "../../services/api.js";
import { Toast, useToast, fadeUp, scaleIn } from "./Adminshared.jsx";

export default function Chats() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActiveLoading, setIsActiveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast, showToast, dismiss } = useToast();
  const chatBottomRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const activePollRef = useRef(null);

  // Fetch all chats
  const loadChats = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const data = await fetchChats();
      setChats(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      if (!isBackground) setError("Failed to load active chats");
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Fetch active chat details (includes full messages history)
  const loadActiveChatDetails = async (chatId, isBackground = false) => {
    if (!chatId) return;
    try {
      if (!isBackground) setIsActiveLoading(true);
      const detailedChat = await fetchChatDetails(chatId);
      setActiveChat(detailedChat);
    } catch (err) {
      console.error(err);
      showToast("Failed to refresh active chat details", "error");
    } finally {
      if (!isBackground) setIsActiveLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadChats();
  }, []);

  // Poll chats list and active chat details
  useEffect(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (activePollRef.current) clearInterval(activePollRef.current);

    if (isLive) {
      pollIntervalRef.current = setInterval(() => {
        loadChats(true);
      }, 10000); // Poll list every 10 seconds
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isLive]);

  // Handle active chat polling separately when activeChat changes
  useEffect(() => {
    if (activePollRef.current) clearInterval(activePollRef.current);
    
    if (isLive && activeChat?._id) {
      activePollRef.current = setInterval(() => {
        loadActiveChatDetails(activeChat._id, true);
      }, 5000); // Poll active chat every 5 seconds for live feed
    }

    return () => {
      if (activePollRef.current) clearInterval(activePollRef.current);
    };
  }, [isLive, activeChat?._id]);

  // Scroll to bottom of message list on active chat update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages?.length]);

  // Terminate chat session
  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;
    setIsDeleting(true);
    try {
      await deleteChat(chatToDelete);
      showToast("Chat session terminated successfully", "success");
      
      // Update UI state
      setChats(prev => prev.filter(c => c._id !== chatToDelete));
      if (activeChat?._id === chatToDelete) {
        setActiveChat(null);
      }
      setChatToDelete(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to terminate chat session", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Search filter
  const filteredChats = chats.filter(chat => {
    const touristName = chat.touristId?.name || "";
    const touristEmail = chat.touristId?.email || "";
    const guideName = chat.tourGuideId?.name || "";
    const guideEmail = chat.tourGuideId?.email || "";
    const q = searchQuery.toLowerCase();
    
    return (
      touristName.toLowerCase().includes(q) ||
      touristEmail.toLowerCase().includes(q) ||
      guideName.toLowerCase().includes(q) ||
      guideEmail.toLowerCase().includes(q)
    );
  });

  // Calculate statistics
  const totalMonitored = chats.length;
  const totalMessages = chats.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const uniqueGuides = new Set(chats.map(c => c.tourGuideId?._id).filter(Boolean)).size;
  const uniqueTourists = new Set(chats.map(c => c.touristId?._id).filter(Boolean)).size;

  // Helper to resolve sender details
  const getSenderDetails = (writerId) => {
    if (!activeChat) return {};
    const touristId = activeChat.touristId?._id || activeChat.touristId;
    const guideId = activeChat.tourGuideId?._id || activeChat.tourGuideId;
    
    if (writerId === touristId) {
      return {
        name: activeChat.touristId?.name || "Tourist",
        role: "Tourist",
        isTourist: true,
        bubbleClass: "bg-orange-50 border border-orange-100 text-gray-800 rounded-2xl rounded-tl-none self-start",
        badgeClass: "bg-orange-100 text-[#fe6800]",
      };
    } else if (writerId === guideId) {
      return {
        name: activeChat.tourGuideId?.name || "Tour Guide",
        role: "Guide",
        isTourist: false,
        bubbleClass: "bg-blue-50 border border-blue-100 text-gray-800 rounded-2xl rounded-tr-none self-end ml-auto",
        badgeClass: "bg-blue-100 text-blue-700",
      };
    }
    return {
      name: "Unknown User",
      role: "User",
      isTourist: false,
      bubbleClass: "bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl self-start",
      badgeClass: "bg-gray-200 text-gray-600",
    };
  };

  return (
    <DashboardLayout
      sidebarProps={{ footer: "logout" }}
      topbarProps={{ title: "Admin Panel - Chat Monitor", user: currentAdmin.places }}
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Chats Monitored", value: totalMonitored, icon: MessageSquare, color: "bg-orange-500" },
            { label: "Messages Exchanged", value: totalMessages, icon: MessageCircle, color: "bg-blue-500" },
            { label: "Active Tour Guides", value: uniqueGuides, icon: Users, color: "bg-purple-500" },
            { label: "Active Tourists", value: uniqueTourists, icon: Users, color: "bg-green-500" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp(idx * 0.05)}
              initial="initial"
              animate="animate"
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={20} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Controls & Feed Status */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by tourist/guide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#fe6800] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Live Monitoring Toggle */}
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
              <label className="text-sm font-medium text-gray-600 cursor-pointer flex items-center gap-1.5 select-none" onClick={() => setIsLive(!isLive)}>
                {isLive ? "Live Monitoring Active" : "Live Monitoring Paused"}
              </label>
              <button 
                onClick={() => loadChats()} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                title="Force refresh chat lists"
              >
                <RefreshCw size={15} className={`${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-22rem)] min-h-[500px]">
          {/* Chats Directory List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#fe6800]" /> Active Sessions
              </h2>
              <span className="text-xs bg-orange-50 text-[#fe6800] font-semibold px-2.5 py-0.5 rounded-full">
                {filteredChats.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-red-500">
                  <AlertCircle size={24} className="mb-2 text-red-400" />
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                  <MessageSquare size={36} className="mb-2 text-gray-200" />
                  <p className="text-sm">No chat sessions found</p>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const tourist = chat.touristId?.name || "Unknown Tourist";
                  const guide = chat.tourGuideId?.name || "Unknown Guide";
                  const isSelected = activeChat?._id === chat._id;
                  const lastMsg = chat.messages?.[chat.messages.length - 1];

                  return (
                    <button
                      key={chat._id}
                      onClick={() => {
                        setActiveChat(chat);
                        loadActiveChatDetails(chat._id);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-start justify-between border ${
                        isSelected 
                          ? "bg-orange-50/50 border-orange-200/60 shadow-sm" 
                          : "bg-white border-transparent hover:bg-gray-50/60"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-gray-900 truncate max-w-[100px]">{tourist}</span>
                          <span className="text-[10px] text-gray-300">↔</span>
                          <span className="text-xs font-semibold text-blue-700 truncate max-w-[100px]">{guide}</span>
                        </div>
                        
                        <p className="text-xs text-gray-500 truncate mt-1.5 font-normal">
                          {lastMsg ? lastMsg.content : <span className="italic text-gray-300">Empty chat</span>}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-medium">
                          <Clock size={11} />
                          <span>
                            {new Date(chat.updatedAt || chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{chat.messages?.length || 0} messages</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 items-end ml-2 shrink-0">
                        {/* Terminate Chat Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setChatToDelete(chat._id);
                          }}
                          className="p-1 hover:bg-red-50 hover:text-red-600 text-gray-300 rounded transition-colors"
                          title="Terminate this chat session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Monitor Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden lg:col-span-2">
            {activeChat ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-950 flex items-center gap-1.5">
                        {activeChat.touristId?.name || "Tourist"} 
                        <span className="text-gray-300 font-light text-sm">and</span> 
                        <span className="text-blue-800">{activeChat.tourGuideId?.name || "Guide"}</span>
                      </h3>
                      {isActiveLoading && <Loader2 size={13} className="animate-spin text-orange-500" />}
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                      <ShieldAlert size={12} className="text-amber-500" /> Administrative Monitoring Mode • Read Only
                    </p>
                  </div>
                  
                  {/* Delete Option */}
                  <button
                    onClick={() => setChatToDelete(activeChat._id)}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-xl border border-red-200/50 transition-colors"
                  >
                    <Trash2 size={13} /> Terminate Session
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                  {activeChat.messages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                      <Clock size={28} className="mb-1 text-gray-300" />
                      <p className="text-xs">No messages sent in this session yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {activeChat.messages.map((msg, index) => {
                        const sender = getSenderDetails(msg.writerId);
                        const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex flex-col max-w-[80%] ${sender.isTourist ? 'self-start' : 'self-end ml-auto'}`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 select-none">
                              <span className="text-[10px] font-bold text-gray-700">{sender.name}</span>
                              <span className={`text-[9px] font-semibold px-1 rounded ${sender.badgeClass}`}>
                                {sender.role}
                              </span>
                            </div>
                            <div className={`p-3 text-sm shadow-sm ${sender.bubbleClass}`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-gray-400 font-medium">
                                <span>{msgTime}</span>
                                {msg.edited && <span className="italic">(edited)</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatBottomRef} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-gray-50/20">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#fe6800] flex items-center justify-center mb-3">
                  <ShieldAlert size={30} />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">Select a Conversation Log</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Choose an active chat session from the side list to monitor live messages, verify guide compliance, and moderate if necessary.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete/Terminate Confirmation Dialog */}
      <AnimatePresence>
        {chatToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Modal */}
            <motion.div
              variants={scaleIn(0)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative z-10 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-950">Terminate Chat Session?</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    This action will permanently delete the chat history and close the session between the tourist and tour guide. They will lose access to all exchanged messages. This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setChatToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors disabled:bg-red-400"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Terminating...
                    </>
                  ) : (
                    "Yes, Terminate Session"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onDismiss={dismiss} />
    </DashboardLayout>
  );
}
