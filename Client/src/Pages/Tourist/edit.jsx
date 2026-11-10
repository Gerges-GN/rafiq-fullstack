import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  Camera, X, Plus, Save, ArrowLeft, Loader2
} from 'lucide-react';
import { authFetch } from '../../services/authFetch';
const API_BASE_URL = import.meta.env.VITE_API_URL|| "/api";
export default function EditProfile() {
  const verifiedUser = useOutletContext();
  const userId = verifiedUser?._id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    headline: '',
    quote: '',
    bio: '',
    location: '',
    website: '',
    languages: [],
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [fileError, setFileError] = useState({});

  const [languageInput, setLanguageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing profile data to pre-fill the form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${API_BASE_URL}/profiles/${userId}`);
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();

        setFormData({
          headline: data.headline || '',
          quote: data.quote || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          languages: data.languages || [],
        });
        setAvatarPreview(data.avatarUrl || '');
        setCoverPreview(data.coverUrl || '');
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

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError((prev) => ({ ...prev, [type]: 'Please select an image file.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError((prev) => ({ ...prev, [type]: 'Image must be under 5MB.' }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
    setFileError((prev) => ({ ...prev, [type]: null }));
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

  const uploadImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append('image', file);

    const res = await authFetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: uploadData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Image upload failed');
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let avatarUrl = avatarPreview;
      let coverUrl = coverPreview;

      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }
      if (coverFile) {
        coverUrl = await uploadImage(coverFile);
      }

      const res = await authFetch(`${API_BASE_URL}/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, avatarUrl, coverUrl }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      navigate('/tourist/profile');
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover + Avatar preview, both now clickable file inputs */}
          <div className="relative h-40 sm:h-56 w-full bg-gray-100">
            {coverPreview && (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            )}
            <label className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 rounded-lg shadow-sm hover:bg-white transition-colors cursor-pointer">
              <Camera className="w-3.5 h-3.5" /> Change Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'cover')}
              />
            </label>

            <div className="absolute -bottom-10 left-6">
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md bg-gray-200"
                />
                <label className="absolute bottom-0 right-0 p-1.5 bg-orange-500 text-white rounded-full shadow-sm hover:bg-orange-600 transition-colors cursor-pointer">
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e, 'avatar')}
                  />
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="pt-14 px-6 pb-6 space-y-5">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {(fileError.avatar || fileError.cover) && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {fileError.avatar || fileError.cover}
              </div>
            )}

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
