import React from 'react'
import { Search } from 'lucide-react'

/**
 * Search box with a leading magnifier icon, used in page headers and tables.
 *
 * @param {Object} props
 * @param {string} props.placeholder
 * @param {string} [props.value]
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 * @param {string} [props.className]
 */
export default function SearchInput({ placeholder = 'Search...', value, onChange, className = '' }) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
      />
    </div>
  )
}
