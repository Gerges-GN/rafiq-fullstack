import React from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "../common/Button.jsx";

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-sm w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 z-10 p-1"
        >
          <X size={24} />
        </button>
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-5 text-lg font-medium text-ink-900">
            Delete {itemName || "item"}?
          </h3>
          <p className="mt-2 text-sm text-ink-500">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
