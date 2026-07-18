import React from "react";

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
export default function DataTable({
  columns,
  rows,
  onRowClick,
  selectedRowId,
  rowIdKey = "id",
}) {
  return (
    <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-white">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left font-medium text-gray-400 uppercase text-xs tracking-wide pb-3 pt-4 px-2 first:pl-6 last:pr-6 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isSelected =
              selectedRowId != null && row[rowIdKey] === selectedRowId;
            return (
              <tr
                key={row[rowIdKey]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-100 last:border-0 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-[#b5541e]/10 ring-1 ring-inset ring-[#b5541e]/30"
                    : idx % 2 === 1
                      ? "bg-gray-50/60 hover:bg-gray-100/70"
                      : "bg-white hover:bg-gray-50"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-4 px-2 first:pl-6 last:pr-6 align-middle text-gray-700 ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
