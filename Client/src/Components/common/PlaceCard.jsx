import React from "react";
import Badge from "../common/Badge.jsx";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import { MapPin, Edit, Trash2 } from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";

export default function PlaceCard({
  name,
  location,
  description,
  image,
  tag,
  variant = "compact",
  status,
  completion,
  onClick,
  onEdit,
  onDelete,
}) {
  if (variant === "featured") {
    return (
      <div
        className="relative rounded-xl overflow-hidden h-full group cursor-pointer"
        onClick={onClick}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-5 text-white">
          {tag && <Badge label={tag} tone="orange" className="mb-2" />}
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm opacity-80">{location}</p>
        </div>
      </div>
    );
  }

  if (variant === "default") {
    return (
      <Card className="p-0 overflow-hidden flex flex-col">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="p-4 flex flex-col">
          <div className="cursor-pointer" onClick={onClick}>
            <h3 className="font-semibold text-lg text-ink-900 dark:text-gray-200">
              {name}
            </h3>
            <p className="text-sm text-ink-600 dark:text-gray-400 mb-2">
              {location}
            </p>
            {description && (
              <p className="text-sm text-ink-700 dark:text-gray-300">
                {description.substring(0, 100)}...
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={18} className="m-1" />
            </Button>
            <Button
              variant="danger-outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card border border-surface-border p-4 flex gap-4 items-center">
      <img
        src={image}
        alt={name}
        className="w-24 h-24 rounded-lg object-cover cursor-pointer"
        onClick={onClick}
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4
            className="font-semibold text-black mb-1 cursor-pointer"
            onClick={onClick}
          >
            {name}
          </h4>
          <div className="flex items-center gap-2">
            {status && <Badge label={status} />}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="danger-outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1 text-ink-500 text-sm mb-3 cursor-pointer"
          onClick={onClick}
        >
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        {completion != null && (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onClick}
          >
            <ProgressBar value={completion} className="flex-1" />
            <span className="text-xs font-semibold text-ink-700">
              {completion}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
