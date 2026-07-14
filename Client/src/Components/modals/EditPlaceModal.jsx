import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import FilterDropdown from "../common/FilterDropdown.jsx";

export default function EditPlaceModal({ isOpen, onClose, onUpdate, place }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (place) {
      setName(place.name || "");
      setLocation(place.location || "");
      setCategory(place.category || "");
      setImage(place.image || "");
      setDescription(place.description || "");
    }
  }, [place]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location || !category || !image || !description) {
      alert("Please fill all fields");
      return;
    }
    onUpdate({
      ...place,
      name,
      location,
      category,
      image,
      description,
    });
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
                Image URL
              </label>
              <Input
                id="edit-place-image"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
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
              <Button type="submit" variant="primary">
                Update Place
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
