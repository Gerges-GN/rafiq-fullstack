import React from 'react'
import { Plus } from 'lucide-react'

/**
 * Circular floating action button pinned to the bottom-right of a panel.
 *
 * @param {Object} props
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
export default function FloatingActionButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-lg flex items-center justify-center transition-colors ${className}`}
      aria-label="Add"
    >
      <Plus size={20} />
    </button>
  )
}
