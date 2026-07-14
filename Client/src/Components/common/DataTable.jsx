import React from 'react'

/**
 * Minimal, presentational data table. Callers pass column defs (with a
 * custom `render` per column) and row data, keeping this component fully
 * reusable across Guides, Users, Bookings, etc.
 *
 * @param {Object} props
 * @param {{key: string, header: string, render?: (row:any)=>React.ReactNode, className?: string}[]} props.columns
 * @param {Array<Object>} props.rows
 * @param {(row:any)=>void} [props.onRowClick]
 * @param {any} [props.selectedRowId]
 * @param {string} [props.rowIdKey='id']
 */
export default function DataTable({ columns, rows, onRowClick, selectedRowId, rowIdKey = 'id' }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left font-semibold text-ink-500 pb-3 px-2 first:pl-6 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isSelected = selectedRowId != null && row[rowIdKey] === selectedRowId
            return (
              <tr
                key={row[rowIdKey]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-surface-border last:border-0 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-[#fe6800]' : 'hover:bg-surface'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`py-3.5 px-2 first:pl-6 align-middle ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
