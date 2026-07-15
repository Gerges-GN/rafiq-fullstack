import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, MessageCircle, Globe, PlusCircle } from "lucide-react";

import Navbar from "../../Components/Layout/TouristNav";
import ProfileHeader from "../../Components/Tourist/ProfileHeader";
import Sidebar from "../../Components/Tourist/sidebartourist";
import Feed from "../../Components/Tourist/Feed";
import ChatWidget from "../../Features/chat/index";
import CreateProfileModal from "../../Components/modals/CreateProfileModal";
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const fetchProfile = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");
        setProfileNotFound(false);

        const response = await fetch(
          `${API_BASE_URL}/profiles/${userId}`,
          {
            signal,
          },
        );

        if (response.status === 404) {
          setProfileNotFound(true);
          setProfileData(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        setProfileData(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    fetchProfile(controller.signal);

    return () => controller.abort();
  }, [userId, fetchProfile]);

  const handleProfileCreated = () => {
    setCreateModalOpen(false);
    const controller = new AbortController();
    fetchProfile(controller.signal);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-lg font-medium text-gray-500">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (profileNotFound) {
    return (
      <>
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <PlusCircle className="w-12 h-12 text-orange-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">No Profile Yet</h2>

            <p className="text-gray-500 mt-3">
              Create your profile and start sharing your travel memories with
              everyone.
            </p>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-8 bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-3 rounded-xl font-semibold"
            >
              Create Profile
            </button>
          </div>
        </div>
        <CreateProfileModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          userId={userId}
          onProfileCreated={handleProfileCreated}
        />
      </>
    );
  }

  if (!profileData) {
    return null;
  }

  const user = {
    // Uses owner.username if populated; falls back to ownerName if present
    name:
      profileData.owner?.username || profileData.ownerName || "Unknown User",
    isVerified: profileData.isVerified || false,
    tagline: profileData.headline || "",
    location: profileData.location || "",
    joinedDate: profileData.createdAt
      ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "",
    avatarUrl:
      profileData.avatarUrl ||
      "https://ui-avatars.com/api/?name=User&background=f97316&color=fff",
    coverUrl:
      profileData.coverUrl ||
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  };

  const stats = [
    {
      label: "Trips",
      value: profileData.num_trips ?? 0,
    },
    {
      label: "Posts",
      value: profileData.num_posts ?? 0,
    },
    {
      label: "Followers",
      value: profileData.num_followers ?? 0,
    },
    {
      label: "Following",
      value: profileData.num_following ?? 0,
    },
  ];

  const about = {
    quote: profileData.quote || "",
    bio: profileData.bio || "",
    details: [
      {
        icon: MapPin,
        label: "From",
        value: profileData.location || "Unknown",
      },
      {
        icon: MessageCircle,
        label: "Language",
        value:
          profileData.languages?.length > 0
            ? profileData.languages.join(", ")
            : "Not specified",
      },
      {
        icon: Globe,
        label: "Website",
        value: profileData.website || "No website",
        link: profileData.website || "",
      },
    ],
  };

  const posts = (profileData.posts || []).map((post) => ({
    id: post._id,
    location: post.tripLocation,
    imageCount: `1/${post.images?.length || 1}`,
    imageUrl: post.images?.[0],
    images:
      post.images && post.images.length > 0
        ? post.images
        : post.imageUrl
          ? [post.imageUrl]
          : [],
    title: post.title,
    date: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    description: post.description,
    likes: post.numLikes ?? 0,
    comments: post.numComments ?? 0,
    saved: post.saved ?? false,
  }));

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-orange-100 selection:text-orange-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ChatWidget></ChatWidget>
        <ProfileHeader user={user} stats={stats} id={userId} />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0">
            <Sidebar info={about} />
          </aside>

          <section className="flex-1 min-w-0">
            <Feed posts={posts} />
          </section>
        </div>
      </main>
    </div>
  );
}
