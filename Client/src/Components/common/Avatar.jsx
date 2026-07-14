import React from "react";

/**
 * Circular avatar with optional online-status dot and image fallback.
 *
 * @param {Object} props
 * @param {string} [props.src] - Image URL.
 * @param {string} props.alt - Alt text (also used to build initials fallback).
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.online] - Show a small green dot indicating active status.
 * @param {string} [props.ring] - Tailwind ring color class, e.g. 'ring-brand-500'.
 */
const SIZE_MAP = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({
  src,
  alt = "",
  size = "md",
  online = false,
  ring,
}) {
  const sizeClasses = SIZE_MAP[size];
  return (
    <div className={`relative inline-flex flex-shrink-0 ${sizeClasses}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full rounded-full object-cover ${ring ? `ring-4 ${ring}` : ""}`}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-[#fe6800] text-white font-semibold flex items-center justify-center ${
            ring ? `ring-4 ${ring}` : ""
          }`}
        >
          {initials(alt)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-status-green ring-2 ring-white" />
      )}
    </div>
  );
}
