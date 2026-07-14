import React from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Pill-style dropdown filter, e.g. "All Cities", "All Categories".
 * Purely presentational native <select> styled to match the mockups.
 *
 * @param {Object} props
 * @param {string[]} props.options
 * @param {string} [props.value]
 * @param {(e: React.ChangeEvent<HTMLSelectElement>) => void} [props.onChange]
 * @param {string} [props.className]
 */
export default function FilterDropdown({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none pl-4 pr-9 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-[#fe6800] cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
    </div>
  )
}
