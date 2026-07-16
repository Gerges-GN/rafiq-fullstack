import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";

const AddPostModal = ({ onClose, ownerId, onPostCreated }) => {
  const [formData, setFormData] = useState({
    tripLocation: "",
    title: "",
    description: "",
  });

  const [imageUrls, setImageUrls] = useState([""]);
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
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (index, value) => {
    setImageUrls((prev) =>
      prev.map((url, i) => (i === index ? value : url))
    );
  };

  const addImageField = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const removeImageField = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    const cleanedImages = imageUrls
      .map((url) => url.trim())
      .filter(Boolean);

    if (cleanedImages.length === 0) {
      setError("Please add at least one image URL.");
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

      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: ownerId,
          images: cleanedImages,
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
              Image URLs
            </label>

            <div className="space-y-3">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 flex items-center border rounded-lg px-3 py-2">
                    <ImageIcon className="w-4 h-4 text-gray-400 mr-2" />

                    <input
                      type="text"
                      value={url}
                      placeholder="https://..."
                      onChange={(e) =>
                        handleImageUrlChange(index, e.target.value)
                      }
                      className="flex-1 outline-none text-sm"
                    />
                  </div>

                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addImageField}
              className="mt-3 flex items-center gap-2 text-orange-600 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add another image
            </button>
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