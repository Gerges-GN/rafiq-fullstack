import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, User, MessageCircle, Loader2, AlertTriangle, Sparkles, Trash2, CheckCircle2, XCircle, Save, PlusCircle } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import GuideInbox from "../../Features/chat/pages/GuideInbox";

import {
  profileApi,
  tripApi,
  bookingApi,
  uploadImage,
  DEFAULT_AVATAR,
} from "../../services/Guideapi";

import AvailabilityCard from "../../Components/Tourguide/Availabilitycard";
import NewTripForm from "../../Components/Tourguide/Newtripform";
import BookingRequests from "../../Components/Tourguide/Bookingrequests";
import TripPackagesList from "../../Components/Tourguide/Trippackageslist";
import TripDetailsModal from "../../Components/Tourguide/Tripdetailsmodal";
import ProfileView from "../../Components/Tourguide/Profileview";
import ProfileEditForm from "../../Components/Tourguide/Profileeditform";
import CreateGuideProfileModal from "../../Components/Tourguide/Createguideprofilemodal";

// --- MAIN PORTAL PAGE COMPONENT ---
const GuideDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = useOutletContext();
  const tourGuideId = user?._id;
  const [profileInfo, setProfileInfo] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState(null);

  const [notification, setNotification] = useState("");

  const showNotification = (node) => {
    setNotification(node);
    setTimeout(() => setNotification(""), 3000);
  };

  // --- Initial load: profile, trips, bookings ---
  const loadAll = useCallback(async () => {
    if (!tourGuideId) {
      setLoadError("No logged-in guide id found — can't load dashboard data.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      let profile;
      try {
        profile = await profileApi.getByOwnerId(tourGuideId);
      } catch (err) {
        // No profile created yet — prompt the guide to set one up instead of
        // silently seeding a placeholder.
        if (err.status === 404) {
          setProfileNotFound(true);
          setProfileInfo(null);
          return;
        }
        throw err;
      }

      setProfileNotFound(false);
      setProfileInfo(profile);

      const [tripsData, bookingsData] = await Promise.all([
        tripApi.getByTourGuideId(tourGuideId),
        bookingApi.getByTourGuideId(tourGuideId),
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
    } catch (err) {
      setLoadError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [tourGuideId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleProfileCreated = (newProfile) => {
    setProfileInfo(newProfile);
    setProfileNotFound(false);
    setCreateModalOpen(false);
    loadAll();
  };

  // --- Trip handlers ---
  const handleAddTrip = async ({ title, location, days, details, imageFiles }) => {
    try {
      const uploadedImages = await Promise.all(imageFiles.map(uploadImage));

      const newTrip = await tripApi.create({
        title,
        location,
        days,
        details,
        images: uploadedImages,
        tourGuideId,
      });

      setTrips((prev) => [newTrip, ...prev]);

      showNotification(
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> New trip package published
          successfully!
        </span>,
      );
    } catch (err) {
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Failed to publish trip:{" "}
          {err.message}
        </span>,
      );
      throw err;
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to remove this trip package?"))
      return;

    const previousTrips = trips;
    setTrips((prev) => prev.filter((trip) => trip._id !== tripId));

    try {
      await tripApi.remove(tripId);
      showNotification(
        <span className="flex items-center gap-1.5">
          <Trash2 className="w-4 h-4" /> Trip package removed successfully.
        </span>,
      );
    } catch (err) {
      setTrips(previousTrips);
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Couldn't delete trip:{" "}
          {err.message}
        </span>,
      );
    }
  };

  // --- Booking handlers ---
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const previousBookings = bookings;
    setBookings((prev) =>
      prev.map((booking) =>
        booking._id === bookingId ? { ...booking, status: newStatus } : booking,
      ),
    );

    try {
      const apiStatus = newStatus === "Rejected" ? "Cancelled" : newStatus;
      await bookingApi.update(bookingId, { status: apiStatus });

      if (newStatus === "Confirmed") {
        showNotification(
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Approved request from client!
          </span>,
        );
      } else {
        showNotification(
          <span className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Declined client booking.
          </span>,
        );
      }
    } catch (err) {
      setBookings(previousBookings);
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Couldn't update booking:{" "}
          {err.message}
        </span>,
      );
    }
  };

  // --- Profile handlers ---
  const handleInvalidAvatar = (message) => {
    showNotification(
      <span className="flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4" /> {message}
      </span>,
    );
  };

  const handleSaveProfile = async ({
    name,
    bio,
    city,
    languages,
    rate,
    avatarFile,
    avatarPreview,
  }) => {
    try {
      const avatarUrl = avatarFile
        ? await uploadImage(avatarFile)
        : avatarPreview || DEFAULT_AVATAR;

      const payload = { name, bio, city, languages, rate, avatarUrl };

      const updatedProfile = await profileApi.update(profileInfo._id, payload);
      setProfileInfo(updatedProfile);
      showNotification(
        <span className="flex items-center gap-1.5">
          <Save className="w-4 h-4" /> Profile information updated successfully!
        </span>,
      );
    } catch (err) {
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Couldn't save profile:{" "}
          {err.message}
        </span>,
      );
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading dashboard...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">{loadError}</p>
          <button
            onClick={loadAll}
            className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-xl cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (profileNotFound) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
              <PlusCircle className="w-12 h-12 text-orange-500" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">No Profile Yet</h2>

            <p className="text-gray-500 mt-3">
              Create your guide profile so tourists can find and book you on
              Rafiq.
            </p>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-8 bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-3 rounded-xl font-semibold"
            >
              Create Profile
            </button>
          </div>
        </div>
        <CreateGuideProfileModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          tourGuideId={tourGuideId}
          defaultName={user?.name || ""}
          onProfileCreated={handleProfileCreated}
        />
      </>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profileInfo.avatarUrl || DEFAULT_AVATAR}
              alt={profileInfo.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-inner"
            />
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Operational Portal
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Welcome back, {profileInfo.name}!
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${activeTab === "dashboard" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${activeTab === "chat" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> Messages
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${activeTab === "profile" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <User className="w-3.5 h-3.5" /> My Profile
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
            <button
              onClick={handleLogout}
              className="border border-slate-200 text-slate-600 font-semibold text-sm py-2 px-4 rounded-xl hover:border-red-200 hover:text-red-600 transition-colors cursor-pointer"
            >
              Log Out →
            </button>
          </div>
        </div>

        {notification && (
          <div className="bg-slate-900 text-white text-sm font-medium py-3 px-5 rounded-2xl shadow-lg fixed bottom-5 right-5 z-50 animate-bounce">
            {notification}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8 lg:col-span-1">
              <AvailabilityCard
                isAvailable={isAvailable}
                onToggle={setIsAvailable}
              />
              <NewTripForm onAddTrip={handleAddTrip} />
            </div>

            <div className="space-y-8 lg:col-span-2">
              <BookingRequests
                bookings={bookings}
                onUpdateStatus={handleUpdateBookingStatus}
              />
              <TripPackagesList
                trips={trips}
                onOpenDetails={setSelectedTrip}
                onDeleteTrip={handleDeleteTrip}
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <ProfileView profile={profileInfo} />
            </div>

            <div className="lg:col-span-2">
              <ProfileEditForm
                profile={profileInfo}
                onSave={handleSaveProfile}
                onInvalidAvatar={handleInvalidAvatar}
              />
            </div>
          </div>
        )}

        {activeTab === "chat" && <GuideInbox guideId={tourGuideId} />}
      </div>

      <TripDetailsModal
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
};

export default GuideDashboard;
