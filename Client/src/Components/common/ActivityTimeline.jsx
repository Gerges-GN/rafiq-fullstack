import React from 'react'
import { UserPlus, CalendarCheck, Flag, Star } from 'lucide-react'

/**
 * Vertical timeline of recent activity events, e.g. new guide joined,
 * booking confirmed, report filed, review received.
 *
 * @param {Object} props
 * @param {{id: any, type: 'guide'|'booking'|'report'|'review', text: string, time: string}[]} props.items
 */
const TYPE_STYLES = {
  guide: { icon: UserPlus, bg: 'bg-[#fe6800]' },
  booking: { icon: CalendarCheck, bg: 'bg-ink-700' },
  report: { icon: Flag, bg: 'bg-status-red' },
  review: { icon: Star, bg: 'bg-status-green' },
}

export default function ActivityTimeline({ items = [] }) {
  return (
    <ul className="relative">
      {items.map((item, idx) => {
        const { icon: Icon, bg } = TYPE_STYLES[item.type] || TYPE_STYLES.booking
        const isLast = idx === items.length - 1
        return (
          <li key={item.id} className="relative pl-11 pb-6 last:pb-0">
            {!isLast && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-surface-border" />
            )}
            <span
              className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${bg}`}
            >
              <Icon size={15} />
            </span>
            <p className="text-sm text-ink-900 font-medium leading-snug">{item.text}</p>
            <p className="text-xs text-ink-400 mt-0.5">{item.time}</p>
          </li>
        )
      })}
    </ul>
  )
}
