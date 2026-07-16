import React, { useState, useEffect } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { DEFAULT_AVATAR } from "../../services/Guideapi";

// Syncs its local fields from `profile` whenever it changes, and calls
// onSave({ name, bio, city, languages, rate, avatarFile, avatarPreview })
// which is expected to resolve on success / throw on failure.
const ProfileEditForm = ({ profile, onSave, onInvalidAvatar }) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [rate, setRate] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setBio(profile.bio || "");
    setCity(profile.city || "");
    setLanguages(
      Array.isArray(profile.languages) ? profile.languages.join(", ") : "",
    );
    setRate(profile.rate || "");
    setAvatarPreview(profile.avatarUrl || "");
  }, [profile]);

  const handleAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onInvalidAvatar?.("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onInvalidAvatar?.("Image must be under 5MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({
        name,
        bio,
        city,
        languages: languages
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang.length > 0),
        rate,
        avatarFile,
        avatarPreview,
      });
      setAvatarFile(null);
    } finally {
      setSaving(false);
    }
  };

  return (
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            Profile Photo
          </label>
          <label className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
            <img
              src={avatarPreview || DEFAULT_AVATAR}
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
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 resize-none"
            required
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-50">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all text-xs uppercase tracking-wide cursor-pointer inline-flex items-center gap-1.5"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;