import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";

export default function EditUserModal({ isOpen, onClose, onUpdate, user }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLocation(user.location || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location) {
      alert("Please fill all required fields");
      return;
    }
    onUpdate({
      ...user,
      name,
      location,
      avatar: avatar || `https://i.pravatar.cc/150?u=${name}`,
    });
    onClose();
  };

  if (!isOpen || !user) return null;

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
          <h2 className="text-xl font-bold text-ink-900 mb-6">Edit User</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">
                Location
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., London, UK"
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
                Update User
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
