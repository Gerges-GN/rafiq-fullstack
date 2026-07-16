import React, { useState } from "react";
import { MapPin, Clock } from "lucide-react";

// --- TRIP CARD WITH SLIDESHOW ---
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

export default TripCard;