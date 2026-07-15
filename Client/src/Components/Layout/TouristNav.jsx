import { useState, useEffect } from "react";
import {
  Bell,
  Home,
  Compass,
  Map,
  Users,
  Percent,
  Menu,
  X,
  Plus,
} from "lucide-react";
import logo from "../../../public/images/logo.png";
import AddPostModal from "../Tourist/AddPostModal";
import { Link } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
const Navbar = ({ className = "" }) => {
  // Read the logged-in user from storage once, synchronously, so `_id` is
  // available immediately (e.g. for AddPostModal's ownerId) without waiting
  // on the profile fetch below.
  const [authUser] = useState(() =>
    JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "null",
    ),
  );
  const [profile, setProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

  useEffect(() => {
    if (!authUser?._id) return;

    const fetchProfile = async () => {
      try {
        // NOTE: your routes are mounted at /api/profiles (plural).
        // This assumes there's a route that looks up a Profile by the
        // owner's User id — confirm that's how your backend resolves this,
        // since Profile._id and User._id are different values.
        const res = await fetch(
          `${API_BASE_URL}/profiles/${authUser._id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [authUser]);

  const navLinks = [
    { name: "Home", icon: Home, path: `/profile/${authUser._id}` },
    { name: "Trips", icon: Compass, path: "/guide/dashboard/trips" },
    { name: "Explore", icon: Map, path: "/explore" },
    { name: "Community", icon: Users, path: "/guide" },
    { name: "Deals", icon: Percent, path: "/my-deals" },
  ];

  // Fall back to the avatar already saved at login if the profile fetch
  // hasn't resolved yet (or failed), and finally to a placeholder.
  const avatarUrl =
    profile?.avatarUrl || authUser?.avatarUrl || "/images/default-avatar.png";

  return (
    <nav
      className={`bg-white/100 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-[52px] py-3 flex items-center justify-between relative">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 z-10">
          <img
            src={logo}
            alt="Rafiq Logo"
            className="w-16 h-16 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <span>Rafiq</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              <Link
                to={link.path}
                className="flex p-2.5 rounded-full text-gray-500 hover:text-orange-500 hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                <link.icon className="w-5 h-5" />
              </Link>

              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {link.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setIsAddPostOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Add Memory
          </button>

          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          <img
            src={avatarUrl}
            alt="User"
            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover cursor-pointer hover:ring-2 ring-orange-500 transition-all"
          />

          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          ))}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsAddPostOpen(true);
            }}
            className="flex items-center justify-center gap-2 mt-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Post
          </button>
        </div>
      )}

      {isAddPostOpen && (
        <AddPostModal
          ownerId={authUser?._id}
          onClose={() => setIsAddPostOpen(false)}
          onPostCreated={(newPost) => {
            console.log("New post created:", newPost);
            // Optionally: trigger a refetch/refresh of the feed here
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
