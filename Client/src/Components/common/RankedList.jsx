import React from 'react'

/**
 * List of items with a thumbnail, name, a horizontal magnitude bar, and a
 * trailing count. Used for "Most Searched Cities".
 *
 * @param {Object} props
 * @param {{name: string, searches: number, max: number, image?: string}[]} props.items
 * @param {string} [props.unitLabel='searches']
 */
export default function RankedList({ items = [], unitLabel = 'searches' }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-3">
          {item.image && (
            <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-ink-900">{item.name}</span>
              <span className="text-xs text-ink-500">
                {item.searches.toLocaleString()} {unitLabel}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(item.searches / item.max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
