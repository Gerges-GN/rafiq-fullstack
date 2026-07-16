import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  User,
  Circle,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Save,
  Star,
  Phone,
  Mail,
  BadgeCheck,
  CheckCircle,
  Loader2,
  AlertTriangle,
  MessageCircle,
  ImagePlus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GuideInbox from "../../Features/chat/pages/GuideInbox";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// console.log("API_BASE_URL =", API_BASE_URL);

// Single source of truth for the token — checks both storages.
function getToken() {
  const t = localStorage.getItem("token") || sessionStorage.getItem("token");
  return t;
}

function getCurrentUserId() {
  const token = getToken();
  if (!token) {
    console.warn("[auth] getCurrentUserId: no token found in either storage");
    return null;
  }
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload.id || payload._id || payload.userId || payload.sub;
    if (!id)
      console.warn("[auth] payload has no id/_id/userId/sub field:", payload);
    return id || null;
  } catch (err) {
    console.warn("[auth] token decode failed:", err);
    return null;
  }
}
async function apiRequest(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

// Uploads a single file to Cloudinary via the backend and returns its URL.
async function uploadImage(file) {
  const uploadData = new FormData();
  uploadData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    body: uploadData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || "Image upload failed");
  }

  const data = await res.json();
  return data.url;
}

const profileApi = {
  getByOwnerId: (ownerId) => apiRequest(`/tourguide-profiles/owner/${ownerId}`),
  create: (payload) =>
    apiRequest(`/tourguide-profiles`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiRequest(`/tourguide-profiles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

const tripApi = {
  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/trips/tourguide/${tourGuideId}`),
  create: (payload) =>
    apiRequest(`/trips`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id) => apiRequest(`/trips/${id}`, { method: "DELETE" }),
};

const bookingApi = {
  getByTourGuideId: (tourGuideId) =>
    apiRequest(`/bookings/tourguide/${tourGuideId}`),
  update: (id, payload) =>
    apiRequest(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};

// Fallback avatar used only if the profile has none yet (e.g. brand-new guide,
// profile not created in the DB). Nothing else here is static seed data anymore.
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

// --- CHILD COMPONENT: TRIP CARD WITH SLIDESHOW ---
const TripCard = ({ trip, onOpenDetails, onDeleteTrip }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const tripImages = Array.isArray(trip.images) ? trip.images : [];
  const hasImages = tripImages.length > 0;

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % tripImages.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(
      (prev) => (prev - 1 + tripImages.length) % tripImages.length,
    );
  };

  return (
    <div
      onClick={() => onOpenDetails(trip)}
      className="border border-slate-200/60 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group relative"
    >
      {hasImages ? (
        <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
          <img
            src={tripImages[currentImgIndex]}
            alt={`${trip.title} slide ${currentImgIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-300"
          />

          <span className="absolute top-3 left-3 text-[10px] font-bold text-orange-600 bg-white/95 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
            {trip.location}
          </span>

          {tripImages.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={prevSlide}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer transition-transform hover:scale-105 z-10"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer transition-transform hover:scale-105 z-10"
              >
                ›
              </button>
            </div>
          )}

          {tripImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
              {tripImages.map((_, index) => (
                <span
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImgIndex ? "bg-orange-500 w-3" : "bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 pt-4">
          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {trip.location}
          </span>
        </div>
      )}

      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
        <div>
          <h4 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
            {trip.title}
          </h4>
          <span className="text-xs font-semibold text-slate-400 block mt-0.5 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Duration: {trip.days}{" "}
            {trip.days === 1 ? "Day" : "Days"}
          </span>
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2 line-clamp-2 mt-2">
            {trip.details}
          </p>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-50 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTrip(trip._id);
            }}
            className="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Delete Package
          </button>

          <span className="text-[11px] font-bold text-orange-600 bg-orange-50/60 px-2.5 py-1 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 flex items-center gap-1">
            View Details{" "}
            <span className="transform group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </span>
        </div>
      </div>
    </div>
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

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState(null);

  const [newTripTitle, setNewTripTitle] = useState("");
  const [newTripLocation, setNewTripLocation] = useState("");
  const [newTripDays, setNewTripDays] = useState("");
  const [newTripDetails, setNewTripDetails] = useState("");
  // Each item: { file, preview }
  const [newTripImages, setNewTripImages] = useState([]);
  const [addingTrip, setAddingTrip] = useState(false);

  const [notification, setNotification] = useState("");

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLanguages, setEditLanguages] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

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
        profile = await profileApi.create({
          owner: tourGuideId,
          name: user?.name || "New Guide",
          languages: [],
        });
      }
      setProfileInfo(profile);
      setEditName(profile.name || "");
      setEditBio(profile.bio || "");
      setEditCity(profile.city || "");
      setEditLanguages(
        Array.isArray(profile.languages) ? profile.languages.join(", ") : "",
      );
      setEditRate(profile.rate || "");
      setEditAvatarPreview(profile.avatarUrl || "");

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
  }, [tourGuideId, user?.name]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleAvailability = (e) => {
    setIsAvailable(e.target.checked);
  };

  // --- Trip photo handlers ---
  const handleTripImagesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    setNewTripImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeTripImage = (index) => {
    setNewTripImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    setAddingTrip(true);

    try {
      const uploadedImages = await Promise.all(
        newTripImages.map((img) => uploadImage(img.file)),
      );

      const newTrip = await tripApi.create({
        title: newTripTitle,
        location: newTripLocation,
        days: parseInt(newTripDays) || 1,
        details: newTripDetails,
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

      setNewTripTitle("");
      setNewTripLocation("");
      setNewTripDays("");
      setNewTripDetails("");
      newTripImages.forEach((img) => URL.revokeObjectURL(img.preview));
      setNewTripImages([]);
    } catch (err) {
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Failed to publish trip:{" "}
          {err.message}
        </span>,
      );
    } finally {
      setAddingTrip(false);
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

  // --- Avatar handler ---
  const handleAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Please select an image file.
        </span>,
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showNotification(
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> Image must be under 5MB.
        </span>,
      );
      return;
    }

    setEditAvatarFile(file);
    setEditAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const avatarUrl = editAvatarFile
        ? await uploadImage(editAvatarFile)
        : editAvatarPreview || DEFAULT_AVATAR;

      const payload = {
        name: editName,
        bio: editBio,
        city: editCity,
        languages: editLanguages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang.length > 0),
        rate: editRate,
        avatarUrl,
      };

      const updatedProfile = await profileApi.update(profileInfo._id, payload);
      setProfileInfo(updatedProfile);
      setEditAvatarFile(null);
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
    } finally {
      setSavingProfile(false);
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
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
                  Availability Status
                </h3>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-1.5">
                    {isAvailable ? (
                      <>
                        <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500" />{" "}
                        Active on App
                      </>
                    ) : (
                      <>
                        <Circle className="w-2.5 h-2.5 fill-red-500 text-red-500" />{" "}
                        Hidden Profile
                      </>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={handleToggleAvailability}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
                  Create New Trip Package
                </h3>
                <form onSubmit={handleAddTrip} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip Name
                    </label>
                    <input
                      type="text"
                      value={newTripTitle}
                      onChange={(e) => setNewTripTitle(e.target.value)}
                      placeholder="e.g., Luxor East Bank Tour"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newTripLocation}
                        onChange={(e) => setNewTripLocation(e.target.value)}
                        placeholder="e.g., Luxor"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={newTripDays}
                        onChange={(e) => setNewTripDays(e.target.value)}
                        placeholder="1"
                        min="1"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip Photos (Optional)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {newTripImages.map((img, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"
                        >
                          <img
                            src={img.preview}
                            alt={`Trip photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeTripImage(index)}
                            className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full hover:bg-black/80"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors text-[10px] text-slate-400">
                        <ImagePlus className="w-4 h-4" />
                        Add
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleTripImagesSelected}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-tight">
                      Leave empty for text-only, or select multiple photos.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Trip Details & Itinerary
                    </label>
                    <textarea
                      rows="3"
                      value={newTripDetails}
                      onChange={(e) => setNewTripDetails(e.target.value)}
                      placeholder="Describe itinerary milestones..."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={addingTrip}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    {addingTrip && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Publish Trip Package
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-8 lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
                  Client Booking Requests
                </h3>
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-400 py-2">
                      No incoming booking requests found.
                    </p>
                  ) : (
                    bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 ${
                          booking.status === "Confirmed"
                            ? "bg-green-50/40 border-green-100"
                            : booking.status === "Cancelled"
                              ? "bg-red-50/40 border-red-100"
                              : "bg-slate-50/40 border-slate-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {booking.touristName}
                            </span>
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                booking.status === "Confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "Cancelled"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {booking.status || "Pending"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-semibold mt-1 inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> Destination:{" "}
                            <span className="text-slate-600 font-bold">
                              {booking.tripTitle || "Custom Itinerary"}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Date:{" "}
                            {booking.date} ({booking.duration})
                          </p>
                        </div>

                        {(!booking.status || booking.status === "Pending") && (
                          <div className="flex items-center gap-2 sm:self-center self-end">
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(
                                  booking._id,
                                  "Rejected",
                                )
                              }
                              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateBookingStatus(
                                  booking._id,
                                  "Confirmed",
                                )
                              }
                              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-sm transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
                  My Active Trip Packages ({trips.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {trips.map((trip) => (
                    <TripCard
                      key={trip._id}
                      trip={trip}
                      onOpenDetails={(selected) => setSelectedTrip(selected)}
                      onDeleteTrip={handleDeleteTrip}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-4">
                <div className="relative w-28 h-28 mx-auto">
                  <img
                    src={profileInfo.avatarUrl || DEFAULT_AVATAR}
                    alt="Guide Avatar"
                    className="w-full h-full object-cover rounded-full border-4 border-slate-50 shadow-md"
                  />
                  <span className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-1.5">
                    {profileInfo.name}
                    {profileInfo.verified && (
                      <BadgeCheck
                        className="w-4 h-4 text-blue-500 fill-blue-100"
                        title="Verified by admin"
                      />
                    )}
                  </h2>

                  <p className="text-xs font-bold text-orange-600 mt-0.5 inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {profileInfo.city}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(profileInfo.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}

                    <span className="text-sm font-semibold text-slate-700 ml-1">
                      {profileInfo.rating}
                    </span>

                    <span className="text-xs text-slate-500">
                      ({profileInfo.reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bio Presentation
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {profileInfo.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Languages
                    </span>
                    <span className="text-xs font-bold text-slate-700 line-clamp-1">
                      {Array.isArray(profileInfo.languages)
                        ? profileInfo.languages.join(", ")
                        : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Day Rate
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      ${profileInfo.rate} / day
                    </span>
                  </div>
                </div>


                {/* Read-only application stats — completed trips + verification, set by the system/admin */}
                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Completed Trips
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {profileInfo.completedTrips}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      Verification
                    </span>
                    <span
                      className={`text-xs font-extrabold inline-flex items-center gap-1 ${
                        profileInfo.verified
                          ? "text-green-600"
                          : "text-slate-400"
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />{" "}
                      {profileInfo.verified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Personal Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your storefront metrics seen by tourists using Rafiq.
                  </p>
                  <div className="h-0.5 bg-slate-50 w-full mt-3" />
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Base Location / City
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Spoken Languages
                      </label>
                      <input
                        type="text"
                        value={editLanguages}
                        onChange={(e) => setEditLanguages(e.target.value)}
                        placeholder="e.g., Arabic, English, Italian"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Daily Budget Rate ($ USD)
                      </label>
                      <input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        min="1"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Profile Photo
                    </label>
                    <label className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
                      <img
                        src={editAvatarPreview || DEFAULT_AVATAR}
                        alt="Avatar preview"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1.5">
                        <ImagePlus className="w-4 h-4" /> Upload new photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelected}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      About Me / Professional Bio Summary
                    </label>
                    <textarea
                      rows="4"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-50">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {savingProfile && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && <GuideInbox guideId={tourGuideId} />}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            <button
              onClick={() => setSelectedTrip(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md z-20 cursor-pointer text-sm"
            >
              ✕
            </button>

            {Array.isArray(selectedTrip.images) &&
              selectedTrip.images.length > 0 && (
                <div className="p-6 pb-2 space-y-2">
                  <div className="h-60 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                    <img
                      src={selectedTrip.images[0]}
                      alt={selectedTrip.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedTrip.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTrip.images.slice(1, 3).map((url, idx) => (
                        <div
                          key={idx}
                          className="h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner"
                        >
                          <img
                            src={url}
                            alt={`album reference ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedTrip.location}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration: {selectedTrip.days}{" "}
                  {selectedTrip.days === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {selectedTrip.title}
                </h2>
                <div className="h-0.5 bg-slate-100 w-full mt-3 mb-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Package Itinerary & Milestones
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                  {selectedTrip.details}
                </p>
              </div>
            </div>

            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTrip(null)}
                className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDashboard;