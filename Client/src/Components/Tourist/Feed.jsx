import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import PostCard from './CardMem';
import PostModal from './PostModal';

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Liked", value: "most_liked" },
];

const Feed = ({ posts }) => {
  const [activeTab, setActiveTab] = useState("My Memories");
  const [postsState, setPostsState] = useState(posts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const tabs = ["My Memories", "Saved", "Following"];
  const sortRef = useRef(null);

  useEffect(() => {
    setPostsState(posts);
  }, [posts]);

  // Close the sort dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSave = (postId, newSavedValue) => {
    setPostsState((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, saved: newSavedValue } : post
      )
    );
    setSelectedPost((prev) =>
      prev && prev.id === postId ? { ...prev, saved: newSavedValue } : prev
    );
  };

  const filteredPosts = postsState.filter((post) => {
    switch (activeTab) {
      case "Saved":
        return post.saved === true;
      default:
        return true;
    }
  });

  // Sort a COPY of the filtered array — never mutate state directly
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.date) - new Date(b.date);
      case "most_liked":
        return (b.likes || 0) - (a.likes || 0);
      case "latest":
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Latest";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar pb-px">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 mr-4 sm:mr-6 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? "text-orange-500" : "text-gray-500 hover:text-gray-900"
              }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 sm:pb-0">
          <button className="px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full shadow-sm whitespace-nowrap">All Posts</button>
        </div>

        {/* Sort dropdown */}
        <div className="relative w-full sm:w-auto shrink-0" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen((prev) => !prev)}
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            {currentSortLabel} <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsSortOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {option.label}
                  {sortBy === option.value && <Check className="w-4 h-4 text-orange-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {activeTab === "Saved" ? "No saved memories yet." : "No posts to show."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onToggleSave={handleToggleSave}
              onOpenPost={setSelectedPost}
            />
          ))}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Feed;