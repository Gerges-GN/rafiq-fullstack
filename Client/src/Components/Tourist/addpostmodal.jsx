import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, ImagePlus, Loader2 } from "lucide-react";
import { authFetch } from '../../services/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const AddPostModal = ({ onClose, ownerId, onPostCreated }) => {
  const [formData, setFormData] = useState({
    tripLocation: "",
    title: "",
    description: "",
  });

  // Each item: { file, preview }
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      // Release object URLs to avoid memory leaks
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Please select image files only.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be under 5MB.");
        continue;
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }

    if (validFiles.length > 0) {
      setError(null);
      setImages((prev) => [...prev, ...validFiles]);
    }

    e.target.value = ""; // allow re-selecting the same file later
  };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
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

    setError(null);

    if (images.length === 0) {
      setError("Please add at least one image.");
      return;
    }

    if (!formData.tripLocation.trim()) {
      setError("Trip location is required.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!ownerId) {
      setError("Missing owner id.");
      return;
    }

    try {
      setSubmitting(true);

      const uploadedUrls = await Promise.all(
        images.map((img) => uploadImage(img.file))
      );

      const res = await authFetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: ownerId,
          images: uploadedUrls,
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      const newPost = await res.json();

      onPostCreated?.(newPost);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            Add New Memory
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Images
            </label>

            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <img
                    src={img.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-orange-400 transition-colors text-xs text-gray-500">
                <ImagePlus className="w-5 h-5 text-gray-400" />
                <span>Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </label>
            </div>
          </div>

          {/* Trip */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Trip Location
            </label>

            <input
              type="text"
              name="tripLocation"
              value={formData.tripLocation}
              onChange={handleChange}
              placeholder="Siwa Oasis, Egypt"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Amazing sunset in Siwa"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <textarea
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell everyone about your adventure..."
              className="w-full border rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-orange-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 flex justify-center items-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Post Memory"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddPostModal;
