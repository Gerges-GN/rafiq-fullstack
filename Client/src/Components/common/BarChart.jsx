import React from 'react'

/**
 * Lightweight bar chart built with plain divs (no chart library dependency)
 * so it stays fully theme-able with Tailwind classes.
 *
 * @param {Object} props
 * @param {{day: string, value: number}[]} props.data
 * @param {string} [props.className]
 */
export default function BarChart({ data = [], className = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className={`flex items-end justify-between gap-3 h-48 ${className}`}>
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
          <div className="w-full flex items-end justify-center h-full">
            <div
              className="w-full max-w-[32px] rounded-t-md bg-[#fe6800] group-hover:bg-[#fe6800] transition-colors"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-ink-400 font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  )
}
