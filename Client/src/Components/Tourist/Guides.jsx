import React, { useState, useEffect, useCallback } from "react";
import { MapPin, X, Star, Phone, Mail, BadgeCheck, Languages, Briefcase, Loader2, AlertTriangle } from "lucide-react";
import Navbar from "../../Components/Layout/TouristNav";
import { profileApi, guideLanguages } from "../../services/Touristapi";

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [guideLanguageFilter, setGuideLanguageFilter] = useState("All");
  const [guideMinRate, setGuideMinRate] = useState("");
  const [guideMaxRate, setGuideMaxRate] = useState("");
  const [guideMinTrips, setGuideMinTrips] = useState("");

  const loadGuides = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const guidesData = await profileApi.getAll();
      setGuides(guidesData);
    } catch (err) {
      setLoadError(err.message || "Failed to load tour guides.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const uniqueLanguages = [
    "All",
    ...Array.from(new Set(guides.flatMap((g) => guideLanguages(g)))).sort(),
  ];

  const filteredGuides = guides.filter((g) => {
    const rate = Number(g.rate) || 0;
    const langs = guideLanguages(g);
    const matchesLanguage =
      guideLanguageFilter === "All" || langs.includes(guideLanguageFilter);
    const matchesMinRate = guideMinRate === "" || rate >= Number(guideMinRate);
    const matchesMaxRate = guideMaxRate === "" || rate <= Number(guideMaxRate);
    const matchesMinTrips =
      guideMinTrips === "" || (g.completedTrips || 0) >= Number(guideMinTrips);
    return matchesLanguage && matchesMinRate && matchesMaxRate && matchesMinTrips;
  });

  const guideFiltersActive =
    guideLanguageFilter !== "All" ||
    guideMinRate !== "" ||
    guideMaxRate !== "" ||
    guideMinTrips !== "";

  if (loading) {
    return (
      <div className="relative">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading tour guides...
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative">
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-white border border-red-100 rounded-2xl p-6 max-w-md text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">{loadError}</p>
            <button
              onClick={loadGuides}
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
              Available Tour Guides ({filteredGuides.length})
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Language
                </label>
                <select
                  value={guideLanguageFilter}
                  onChange={(e) => setGuideLanguageFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
                >
                  {uniqueLanguages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Rate ($/day)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={guideMinRate}
                    onChange={(e) => setGuideMinRate(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <span className="text-slate-300 text-sm">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={guideMaxRate}
                    onChange={(e) => setGuideMaxRate(e.target.value)}
                    className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Min. Completed Trips
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 20"
                  value={guideMinTrips}
                  onChange={(e) => setGuideMinTrips(e.target.value)}
                  className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              {guideFiltersActive && (
                <button
                  onClick={() => {
                    setGuideLanguageFilter("All");
                    setGuideMinRate("");
                    setGuideMaxRate("");
                    setGuideMinTrips("");
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 cursor-pointer pb-2.5"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
          {filteredGuides.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-slate-400">
                No guides match your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard
                  key={guide._id}
                  guide={guide}
                  onOpenDetails={(g) => setSelectedGuide(g)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 pb-2 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm">
                <img
                  src={selectedGuide.avatarUrl}
                  alt={selectedGuide.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <h2 className="text-xl font-black text-slate-900">{selectedGuide.name}</h2>
                {selectedGuide.verified && <BadgeCheck className="w-5 h-5 text-orange-500" />}
              </div>
              <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {selectedGuide.city}
              </span>
              <div className="flex items-center gap-1 mt-2 bg-orange-50 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span className="text-xs font-bold text-orange-700">
                  {(selectedGuide.rating || 0).toFixed(1)}
                </span>
                <span className="text-xs text-orange-400">
                  ({selectedGuide.reviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                {selectedGuide.bio}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Languages className="w-3 h-3" /> Languages
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {guideLanguages(selectedGuide).join(", ")}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Completed Trips
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedGuide.completedTrips || 0}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedGuide.phone}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                    {selectedGuide.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedGuide(null)}
                className="bg-white border border-slate-200 text-slate-600 hover:border-slate-300 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setSelectedGuide(null)}
                title="Booking flow not wired up yet — needs the current tourist's id/name"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer shadow-sm"
              >
                Request This Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GuideCard({ guide, onOpenDetails }) {
  return (
    <div
      onClick={() => onOpenDetails(guide)}
      className="rounded-2xl overflow-hidden shadow-sm bg-white border border-slate-200/60 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer group p-4"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm">
            <img src={guide.avatarUrl} alt={guide.name} className="w-full h-full object-cover" />
          </div>
          {guide.verified && (
            <BadgeCheck className="w-4.5 h-4.5 text-orange-500 bg-white rounded-full absolute -bottom-0.5 -right-0.5 shadow-sm" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-orange-600 transition-colors">
            {guide.name}
          </h4>
          <span className="text-xs font-semibold text-slate-400 block mt-0.5 inline-flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {guide.city}
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold text-slate-700">
              {(guide.rating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">({guide.reviews || 0} reviews)</span>
          </div>
        </div>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md whitespace-nowrap">
          ${guide.rate}/day
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2 line-clamp-2 mt-3">
        {guide.bio}
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(guide);
        }}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-colors mt-3 text-xs uppercase tracking-wide cursor-pointer"
      >
        View Profile
      </button>
    </div>
  );
}