import React from 'react'

export default function Skeleton({ lines = 3, avatar = false, className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}> 
      <div className="flex items-start gap-3">
        {avatar && <div className="w-10 h-10 rounded-full bg-gray-200" />}
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
