import { useState } from "react";
import { X, Plus, Save, Loader2, ImagePlus } from "lucide-react";
import { authFetch } from '../../services/authFetch';
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
export default function CreateProfileModal({
  isOpen,
  onClose,
  userId,
  onProfileCreated,
}) {
  const [formData, setFormData] = useState({
    ownerName: "",
    headline: "",
    quote: "",
    bio: "",
    location: "",
    website: "",
    languages: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, [type]: "Please select an image file." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, [type]: "Image must be under 5MB." }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === "avatarUrl") {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
    setFormErrors((prev) => ({ ...prev, [type]: null }));
  };

  const handleAddLanguage = () => {
    const trimmed = languageInput.trim();
    if (trimmed && !formData.languages.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, trimmed],
      }));
      setLanguageInput("");
    }
  };

  const handleRemoveLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ownerName.trim())
      newErrors.ownerName = "Full Name is required.";
    if (!formData.headline.trim()) newErrors.headline = "Headline is required.";
    if (!formData.bio.trim()) newErrors.bio = "Bio is required.";
    if (!formData.location.trim()) newErrors.location = "Location is required.";

    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.website && !urlRegex.test(formData.website))
      newErrors.website = "Please enter a valid website URL.";

    setFormErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append("image", file);

    const res = await authFetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Image upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setSaving(true);
      setError(null);

      let avatarUrl = "";
      let coverUrl = "";

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      if (coverFile) {
        coverUrl = await uploadImage(coverFile);
      }

      const payload = {
        ...formData,
        avatarUrl,
        coverUrl,
        owner: userId,
      };

      const res = await authFetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create profile");
      }

      onProfileCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create Your Profile
            </h2>
            <p className="text-sm text-gray-500">
              Share your travel story with the world.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                  formErrors.ownerName
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-orange-500"
                }`}
                placeholder="e.g. Jane Doe"
              />
              {formErrors.ownerName && (
                <p className="text-xs text-red-500 mt-1">
                  {formErrors.ownerName}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Avatar (Optional)
                </label>
                <label
                  className={`flex flex-col items-center justify-center gap-1 w-full h-24 border-2 border-dashed rounded-lg cursor-pointer text-xs text-gray-500 hover:border-orange-400 transition-colors overflow-hidden ${
                    formErrors.avatarUrl ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span>Upload avatar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "avatarUrl")}
                  />
                </label>
                {formErrors.avatarUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.avatarUrl}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cover (Optional)
                </label>
                <label
                  className={`flex flex-col items-center justify-center gap-1 w-full h-24 border-2 border-dashed rounded-lg cursor-pointer text-xs text-gray-500 hover:border-orange-400 transition-colors overflow-hidden ${
                    formErrors.coverUrl ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                      <span>Upload cover</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, "coverUrl")}
                  />
                </label>
                {formErrors.coverUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.coverUrl}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                maxLength={60}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                  formErrors.headline
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-orange-500"
                }`}
                placeholder="Wanderer | Memory Collector"
              />
              {formErrors.headline && (
                <p className="text-xs text-red-500 mt-1">
                  {formErrors.headline}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Quote (Optional)
              </label>
              <input
                type="text"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                placeholder="A short inspirational line about your travels"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none resize-none ${
                  formErrors.bio
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-200 focus:border-orange-500"
                }`}
                placeholder="Tell people about yourself..."
              />
              {formErrors.bio && (
                <p className="text-xs text-red-500 mt-1">{formErrors.bio}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                    formErrors.location
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                  placeholder="Cairo, Egypt"
                />
                {formErrors.location && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                    formErrors.website
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                  placeholder="www.yoursite.com"
                />
                {formErrors.website && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.website}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Languages
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Arabic"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang) => (
                  <span
                    key={lang}
                    className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="hover:text-orange-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
