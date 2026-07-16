import React, { useState, useEffect } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import FilterDropdown from "../common/FilterDropdown.jsx";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export default function EditPlaceModal({ isOpen, onClose, onUpdate, place }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (place) {
      setName(place.name || "");
      setLocation(place.location || "");
      setCategory(place.category || "");
      setImageFile(null);
      setImagePreview(place.image || "");
      setDescription(place.description || "");
      setError(null);
    }
  }, [place]);

  const handleImageSelect = (e) => {
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

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const uploadImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/upload/image`, {
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

    if (!name || !location || !category || !imagePreview || !description) {
      setError("Please fill all fields");
      return;
    }

    try {
      setUploading(true);

      // Only upload if a new file was picked, otherwise keep the existing URL
      const imageUrl = imageFile ? await uploadImage(imageFile) : imagePreview;

      onUpdate({
        ...place,
        name,
        location,
        category,
        image: imageUrl,
        description,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !place) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 z-10 p-1"
        >
          <X size={24} />
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold text-ink-900 mb-6">Edit Place</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="edit-place-name"
                className="block text-sm font-medium text-ink-700 mb-1"
              >
                Name
              </label>
              <Input
                id="edit-place-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Pyramids of Giza"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-place-location"
                  className="block text-sm font-medium text-ink-700 mb-1"
                >
                  City
                </label>
                <Input
                  id="edit-place-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Cairo"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-place-category"
                  className="block text-sm font-medium text-ink-700 mb-1"
                >
                  Category
                </label>
                <FilterDropdown
                  id="edit-place-category"
                  options={["Touristic", "Historical"]}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="edit-place-image"
                className="block text-sm font-medium text-ink-700 mb-1"
              >
                Image
              </label>
              <label
                htmlFor="edit-place-image"
                className="flex flex-col items-center justify-center gap-1 w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-brand-500 transition-colors text-xs text-gray-500 overflow-hidden"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Place preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span>Upload image</span>
                  </>
                )}
                <input
                  id="edit-place-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            </div>
            <div>
              <label
                htmlFor="edit-place-description"
                className="block text-sm font-medium text-ink-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="edit-place-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                placeholder="A short description of the place..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={uploading}>
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </span>
                ) : (
                  "Update Place"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}