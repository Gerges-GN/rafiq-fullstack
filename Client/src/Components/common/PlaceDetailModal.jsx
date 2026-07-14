import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function PlaceDetailModal({ isOpen, onClose, place }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${
        isOpen ? "bg-opacity-60" : "bg-opacity-0"
      }`}
      onClick={onClose}
      onTransitionEnd={handleAnimationEnd}
    >
      <div
        className={`bg-white rounded-xl shadow-lg max-w-2xl w-full relative transform transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 z-10 bg-white/50 rounded-full p-1"
        >
          <X size={24} />
        </button>
        {place && (
          <div className="max-h-[90vh] overflow-y-auto rounded-xl scrollbar-thin">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">
                {place.name}
              </h2>
              <p className="text-sm text-ink-500 font-medium mb-4">
                {place.location}
              </p>
              <p className="text-ink-700 leading-relaxed">
                {place.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
