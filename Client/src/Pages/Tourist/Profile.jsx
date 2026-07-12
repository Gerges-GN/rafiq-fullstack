import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, MessageCircle, Globe
} from 'lucide-react';
import Navbar from '../../Components/Layout/TouristNav';
import ProfileHeader from '../../Components/Tourist/ProfileHeader';
import Sidebar from '../../Components/Tourist/sidebar';
import Feed from '../../Components/Tourist/Feed';

export default function Profile() {
  const { userId } = useParams(); // expects route like /profile/:userId
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Guard: don't fetch if there's no userId yet (e.g. route still resolving)
    if (!userId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/profiles/${userId}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        // Ignore abort errors — they happen when the component unmounts/re-runs, not a real failure
        if (err.name !== 'AbortError') {
          console.error('Fetch profile error:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup: cancel the request if userId changes or component unmounts
    return () => controller.abort();
  }, [userId]); // only re-runs when userId actually changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Profile not found.</p>
      </div>
    );
  }

  // --- Map backend data shape to what your components expect ---

  const user = {
    name: profileData.owner?.username || "Unknown",
    isVerified: profileData.isVerified,
    tagline: profileData.headline,
    location: profileData.location,
    joinedDate: profileData.createdAt
      ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
      : '',
    avatarUrl: profileData.avatarUrl,
    coverUrl: profileData.coverUrl,
  };

  const stats = [
    { label: "Trips", value: profileData.num_trips ?? 0 },
    { label: "Posts", value: profileData.num_posts ?? 0 },
    { label: "Followers", value: profileData.num_followers ?? 0 },
    { label: "Following", value: profileData.num_following ?? 0 },
  ];

  const about = {
    quote: profileData.quote,
    bio: profileData.bio,
    details: [
      { icon: MapPin, label: "From", value: profileData.location },
      { icon: MessageCircle, label: "Language", value: profileData.languages?.join(', ') },
      { icon: Globe, label: "Website", value: profileData.website, link: profileData.website },
    ]
  };

  const posts = (profileData.posts || []).map((post) => ({
    id: post._id,
    location: post.tripLocation,
    imageCount: `1/${post.images?.length || 1}`,
    imageUrl: post.images?.[0],
    images: post.images && post.images.length > 0 ? post.images : (post.imageUrl ? [post.imageUrl] : []), // 👈 full array for the modal carousel
    title: post.title,
    date: post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : '',
    description: post.description,
    likes: post.numLikes,
    comments: post.numComments,
    saved: post.saved,
  }));
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-orange-100 selection:text-orange-900">
      <Navbar userAvatar={user.avatarUrl} userId={userId}/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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