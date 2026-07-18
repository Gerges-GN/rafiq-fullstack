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
      <div className="relative group mt-8 cursor-pointer" onClick={onClick}>
        <div className="relative z-10 transition-transform duration-300 ease-in-out group-hover:scale-101 group-hover:-translate-y-2">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover rounded-t-xl shadow-lg"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            <div className="flex items-center text-sm opacity-80 mt-1">
              <MapPin size={12} className="mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <Card noPadding className="relative -mt-10 pt-14 px-4 pb-4">
          {description ? (
            <p className="text-sm text-ink-700 light:text-gray-300 line-clamp-2">
              {description}
            </p>
          ) : (
            <div className="h-8" /> /* Placeholder to maintain height */
          )}
        </Card>

        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="!p-2 bg-white/80 backdrop-blur-sm hover:bg-white text-ink-700"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="!p-2 bg-white/80 backdrop-blur-sm text-status-red hover:bg-status-red hover:text-white"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
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
