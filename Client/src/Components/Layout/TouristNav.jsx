import { useState, useEffect } from "react";
import { authFetch } from '../../services/authFetch';
import { Home, Compass, Map, Users, Percent, Menu, X, Plus, LogOut } from "lucide-react";
import logo from "../../../public/images/logo.png";
import AddPostModal from "../Tourist/addpostmodal";
import Avatar from "../common/Avatar";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../auth/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
const Navbar = ({ className = "", verifiedUser }) => {
  const { user: serverUser, status: authStatus, logout } = useAuth();
  const navigate = useNavigate();
  const authUser = verifiedUser || serverUser;
  const isAuthenticated = Boolean(authUser?._id);
  const authLoading = authStatus === 'loading' || authStatus === 'refreshing';
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setProfileError(false);
    if (!isAuthenticated || !authUser?._id || authUser.role !== 'tourist') {
      setProfileLoading(false);
      return () => { cancelled = true; };
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/profiles/${authUser._id}`);
        if (res.status === 404) return;
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfileError(true);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [authUser?._id, authUser?.role, isAuthenticated]);

  const isTourist = authUser?.role === 'tourist';
  const canAddMemory = authUser?.role === 'tourguide' || Boolean(profile?.bio?.trim() && profile?.location?.trim());
  const profileDestination = profile ? '/tourist/profile/edit' : '/tourist/profile';
  const memoryUnavailableMessage = profileError
    ? 'We could not verify your profile. Please try again.'
    : profileLoading
      ? 'Checking your profile…'
      : profile
        ? 'Add a short bio and your location before sharing a Memory.'
        : 'Create your profile, then add a short bio and your location.';

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setIsAddPostOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { name: "Home", icon: Home, path: "/" },
        { name: "Trips", icon: Compass, path: "/tourist/trips" },
        { name: "Places", icon: Map, path: "/places" },
        { name: "Guides", icon: Users, path: "/guides" },
        { name: "Bookings", icon: Percent, path: "/tourist/bookings" },
      ]
    : [
        { name: "Home", icon: Home, path: "/" },
        { name: "Places", icon: Map, path: "/places" },
        { name: "Guides", icon: Users, path: "/guides" },
      ];

  // Fall back to the avatar already saved at login if the profile fetch
  // hasn't resolved yet (or failed), and finally to a placeholder.
  const avatarUrl = profile?.avatarUrl || authUser?.avatarUrl || "";

  return (
    <nav
      className={`bg-white/100 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-2.5 sm:px-6 lg:px-10">
        <Link to="/" aria-label="Rafiq home" className="flex shrink-0 items-center gap-2 font-bold text-xl text-gray-900">
          <img
            src={logo}
            alt="Rafiq Logo"
            className="h-12 w-12 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <span className="tracking-tight">Rafiq</span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-gray-200/70 bg-gray-100/60 p-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) => `flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${isActive ? "bg-white text-[#C94D13] shadow-sm" : "text-gray-600 hover:bg-white/80 hover:text-[#C94D13]"}`}
              >
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 z-10">
          {isAuthenticated ? (
            <>
              {(authUser.role === 'tourist' || authUser.role === 'tourguide') && (
                <div className="hidden flex-col items-end gap-1 sm:flex">
                  <button
                    type="button"
                    onClick={() => setIsAddPostOpen(true)}
                    disabled={isTourist && (!canAddMemory || profileLoading || profileError)}
                    title={isTourist && !canAddMemory ? memoryUnavailableMessage : undefined}
                    className="flex items-center gap-2 rounded-full bg-orange-500 p-2 text-sm font-medium text-white shadow-sm shadow-orange-500/20 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 disabled:shadow-none"
                  >
                    <Plus className="h-4 w-4" /> 
                  </button>
                  {isTourist && !canAddMemory && !profileLoading && (
                    <Link to={profileDestination} className="max-w-[190px] text-right text-[11px] leading-tight text-gray-500 hover:text-[#C94D13]">
                      {memoryUnavailableMessage} Complete profile
                    </Link>
                  )}
                </div>
              )}
              <Link to={authUser.role === "admin" ? "/admin/dashboard" : authUser.role === "tourguide" ? "/guide/dashboard" : "/tourist/profile"} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-orange-50 text-sm font-bold text-orange-700" aria-label={`Open account for ${authUser.name || 'user'}`}>
                <Avatar src={avatarUrl} alt={authUser.name || "Account"} size="xs" />
              </Link>
              {/* <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-700 lg:block">{authUser.name}</span> */}
              <button type="button" onClick={handleLogout} className="hidden items-center gap-2 rounded-full border border-gray-200 p-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:flex" aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : authLoading ? (
            <div className="h-9 w-40 animate-pulse rounded-full bg-gray-100" aria-label="Restoring your sign-in" />
          ) : (
            <div className="hidden items-center gap-4 text-sm font-semibold sm:flex">
              <Link to="/register" className="text-gray-700 transition-colors hover:text-[#C94D13]">Join</Link>
              <Link to="/trip-planner#ai-plan-maker" className="inline-flex items-center gap-2 rounded-full bg-[#161614] px-4 py-2.5 text-white transition-colors hover:bg-[#C94D13]">
                <Compass className="h-4 w-4" /> AI Planner
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
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
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-orange-50 text-[#C94D13]" : "text-gray-600 hover:bg-orange-50 hover:text-[#C94D13]"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
          </div>

          {isAuthenticated ? (
            <div className="mt-2 border-t border-gray-100 pt-3">
              {(authUser.role === 'tourist' || authUser.role === 'tourguide') && <>
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); setIsAddPostOpen(true); }}
                  disabled={isTourist && (!canAddMemory || profileLoading || profileError)}
                  title={isTourist && !canAddMemory ? memoryUnavailableMessage : undefined}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                >
                  <Plus className="h-4 w-4" /> Add Memory
                </button>
                {isTourist && !canAddMemory && (
                  <p className="mt-2 text-center text-xs text-gray-600">
                    {memoryUnavailableMessage}{' '}
                    <Link to={profileDestination} onClick={() => setIsMobileMenuOpen(false)} className="font-semibold text-[#C94D13] underline">Complete your profile</Link>
                  </p>
                )}
              </>}
              <button type="button" onClick={handleLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : authLoading ? (
            <p className="mt-3 border-t border-gray-100 pt-3 text-center text-xs text-gray-500">Restoring your sign-in…</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
              <Link className="rounded-lg border border-gray-200 px-2 py-2.5 text-center text-xs font-semibold" to="/register" onClick={() => setIsMobileMenuOpen(false)}>Join</Link>
              <Link className="rounded-lg bg-[#161614] px-2 py-2.5 text-center text-xs font-semibold text-white" to="/trip-planner#ai-plan-maker" onClick={() => setIsMobileMenuOpen(false)}>AI Planner</Link>
            </div>
          )}
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
