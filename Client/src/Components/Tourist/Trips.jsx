import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Clock,
  X,
  Star,
  BadgeCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { tripApi, profileApi } from "../../services/Touristapi";

export default function TripsPage() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);

  const [trips, setTrips] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [placeFilter, setPlaceFilter] = useState("All");
  const [durationFilter, setDurationFilter] = useState("Any");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // Guides are still fetched here so trip cards / the trip modal can
      // show "Posted by <guide>" — trips only store tourGuideId (a User id).
      const [tripsData, guidesData] = await Promise.all([
        tripApi.getAll(),
        profileApi.getAll(),
      ]);
      setTrips(tripsData);
      setGuides(guidesData);
    } catch (err) {
      setLoadError(err.message || "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function getGuideByOwnerId(ownerId) {
    if (!ownerId) return null;
    return guides.find((g) => g.owner === ownerId) || null;
  }

  const uniquePlaces = [
    "All",
    ...Array.from(new Set(trips.map((t) => t.location))).sort(),
  ];
  const uniqueDurations = [
    "Any",
    ...Array.from(new Set(trips.map((t) => t.days))).sort((a, b) => a - b),
  ];

  const filteredTrips = trips.filter((t) => {
    const matchesPlace = placeFilter === "All" || t.location === placeFilter;
    const matchesDuration =
      durationFilter === "Any" || t.days === Number(durationFilter);
    return matchesPlace && matchesDuration;
  });

  const tripFiltersActive = placeFilter !== "All" || durationFilter !== "Any";

  if (loading) {
    return (
      <div className="relative my-20">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading trips...
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative">
        <Navbar className="mb-10" />
        <div className="min-h-[60vh] flex items-center justify-center p-6">
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
      </div>
    );
  }

  return (
    <div className="relative my-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-900">
              All Trip Packages ({filteredTrips.length})
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Place
                </label>
                <select
                  value={placeFilter}
                  onChange={(e) => setPlaceFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                >
                  {uniquePlaces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Duration
                </label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                >
                  {uniqueDurations.map((d) => (
                    <option key={d} value={d}>
                      {d === "Any" ? "Any" : `${d} ${d === 1 ? "Day" : "Days"}`}
                    </option>
                  ))}
                </select>
              </div>
              {tripFiltersActive && (
                <button
                  onClick={() => {
                    setPlaceFilter("All");
                    setDurationFilter("Any");
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 cursor-pointer pb-2.5"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
          {filteredTrips.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-400">
                No trips match your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip._id}
                  trip={trip}
                  guide={getGuideByOwnerId(trip.tourGuideId)}
                  onOpenDetails={(t) => setSelectedTrip(t)}
                  onViewGuide={(g) => setSelectedGuide(g)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            <button
              onClick={() => setSelectedTrip(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
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

              {getGuideByOwnerId(selectedTrip.tourGuideId) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Posted By
                  </h4>
                  <button
                    onClick={() =>
                      setSelectedGuide(
                        getGuideByOwnerId(selectedTrip.tourGuideId),
                      )
                    }
                    className="w-full flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3 hover:border-orange-200 hover:bg-orange-50/40 transition-colors cursor-pointer text-left"
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-orange-100">
                        <img
                          src={
                            getGuideByOwnerId(selectedTrip.tourGuideId)
                              .avatarUrl
                          }
                          alt={getGuideByOwnerId(selectedTrip.tourGuideId).name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {getGuideByOwnerId(selectedTrip.tourGuideId).verified && (
                        <BadgeCheck className="w-4 h-4 text-orange-500 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {getGuideByOwnerId(selectedTrip.tourGuideId).name}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-semibold text-slate-500">
                          {(
                            getGuideByOwnerId(selectedTrip.tourGuideId)
                              .rating || 0
                          ).toFixed(1)}{" "}
                          · {getGuideByOwnerId(selectedTrip.tourGuideId).city}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide whitespace-nowrap">
                      View Profile
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTrip(null)}
                className="bg-white border border-slate-200 text-slate-600 hover:border-slate-300 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedTrip(null)}
                title="Booking flow not wired up yet — needs the current tourist's id/name"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-sm"
              >
                Request This Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight guide-preview modal, opened from a trip card / trip modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative">
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm">
                <img
                  src={selectedGuide.avatarUrl}
                  alt={selectedGuide.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <h2 className="text-xl font-black text-slate-900">
                  {selectedGuide.name}
                </h2>
                {selectedGuide.verified && (
                  <BadgeCheck className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {selectedGuide.city}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-xl mt-4">
                {selectedGuide.bio}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                See the Tour Guides page for full contact details and filters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TripCard({ trip, guide, onOpenDetails, onViewGuide }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(trip.images) ? trip.images : [];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      onClick={() => onOpenDetails(trip)}
      className="rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-200/60 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {images.length > 0 && (
          <img
            src={images[currentImageIndex]}
            alt={`${trip.title} panel view`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <span className="absolute top-3 left-3 text-[10px] font-bold text-orange-600 bg-white/95 px-2 py-1 rounded-md uppercase tracking-wider shadow-sm z-10">
          {trip.location}
        </span>

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer transition-transform hover:scale-105 z-10"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer transition-transform hover:scale-105 z-10"
            >
              ›
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, index) => (
              <span
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "bg-orange-500 w-3"
                    : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        <span className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {trip.days} {trip.days === 1 ? "Day" : "Days"}
        </span>
      </div>

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

        {guide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewGuide(guide);
            }}
            className="w-full flex items-center gap-2 border-t border-slate-50 pt-2 mt-1 cursor-pointer group/guide"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-orange-100 shrink-0">
              <img
                src={guide.avatarUrl}
                alt={guide.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 group-hover/guide:text-orange-600 transition-colors truncate">
              Posted by {guide.name}
            </span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(trip);
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-colors mt-3 text-xs uppercase tracking-wide cursor-pointer"
        >
          View Details
        </button>
      </div>
    </div>
  );
}