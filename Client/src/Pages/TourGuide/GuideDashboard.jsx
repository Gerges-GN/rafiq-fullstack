import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  User,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle,
  Save,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GuideInbox from "../../Features/chat/pages/GuideInbox";

import {
  profileApi,
  tripApi,
  bookingApi,
  reviewApi,
  uploadImage,
  getCurrentUserId,
  DEFAULT_AVATAR,
} from "../../services/Guideapi";

import AvailabilityCard from "../../Components/Tourguide/Availabilitycard";
import NewTripForm from "../../components/Tourguide/NewTripForm";
import BookingRequests from "../../components/Tourguide/BookingRequests";
import TripPackagesList from "../../components/Tourguide/TripPackagesList";
import TripDetailsModal from "../../components/Tourguide/TripDetailsModal";
import ProfileView from "../../components/Tourguide/ProfileView";
import ProfileEditForm from "../../components/Tourguide/ProfileEditForm";
import ReviewsList from "../../components/Tourguide/ReviewsList";

// --- STAR RATING DISPLAY ---
const StarRating = ({ average, count, size = "sm" }) => {
  const starSize = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  const textSize = size === "lg" ? "text-sm" : "text-xs";

  if (count === 0) {
    return (
      <span className={`text-slate-400 font-medium ${textSize}`}>
        No reviews yet
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <span className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`${starSize} ${
              n <= Math.round(average)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </span>
      <span className={`font-bold text-slate-700 ${textSize}`}>
        {average.toFixed(1)}
      </span>
      <span className={`text-slate-400 font-medium ${textSize}`}>
        ({count} review{count === 1 ? "" : "s"})
      </span>
    </span>
  );
};

// --- MAIN PORTAL PAGE COMPONENT ---
const GuideDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };
  const [activeTab, setActiveTab] = useState("dashboard");

  const tourGuideId = user?._id || user?.id || getCurrentUserId();

  const [profileInfo, setProfileInfo] = useState(null);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState(null);

  const [notification, setNotification] = useState("");

  const showNotification = (node) => {
    setNotification(node);
    setTimeout(() => setNotification(""), 3000);
  };

  // --- Initial load: profile, trips, bookings, reviews ---
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
        profile = await profileApi.create({
          owner: tourGuideId,
          name: user?.name || "New Guide",
          languages: [],
        });
      }
      setProfileInfo(profile);

      const guideOwnerId = profile.owner || tourGuideId;

      const [tripsData, bookingsData, reviewsData] = await Promise.all([
        tripApi.getByTourGuideId(guideOwnerId),
        bookingApi.getByTourGuideId(guideOwnerId),
        reviewApi.getByTourGuideId(guideOwnerId),
      ]);
      setTrips(tripsData);
      setBookings(bookingsData);
      setReviews(reviewsData);
    } catch (err) {
      setLoadError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [tourGuideId, user?.name]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // --- Trip handlers ---
  const handleAddTrip = async ({
    title,
    location,
    days,
    details,
    imageFiles,
  }) => {
    try {
      const uploadedImages = await Promise.all(imageFiles.map(uploadImage));

      const newTrip = await tripApi.create({
        title,
        location,
        days,
        details,
        images: uploadedImages,
        tourGuideId: profileInfo?.owner || tourGuideId,
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

  // --- Review stats (published reviews only) ---
  const publishedReviews = reviews.filter((r) => r.status === "PUBLISHED");
  const reviewCount = publishedReviews.length;
  const averageRating =
    reviewCount === 0
      ? 0
      : publishedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

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
              <div className="mt-1">
                <StarRating average={averageRating} count={reviewCount} />
              </div>
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
            <button
              onClick={() => setActiveTab("reviews")}
              className={`font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${activeTab === "reviews" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
            >
              <Star className="w-3.5 h-3.5" /> Reviews
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
              <ProfileView
                profile={profileInfo}
                averageRating={averageRating}
                reviewCount={reviewCount}
              />
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

        {activeTab === "reviews" && (
          <ReviewsList
            reviews={publishedReviews}
            averageRating={averageRating}
            reviewCount={reviewCount}
          />
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
