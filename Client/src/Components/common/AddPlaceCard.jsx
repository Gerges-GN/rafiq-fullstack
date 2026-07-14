import React from 'react'
import { MapPin } from 'lucide-react'

/**
 * Dashed-border call-to-action card inviting the admin to add a new item
 * (place, guide, etc). Kept generic via title/description/icon props.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {() => void} [props.onClick]
 * @param {React.ReactNode} [props.icon]
 */
export default function AddPlaceCard({ title, description, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-full min-h-[280px] w-full border-2 border-dashed border-brand-200 rounded-xl bg-brand-50/40 hover:bg-brand-50 transition-colors flex flex-col items-center justify-center text-center px-8 py-10"
    >
      <span className="w-14 h-14 rounded-full bg-white shadow-card flex items-center justify-center text-brand-500 mb-4">
        {icon || <MapPin size={22} />}
      </span>
      <p className="font-bold text-brand-600 mb-1.5">{title}</p>
      <p className="text-sm text-ink-500 max-w-xs">{description}</p>
    </button>
  )
}
