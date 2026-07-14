import React from 'react'

/**
 * Reusable status pill used across Guides, Places, Users, Bookings tables.
 *
 * @param {Object} props
 * @param {string} props.label - Text to display inside the badge.
 * @param {'green'|'orange'|'red'|'blue'|'gray'} [props.tone='gray'] - Color tone.
 * @param {string} [props.className] - Extra classes.
 */
const TONE_STYLES = {
  green: 'bg-status-greenBg text-status-green',
  orange: 'bg-status-orangeBg text-status-orange',
  red: 'bg-status-redBg text-status-red',
  blue: 'bg-status-blueBg text-status-blue',
  gray: 'bg-gray-100 text-ink-500',
}

// Maps common status strings to a tone automatically so callers can just
// pass the raw status text (e.g. "Approved", "Pending") without knowing
// which color it maps to.
const STATUS_TONE_MAP = {
  active: 'green',
  approved: 'green',
  completed: 'green',
  updated: 'green',
  confirmed: 'blue',
  'in progress': 'orange',
  pending: 'orange',
  'under review': 'orange',
  new: 'blue',
  suspended: 'red',
  suspicious: 'red',
  cancelled: 'red',
  canceled: 'red',
}

export default function Badge({ label, tone, className = '' }) {
  const resolvedTone = tone || STATUS_TONE_MAP[label?.toLowerCase()] || 'gray'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${TONE_STYLES[resolvedTone]} ${className}`}
    >
      {label}
    </span>
  )
}
