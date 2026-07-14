import React from 'react'

/**
 * Small pill-style tab group used for list filters (e.g. "All / Pending / Approved").
 *
 * @param {Object} props
 * @param {string[]} props.tabs
 * @param {string} props.active
 * @param {(tab:string)=>void} props.onChange
 */
export default function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="inline-flex items-center bg-surface rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active === tab ? 'bg-white text-ink-900 shadow-card' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
