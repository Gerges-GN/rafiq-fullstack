import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, X, Plus, Save, ArrowLeft, Loader2
} from 'lucide-react';
import Navbar from '../../Components/Layout/TouristNav';
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
export default function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    headline: '',
    quote: '',
    bio: '',
    location: '',
    website: '',
    languages: [],
    avatarUrl: '',
    coverUrl: '',
  });

  const [languageInput, setLanguageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing profile data to pre-fill the form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/profiles/${userId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();

        setFormData({
          headline: data.headline || '',
          quote: data.quote || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          languages: data.languages || [],
          avatarUrl: data.avatarUrl || '',
          coverUrl: data.coverUrl || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLanguage = () => {
    const trimmed = languageInput.trim();
    if (trimmed && !formData.languages.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, trimmed] }));
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      navigate(`/profile/${userId}`); // redirect back to profile view after saving
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <Navbar userAvatar={formData.avatarUrl} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover + Avatar preview */}
          <div className="relative h-40 sm:h-56 w-full bg-gray-100">
            {formData.coverUrl && (
              <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Change Cover
            </button>

            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md bg-gray-200"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full shadow-sm hover:bg-orange-600 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pt-14 px-6 pb-6 space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Avatar/Cover URL inputs (swap for real upload later) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Avatar URL</label>
                <input
                  type="text"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cover URL</label>
                <input
                  type="text"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                placeholder="Wanderer | Memory Collector"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quote</label>
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
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 resize-none"
                placeholder="Tell people about yourself..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Cairo, Egypt"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  placeholder="www.yoursite.com"
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Languages</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}