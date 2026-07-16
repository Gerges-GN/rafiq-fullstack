import React from "react";
import { MapPin, Clock } from "lucide-react";

const TripDetailsModal = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md z-20 cursor-pointer text-sm"
        >
          ✕
        </button>

        {Array.isArray(trip.images) && trip.images.length > 0 && (
          <div className="p-6 pb-2 space-y-2">
            <div className="h-60 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
              <img
                src={trip.images[0]}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
            {trip.images.length > 1 && (
              <div className="grid grid-cols-2 gap-2">
                {trip.images.slice(1, 3).map((url, idx) => (
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
              <MapPin className="w-3 h-3" /> {trip.location}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wide inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> Duration: {trip.days}{" "}
              {trip.days === 1 ? "Day" : "Days"}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {trip.title}
            </h2>
            <div className="h-0.5 bg-slate-100 w-full mt-3 mb-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Detailed Package Itinerary & Milestones
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 border border-slate-100 rounded-xl">
              {trip.details}
            </p>
          </div>
        </div>

        <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wide transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;