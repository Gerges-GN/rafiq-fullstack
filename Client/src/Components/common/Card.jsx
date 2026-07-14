import React from 'react'

/**
 * Generic white rounded card wrapper used for panels, list containers,
 * and table wrappers throughout the dashboard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.noPadding=false] - Skip default padding (useful when a table needs full-bleed rows).
 */
export default function Card({ children, className = '', noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card border border-surface-border ${
        noPadding ? '' : 'p-5'
      } ${className}`}
    >
      {children}
    </div>
  )
}
