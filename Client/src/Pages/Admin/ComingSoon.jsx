import React from 'react'
import DashboardLayout from '../../Components/Layout/DashboardLayout.jsx'
import Card from '../../Components/common/Card.jsx'
import { currentAdmin } from '../../data/mockData.js'

/**
 * Generic placeholder used for sidebar routes that weren't part of the
 * provided mockups (Chats, Reviews, Pricing/Fraud, Reports), so navigation
 * never 404s. Swap this out with a real page component whenever a design
 * for that section is available.
 *
 * @param {Object} props
 * @param {string} props.title
 */
export default function ComingSoon({ title }) {
  return (
    <DashboardLayout
      sidebarProps={{ footer: 'logout' }}
      topbarProps={{ title: 'Admin Panel - Tourism Management', user: currentAdmin.guides }}
    >
      <Card className="flex flex-col items-center justify-center text-center py-24">
        <h2 className="text-xl font-bold text-ink-900 mb-2">{title}</h2>
        <p className="text-sm text-ink-500 max-w-sm">
          This section isn't in the current mockups yet. Drop in a page component here once a design is ready.
        </p>
      </Card>
    </DashboardLayout>
  )
}
