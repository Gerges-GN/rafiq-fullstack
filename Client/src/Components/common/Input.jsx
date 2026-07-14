import React from "react";

/**
 * A generic styled input component.
 *
 * @param {Object} props - The props for the input component.
 * @param {string} [props.type='text'] - The type of the input.
 * @param {string} [props.className] - Additional class names.
 */
export default function Input({ type = "text", className = "", ...rest }) {
  return (
    <input
      type={type}
      className={`w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 ${className}`}
      {...rest}
    />
  );
}
