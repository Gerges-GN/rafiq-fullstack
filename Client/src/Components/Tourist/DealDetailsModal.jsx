import { useState } from "react";
import {
  MapPin,
  Clock,
  X,
  Star,
  BadgeCheck,
  CalendarDays,
  CircleX,
} from "lucide-react";

// Lightweight guide-preview modal, opened from the "Posted By" row.
// Mirrors the one in TripsPage.
function GuidePreviewModal({ guide, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 shadow-sm">
            <img
              src={guide.avatarUrl}
              alt={guide.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <h2 className="text-xl font-black text-slate-900">{guide.name}</h2>
            {guide.verified && (
              <BadgeCheck className="w-5 h-5 text-orange-500" />
            )}
          </div>
          {guide.city && (
            <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {guide.city}
            </span>
          )}
          {guide.bio && (
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 border border-slate-100 rounded-xl mt-4">
              {guide.bio}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-3">
            See the Tour Guides page for full contact details and filters.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DealDetailsModal({ deal, trip, guide, onClose }) {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const images = Array.isArray(trip?.images) ? trip.images : [];
  const durationLabel = trip
    ? `${trip.days} ${trip.days === 1 ? "Day" : "Days"}`
    : deal.duration;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-md z-20 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {images.length > 0 && (
              <div className="p-6 pb-2 space-y-2">
                <div className="h-60 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                  <img
                    src={images[0]}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.slice(1, 3).map((url, idx) => (
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
                {trip?.location && (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {trip.location}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration: {durationLabel}
                </span>
                {deal.status == "Confirmed" ? (
                  <span className="text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Booked {new Date(deal.createdAt).toLocaleDateString()}
                  </span>
                ) : (
                  deal.status == "Cancelled" && (
                    <span className="text-xs font-bold text-red-500 bg-red-100 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
                      <CircleX className="w-3.5 h-3.5" />
                      Cancelled
                    </span>
                  )
                )}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {trip?.title || deal.tripTitle}
                </h2>
                <div className="h-0.5 bg-slate-100 w-full mt-3 mb-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Package Itinerary & Milestones
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
                  {trip?.details ||
                    "Full trip details aren't available anymore — this may be an older or removed trip."}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  By
                </h4>
                <button
                  onClick={() => guide && setSelectedGuide(guide)}
                  disabled={!guide}
                  className="w-full flex items-center gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3 hover:border-orange-200 hover:bg-orange-50/40 transition-colors cursor-pointer text-left disabled:cursor-default disabled:hover:border-slate-100 disabled:hover:bg-slate-50/50"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-orange-100">
                      <img
                        src={guide?.avatarUrl || deal.tourguideimg}
                        alt={guide?.name || deal.tourGuideName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {guide?.verified && (
                      <BadgeCheck className="w-4 h-4 text-orange-500 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {guide?.name || deal.tourGuideName}
                    </p>
                    {guide && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-semibold text-slate-500">
                          {(guide.rating || 0).toFixed(1)} · {guide.city}
                        </span>
                      </div>
                    )}
                  </div>
                  {guide && (
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide whitespace-nowrap">
                      View Profile
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* CTA row intentionally left out here — this is a booking
              already made, not a trip up for request, per the earlier
              ask to drop "Request This Trip". Just a Close action. */}
            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="bg-white border border-slate-200 text-slate-600 hover:border-slate-300 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedGuide && (
        <GuidePreviewModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />
      )}
    </>
  );
}
