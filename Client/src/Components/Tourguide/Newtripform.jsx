import React, { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

// Owns its own field + image state. Calls onAddTrip({ title, location, days,
// details, imageFiles }) and expects it to resolve on success / throw on
// failure — the form only clears itself after a successful resolve.
const NewTripForm = ({ onAddTrip }) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [details, setDetails] = useState("");
  // Each item: { file, preview }
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImagesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    setImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onAddTrip({
        title,
        location,
        days: parseInt(days) || 1,
        details,
        imageFiles: images.map((img) => img.file),
      });

      setTitle("");
      setLocation("");
      setDays("");
      setDetails("");
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-50 pb-2">
        Create New Trip Package
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Trip Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              value={days}
              onChange={(e) => setDays(e.target.value)}
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
            {images.map((img, index) => (
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
                  onClick={() => removeImage(index)}
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
                onChange={handleImagesSelected}
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
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe itinerary milestones..."
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide cursor-pointer inline-flex items-center justify-center gap-1.5"
        >
          {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Publish Trip Package
        </button>
      </form>
    </div>
  );
};

export default NewTripForm;