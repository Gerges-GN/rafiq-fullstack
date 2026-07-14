import React from 'react'

/**
 * Section intro used at the top of a page's main content area, e.g.
 * "Tourist Places Management" + description + primary "Add New Place" button.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action] - Usually a <Button> element.
 */
export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {description && <p className="text-sm text-ink-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
