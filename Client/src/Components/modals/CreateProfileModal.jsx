import { useState } from "react";
import { X, Plus, Save, Loader2 } from "lucide-react";

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
    avatarUrl: "",
    coverUrl: "",
  });
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
    if (formData.avatarUrl && !urlRegex.test(formData.avatarUrl))
      newErrors.avatarUrl = "Please enter a valid avatar URL.";
    if (formData.coverUrl && !urlRegex.test(formData.coverUrl))
      newErrors.coverUrl = "Please enter a valid cover URL.";

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...formData,
        owner: userId,
      };

      const res = await fetch(`http://localhost:5000/api/profiles`, {
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
                  Avatar URL (Optional)
                </label>
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                    formErrors.avatarUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                  placeholder="https://..."
                />
                {formErrors.avatarUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.avatarUrl}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Cover URL (Optional)
                </label>
                <input
                  type="text"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none ${
                    formErrors.coverUrl
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-orange-500"
                  }`}
                  placeholder="https://..."
                />
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
