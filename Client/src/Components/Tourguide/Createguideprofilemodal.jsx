import React, { useState } from "react";
import { X, Loader2, ImagePlus } from "lucide-react";
import { profileApi, uploadImage, DEFAULT_AVATAR } from "../../services/Guideapi";

const CreateGuideProfileModal = ({
  isOpen,
  onClose,
  tourGuideId,
  defaultName = "",
  onProfileCreated,
}) => {
  const [name, setName] = useState(defaultName);
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [rate, setRate] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const avatarUrl = avatarFile
        ? await uploadImage(avatarFile)
        : DEFAULT_AVATAR;

      const newProfile = await profileApi.create({
        owner: tourGuideId,
        name,
        city,
        languages: languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang.length > 0),
        rate,
        bio,
        avatarUrl,
        // New guides start out awaiting admin review — must match the
        // backend's status enum ('pending' | 'approved' | 'suspended').
        status: "pending",
      });
      onProfileCreated(newProfile);
    } catch (err) {
      setError(err.message || "Couldn't create profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md z-10 cursor-pointer text-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Set Up Your Guide Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tourists will see this before booking you on Rafiq.
            </p>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Profile Photo
              </label>
              <label className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
                <img
                  src={avatarPreview || DEFAULT_AVATAR}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1.5">
                  <ImagePlus className="w-4 h-4" /> Upload a photo
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Spoken Languages
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., Arabic, English"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Daily Rate ($ USD)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                About Me
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell tourists a bit about yourself..."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGuideProfileModal;