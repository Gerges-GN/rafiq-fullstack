import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Download, Share2, Filter, ArrowUpDown, Plus, Eye, AlertCircle, ShieldCheck, AlertTriangle,
} from 'lucide-react'
import { fetchStats, fetchChart, fetchClassifications, fetchIncidents } from '../../services/api'
import AdminLayout from '../../Components/Layout/DashboardLayout'
// data loaded from backend

const statsIconMap = {
  'Total Reports': AlertCircle,
  'Guide Activity': ShieldCheck,
  'Transaction Efficiency': ArrowUpDown,
  'Response Rate': AlertTriangle,
}

const trendColors = {
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
}

const iconColors = {
  red: 'text-red-500 bg-red-50',
  blue: 'text-blue-500 bg-blue-50',
  green: 'text-green-500 bg-green-50',
  orange: 'text-brand bg-orange-50',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

const stagger = { staggerChildren: 0.08, delayChildren: 0.1 }

export default function ReportsPage({ onNavigate }) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [activePage, setActivePage] = useState(1)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [stats, setStats] = useState([])
  const [chartData, setChartData] = useState([])
  const [classifications, setClassifications] = useState([])
  const [incidents, setIncidents] = useState([])

  const handleUpdate = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1800)
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoadingData(true)
        const [sRes, cRes, clsRes, iRes] = await Promise.all([
          fetchStats(), fetchChart(), fetchClassifications(), fetchIncidents(),
        ])
        if (!mounted) return
        setStats(sRes.stats || [])
        setChartData(cRes.chartData || [])
        setClassifications(clsRes.classifications || [])
        setIncidents(iRes.incidents || [])
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoadingData(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (error) {
    return (
      <AdminLayout activePage="reports" onNavigate={onNavigate}>
        <div className="text-red-600">Error loading data: {error}</div>
      </AdminLayout>
    )
  }

  if (loadingData) {
    return (
      <AdminLayout activePage="reports" onNavigate={onNavigate}>
        <div className="text-slate-600">Loading data...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activePage="reports" onNavigate={onNavigate} searchPlaceholder="Search destinations..." onGenerateReport={() => onNavigate('reports')}>

          <motion.div {...fadeUp(0)} className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Logs</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Comprehensive analysis of platform performance and security audit logs.
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.04, borderColor: '#FF7A00' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-white hover:shadow-md transition-shadow"
              >
                <Download size={16} />
                Export PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(255,122,0,0.35)' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Share2 size={16} />
                Share Report
              </motion.button>
            </div>
          </motion.div>
          <motion.div
            variants={{ animate: { transition: stagger } }}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={{
                  initial: { opacity: 0, y: 30, scale: 0.95 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(15,23,42,0.1)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 cursor-default"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {s.label}
                  </span>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
                    className={`p-2 rounded-lg ${iconColors[s.color]}`}
                  >
                    {(() => {
                      const Icon = s.icon || statsIconMap[s.label] || AlertCircle
                      return <Icon size={18} />
                    })()}
                  </motion.div>
                </div>
                <div className="flex items-end justify-between">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                    className="text-3xl font-bold text-gray-900"
                  >
                    {s.value}
                  </motion.span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendColors[s.color]}`}>
                    {s.trend}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <motion.div
              {...fadeUp(0.2)}
              className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">
                  Platform Performance Analysis
                  <span className="text-slate-500 font-normal text-sm ml-1">(Last 30 Days)</span>
                </h3>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-200" /> Reports
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand" /> Active Users
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,122,0,0.06)' }}
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                  />
                  <Bar
                    dataKey="reports"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    onMouseEnter={(_, idx) => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={hoveredBar === i ? '#FF7A00' : '#FED7AA'}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="users" radius={[6, 6, 0, 0]} animationDuration={1400} animationBegin={200}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.day === 'Mar 20' ? '#FF7A00' : '#FF7A0060'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              {...fadeUp(0.3)}
              className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 flex flex-col"
            >
              <h3 className="font-semibold text-gray-900 mb-5">Report Classification</h3>
              <div className="flex-1 space-y-4">
                {classifications.map((c, i) => (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600">{c.label}</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                        className="font-semibold text-gray-800"
                      >
                        {c.pct}%
                      </motion.span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        transition={{ duration: 1, delay: 0.4 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${c.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-slate-400">Data updated 2 minutes ago</p>
                <motion.button
                  onClick={handleUpdate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="spin"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ rotate: { repeat: Infinity, duration: 0.8, ease: 'linear' } }}
                        className="w-3.5 h-3.5 border-2 border-gray-400 border-t-brand rounded-full inline-block"
                      />
                    ) : null}
                  </AnimatePresence>
                  {loading ? 'Updating...' : 'Manual Update'}
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            {...fadeUp(0.4)}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Detailed Incident Log</h3>
              <div className="flex items-center gap-2">
                {[
                  { icon: Filter, label: 'Filter' },
                  { icon: ArrowUpDown, label: 'Sort' },
                ].map((btn) => (
                  <motion.button
                    key={btn.label}
                    whileHover={{ scale: 1.05, backgroundColor: '#F3F4F6' }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg"
                  >
                    <btn.icon size={14} />
                    {btn.label}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-brand text-white rounded-lg shadow-md shadow-brand/30"
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                    {['Entity Reported', 'Type', 'Date & Time', 'Primary Reason', 'Status', 'Action'].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((row, i) => (
                    <motion.tr
                      key={row.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ backgroundColor: 'rgba(255,122,0,0.04)' }}
                      className="border-b border-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            className={`w-9 h-9 rounded-full ${row.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                          >
                            {row.avatar}
                          </motion.div>
                          <div>
                            <p className="font-medium text-gray-900">{row.name}</p>
                            <p className="text-xs text-slate-400">{row.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.type}</td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{row.date}</p>
                        <p className="text-xs text-slate-400">{row.time}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-[200px]">{row.reason}</td>
                      <td className="px-6 py-4">
                        <motion.span
                          whileHover={{ scale: 1.08 }}
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${row.statusColor}`}
                        >
                          {row.status}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          whileHover={{ scale: 1.2, color: '#FF7A00' }}
                          whileTap={{ scale: 0.9 }}
                          className="text-slate-400 hover:text-brand transition-colors"
                        >
                          <Eye size={18} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-slate-200 gap-3">
              <p className="text-xs text-slate-400">Showing 4 of 1,284 reports</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setActivePage(p)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      activePage === p
                        ? 'bg-brand text-white shadow-md shadow-brand/30'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
                <motion.button whileHover={{ x: 2 }} className="p-1.5 text-slate-400 hover:text-brand ml-1">
                  →
                </motion.button>
              </div>
            </div>
          </motion.div>
    </AdminLayout>
  )
}
