import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Simple numbered pagination with prev/next arrows.
 *
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {(page:number)=>void} props.onPageChange
 * @param {string} [props.className]
 */
export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange = () => {}, className = '' }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border text-ink-500 hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            page === currentPage
              ? 'bg-brand-500 text-white'
              : 'border border-surface-border text-ink-700 hover:bg-surface'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-surface-border text-ink-500 hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
