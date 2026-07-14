import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";

export default function EditGuideModal({ isOpen, onClose, onUpdate, guide }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (guide) {
      setName(guide.name || "");
      setCity(guide.city || "");
      setLanguages(guide.languages?.join(", ") || "");
      setAvatar(guide.avatar || "");
    }
  }, [guide]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !city || !languages) {
      alert("Please fill all required fields");
      return;
    }
    onUpdate({
      ...guide,
      name,
      city,
      languages: languages.split(",").map((l) => l.trim()),
      avatar: avatar || `https://i.pravatar.cc/150?u=${name}`,
    });
    onClose();
  };

  if (!isOpen || !guide) return null;

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
          <h2 className="text-xl font-bold text-ink-900 mb-6">Edit Guide</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ahmed Hassan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                City
              </label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Cairo, Egypt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Languages (comma-separated)
              </label>
              <Input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g., Arabic, English, French"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Avatar URL (Optional)
              </label>
              <Input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Guide
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
