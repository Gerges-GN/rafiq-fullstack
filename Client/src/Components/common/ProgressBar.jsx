import React from 'react'

/**
 * Horizontal progress bar used for "Content Completion" and "Activity" meters.
 *
 * @param {Object} props
 * @param {number} props.value - Percentage 0-100.
 * @param {string} [props.label] - Optional label shown above the bar (left side).
 * @param {boolean} [props.showPercent=true] - Show the percent value on the right.
 * @param {'brand'|'red'} [props.color='brand'] - Bar fill color.
 * @param {string} [props.className]
 */
export default function ProgressBar({
  value = 0,
  label,
  showPercent = true,
  color = 'brand',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const barColor = color === 'red' ? 'bg-status-red' : 'bg-brand-500'

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          {label && <span className="text-ink-500 font-medium">{label}</span>}
          {showPercent && <span className="text-ink-700 font-semibold">{clamped}%</span>}
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
