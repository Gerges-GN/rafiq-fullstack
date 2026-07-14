import React from "react";

/**
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'} [props.size='md']
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
const VARIANT_STYLES = {
  primary: "bg-[#fe6800] text-white hover:bg-[#fe6800] shadow-card",
  secondary:
    "bg-white text-ink-700 border border-surface-border hover:bg-surface",
  outline:
    "bg-transparent text-[#fe6800] border border-[#fe6800] hover:bg-[#fe6800]",
  danger:
    "bg-white text-status-red border border-status-red/30 hover:bg-status-redBg",
  ghost: "bg-transparent text-ink-500 hover:bg-surface",
};

const SIZE_STYLES = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors whitespace-nowrap ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
