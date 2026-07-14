import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import {
  Star, AlertCircle, ShieldCheck, MapPin, ChevronDown,
  Trash2, Check, EyeOff, MoreVertical, Siren, MapPinned,
  AlertTriangle, CheckCircle2, X,
} from 'lucide-react'
import AdminLayout from '../../Components/Layout/DashboardLayout'
import { fetchReviews, fetchStats, flagReview, unflagReview } from '../../services/api'
import Skeleton from '../../Components/Admin/Skeleton'

const reviewIconMap = {
  'Total Reviews': Star,
  'Flagged Reviews': AlertCircle,
  'Published Reviews': ShieldCheck,
  'Average Rating': MapPin,
}

const reviewIconColorMap = {
  green: 'text-amber-500 bg-amber-50',
  red: 'text-red-500 bg-red-50',
  blue: 'text-blue-500 bg-blue-50',
  orange: 'text-brand bg-orange-50',
}

const defaultStatsData = [
  { label: 'Total Reviews', value: 1284, suffix: '', badge: '+12% this week', badgeColor: 'bg-green-50 text-green-600', icon: Star, iconColor: 'text-amber-500 bg-amber-50' },
  { label: 'New Flags', value: 23, suffix: '', badge: 'Action Needed', badgeColor: 'bg-red-50 text-red-600', icon: AlertCircle, iconColor: 'text-red-500 bg-red-50', pulse: true },
  { label: 'Verified Rate', value: 94, suffix: '%', badge: 'Standard Target', badgeColor: 'bg-slate-100 text-slate-600', icon: ShieldCheck, iconColor: 'text-blue-500 bg-blue-50' },
  { label: 'Flagged Guides', value: 5, suffix: '', badge: 'High Impact', badgeColor: 'bg-orange-50 text-orange-600', icon: MapPin, iconColor: 'text-brand bg-orange-50' },
]

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'places', label: 'Places' },
  { id: 'guides', label: 'Guides' },
  { id: 'negative', label: 'Most Negative', badge: 12 },
]

const sortOptions = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'rating-high', label: 'Highest Rating' },
  { id: 'rating-low', label: 'Lowest Rating' },
]

const alertGuides = [
  {
    id: 'ma', name: 'Mohamed Ali', location: 'Cairo', avatar: 'MA', color: 'bg-red-500',
    reports: 5, rating: 1.8, critical: true,
    primaryAction: 'Suspend Account', primaryColor: 'bg-red-500 hover:bg-red-600 shadow-red-200',
  },
  {
    id: 'yf', name: 'Yasser Fawzi', location: 'Luxor', avatar: 'YF', color: 'bg-orange-500',
    reports: 3, rating: 2.4, critical: false,
    primaryAction: 'Send Warning', primaryColor: 'bg-brand hover:bg-brand-dark shadow-brand/30',
  },
]

const PAGE_SIZE = 4
const TOTAL_REVIEWS = 1284

function normalizeReview(review) {
  const reviewerName = review.reviewerName || review.reviewer || 'Unknown'
  const entityName = review.entityName || review.entity || 'Unknown'
  const entityType = review.entityType || 'Place'
  const createdAt = review.createdAt ? new Date(review.createdAt) : null
  const status = review.status || 'PENDING'
  const flagged = review.flagged || status === 'FLAGGED'

  return {
    id: review._id || review.id || `${reviewerName}-${entityName}-${Math.random().toString(36).slice(2, 8)}`,
    reviewer: reviewerName,
    time: createdAt ? createdAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown',
    avatar: reviewerName.slice(0, 2).toUpperCase(),
    avatarColor: entityType === 'Guide' ? 'bg-blue-500' : 'bg-emerald-500',
    entity: entityName,
    entityType,
    entityAvatar: entityName.slice(0, 2).toUpperCase(),
    entityColor: entityType === 'Guide' ? 'bg-blue-500' : 'bg-emerald-500',
    rating: review.rating || 0,
    text: review.text || review.comment || 'No review text provided',
    status,
    statusColor: status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : status === 'FLAGGED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
    action: status === 'FLAGGED' ? 'delete' : status === 'UNDER REVIEW' ? 'verify' : 'menu',
    filter: entityType === 'Place' ? 'places' : 'guides',
    flagged,
    suspicious: review.suspicious || false,
    warning: review.warning || review.flagReason || '',
    tag: review.tag || (flagged ? 'FLAGGED REVIEW' : ''),
    date: createdAt ? Math.floor((Date.now() - createdAt.getTime()) / 3600000) : 0,
  }
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

function AnimatedCounter({ value, suffix = '', delay = 0 }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 })
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v)
    return suffix === '%' ? `${rounded}${suffix}` : rounded.toLocaleString() + suffix
  })

  useEffect(() => {
    const timeout = setTimeout(() => spring.set(value), delay * 1000)
    return () => clearTimeout(timeout)
  }, [value, delay, spring])

  return <motion.span className="text-3xl font-bold text-slate-900">{display}</motion.span>
}

function Stars({ count, max = 5, delay = 0 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: delay + i * 0.08, type: 'spring', stiffness: 300 }}
        >
          <Star
            size={14}
            className={i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
          />
        </motion.div>
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-white border-gray-200 text-gray-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ReviewsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('all')
  const [activePage, setActivePage] = useState(1)
  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [statsData, setStatsData] = useState(defaultStatsData)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [deletedIds, setDeletedIds] = useState([])
  const [verifiedIds, setVerifiedIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [actionedGuides, setActionedGuides] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadStats() {
      try {
        const response = await fetchStats()
        if (!mounted) return
        const mapped = (response.stats || []).map((item) => ({
          ...item,
          icon: reviewIconMap[item.label] || Star,
          iconColor: reviewIconColorMap[item.color] || 'text-slate-500 bg-slate-100',
        }))
        setStatsData(mapped.length ? mapped : defaultStatsData)
      } catch (err) {
        console.error(err)
      }
    }

    loadStats()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadReviews() {
      try {
        setLoadingData(true)
        setError(null)
        const response = await fetchReviews({
          filter: activeTab,
          search: searchQuery,
          sortBy,
          page: activePage,
          limit: PAGE_SIZE,
        })
        if (!mounted) return
        const normalized = (response.reviews || []).map(normalizeReview)
        setReviews(normalized)
        setTotalReviews(response.total || 0)
        setPageCount(response.pageCount || 1)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load reviews')
      } finally {
        if (mounted) setLoadingData(false)
      }
    }

    loadReviews()

    return () => {
      mounted = false
    }
  }, [activeTab, searchQuery, sortBy, activePage])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const filtered = useMemo(() => {
    return reviews.filter((r) => !deletedIds.includes(r.id) && !verifiedIds.includes(r.id))
  }, [reviews, deletedIds, verifiedIds])

  const activePageClamped = Math.min(Math.max(activePage, 1), Math.max(1, pageCount))
  const totalPages = Math.max(1, pageCount)
  const paginated = filtered.slice((activePageClamped - 1) * PAGE_SIZE, activePageClamped * PAGE_SIZE)

  const handleDelete = (id) => {
    setDeletingId(id)
    setTimeout(() => {
      setDeletedIds((ids) => [...ids, id])
      setDeletingId(null)
      showToast('Review deleted successfully', 'success')
    }, 400)
  }

  const handleVerify = (id) => {
    setVerifiedIds((ids) => [...ids, id])
    showToast('Review verified and published', 'success')
  }

  const handleGuideAction = (guide) => {
    setActionedGuides((ids) => [...ids, guide.id])
    showToast(
      guide.critical
        ? `${guide.name}'s account has been suspended`
        : `Warning sent to ${guide.name}`,
      guide.critical ? 'error' : 'success'
    )
  }

  const handleFlag = async (id) => {
    try {
      showToast('Flagging review...', 'success')
      const res = await flagReview({ id, reason: 'Manual flag from admin' })
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, flagged: true, status: 'FLAGGED', warning: res.updated?.flagReason || r.warning } : r)))
      showToast('Review flagged', 'success')
    } catch (e) {
      console.error(e)
      showToast('Failed to flag review', 'error')
    }
  }

  const handleUnflag = async (id) => {
    try {
      showToast('Unflagging review...', 'success')
      const res = await unflagReview({ id })
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, flagged: false, status: res.updated?.status || 'PUBLISHED', warning: '' } : r)))
      showToast('Review unflagged', 'success')
    } catch (e) {
      console.error(e)
      showToast('Failed to unflag review', 'error')
    }
  }

  if (loadingData) {
    return (
      <AdminLayout
        activePage="reviews"
        onNavigate={onNavigate}
        searchPlaceholder="Search reviews..."
      >
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-white/80 rounded-xl border border-gray-100">
              <Skeleton avatar lines={3} />
            </div>
          ))}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      activePage="reviews"
      onNavigate={onNavigate}
      searchPlaceholder="Search reviews..."
      searchValue={searchQuery}
      onSearchChange={(v) => { setSearchQuery(v); setActivePage(1) }}
      onGenerateReport={() => onNavigate('reports')}
    >
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <motion.div {...fadeUp(0)} className="mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl font-bold text-gray-900"
        >
          Review & Rating Management
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-slate-500 mt-1 text-sm"
        >
          Monitor quality, delete offensive content, and track guide performance.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"
      >
        {statsData.map((s, i) => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 28, scale: 0.94 }, show: { opacity: 1, y: 0, scale: 1 } }}
            whileHover={{ y: -5, boxShadow: '0 24px 60px rgba(15,23,42,0.12)' }}
            className="relative bg-white rounded-3xl p-5 border border-slate-200 shadow-xl overflow-hidden group"
          >
            <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</span>
              <motion.div
                animate={s.pulse ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`p-2 rounded-lg ${s.iconColor}`}
              >
                <s.icon size={18} />
              </motion.div>
            </div>
            <div className="flex items-end justify-between">
              <AnimatedCounter value={s.value} suffix={s.suffix} delay={0.2 + i * 0.1} />
              <motion.span
                animate={s.pulse ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className={`text-xs font-semibold px-2 py-1 rounded-full ${s.badgeColor}`}
              >
                {s.badge}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div {...fadeUp(0.15)} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-3xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActivePage(1) }}
                className="relative px-4 py-2 text-sm font-medium rounded-full transition duration-200"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="review-tab"
                    className="absolute inset-0 bg-brand rounded-full shadow-lg shadow-brand/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1.5 ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`}>
                  {tab.label}
                  {tab.badge && (
                    <motion.span
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 rounded-2xl px-3 py-2 bg-white shadow-sm"
            >
              {sortOptions.find((o) => o.id === sortBy)?.label}
              <motion.div animate={{ rotate: sortOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-slate-500" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl border border-slate-200 shadow-xl z-20 overflow-hidden"
                >
                  {sortOptions.map((opt, i) => (
                    <motion.button
                      key={opt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => { setSortBy(opt.id); setSortOpen(false); setActivePage(1) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition duration-150 ${
                        sortBy === opt.id ? 'bg-orange-50 text-brand font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                {['Reviewer', 'Entity (Guide/Place)', 'Rating & Content', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-slate-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginated.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Star size={28} className="text-slate-400" />
                        </div>
                        <p className="text-slate-700 font-medium">No reviews found</p>
                        <p className="text-xs text-slate-500">Try adjusting your filters or search query</p>
                      </motion.div>
                    </td>
                  </motion.tr>
                ) : (
                  paginated.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{
                        opacity: deletingId === row.id ? 0 : 1,
                        x: 0,
                        scale: deletingId === row.id ? 0.95 : 1,
                        backgroundColor: deletingId === row.id ? 'rgba(254,226,226,0.5)' : undefined,
                      }}
                      exit={{ opacity: 0, x: 40, height: 0, transition: { duration: 0.3 } }}
                      transition={{ delay: i * 0.06, layout: { duration: 0.3 } }}
                      whileHover={{ backgroundColor: row.flagged ? 'rgba(254,226,226,0.25)' : 'rgba(15,23,42,0.03)' }}
                      className={`border-b border-slate-100 ${row.flagged ? 'bg-red-50/30' : 'bg-white'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.12, rotate: 5 }}
                            className={`w-9 h-9 rounded-full ${row.avatarColor} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {row.avatar}
                          </motion.div>
                          <div>
                            <p className="font-medium text-slate-900">{row.reviewer}</p>
                            <p className="text-xs text-slate-500">{row.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${row.entityColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                            {row.entityAvatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{row.entity}</p>
                            <p className="text-xs text-slate-500">
                              {row.entityType === 'Guide' ? `Tour Guide in '${row.entity === 'Mohamed Ali' ? 'Cairo' : row.entity === 'Yasser Fawzi' ? 'Luxor' : 'Cairo'}'` : row.entityType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        {row.suspicious ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5"
                          >
                            <motion.div
                              animate={{ rotate: [0, -5, 5, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            >
                              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            </motion.div>
                            <p className="text-xs text-amber-700 font-medium leading-relaxed">{row.warning}</p>
                          </motion.div>
                        ) : (
                          <>
                            <Stars count={row.rating} delay={0.3 + i * 0.05} />
                            <p className="text-slate-700 text-xs mt-1.5 line-clamp-2">{row.text}</p>
                          </>
                        )}
                        {row.tag && (
                          <motion.span
                            animate={{ opacity: [1, 0.6, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="inline-block mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded"
                          >
                            {row.tag}
                          </motion.span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <motion.span
                          whileHover={{ scale: 1.06 }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${row.statusColor}`}
                        >
                          {row.status}
                        </motion.span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {row.action === 'delete' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(row.id)}
                                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md"
                              >
                                <Trash2 size={13} />
                                Delete Instantly
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, color: '#475569' }}
                                className="text-slate-400 hover:text-slate-600 p-1 transition-colors duration-200"
                              >
                                <EyeOff size={18} />
                              </motion.button>
                            </>
                          )}
                          {row.action === 'verify' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 4px 20px rgba(255,122,0,0.35)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleVerify(row.id)}
                                className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-3 py-2 rounded-lg"
                              >
                                <Check size={13} />
                                Verify
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.15, color: '#EF4444' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(row.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            </>
                          )}
                          {row.action === 'menu' && (
                            <motion.button
                              whileHover={{ scale: 1.2, color: '#FF7A00' }}
                              whileTap={{ scale: 0.9 }}
                              className="text-slate-400 hover:text-brand p-1 transition-colors duration-200"
                            >
                              <MoreVertical size={18} />
                            </motion.button>
                          )}
                          {row.flagged ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUnflag(row.id)}
                              className="text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg"
                            >
                              Unflag
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleFlag(row.id)}
                              className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg"
                            >
                              Flag
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between px-5 py-4 border-t border-slate-200 gap-3">
          <motion.p
            key={`${activePageClamped}-${filtered.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-400"
          >
            Showing {(activePageClamped - 1) * PAGE_SIZE + 1}–{Math.min(activePageClamped * PAGE_SIZE, filtered.length)} of {(totalReviews || TOTAL_REVIEWS).toLocaleString()} reviews
          </motion.p>
          <div className="flex items-center gap-1">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => idx + 1).map((p) => (
                <motion.button
                  key={p}
                  layout
                  onClick={() => setActivePage(p)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    activePageClamped === p ? 'bg-brand text-white shadow-md shadow-brand/30' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.3)}>
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Siren size={20} className="text-red-500" />
          </motion.div>
          <h3 className="font-semibold text-gray-900">Guides Requiring Action (Repeated Alerts)</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {alertGuides.filter((g) => !actionedGuides.includes(g.id)).map((guide, i) => (
              <motion.div
                key={guide.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 60, transition: { duration: 0.35 } }}
                transition={{ delay: 0.4 + i * 0.12 }}
                whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}
                className={`relative bg-white/80 backdrop-blur-sm rounded-xl p-5 border ${
                  guide.critical ? 'border-red-200 shadow-red-50' : 'border-slate-200'
                } shadow-sm overflow-hidden`}
              >
                {guide.critical && (
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4], backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
                  />
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      className={`w-12 h-12 rounded-full ${guide.color} flex items-center justify-center text-white font-bold`}
                    >
                      {guide.avatar}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{guide.name}</p>
                        {guide.critical && (
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full"
                          >
                            CRITICAL
                          </motion.span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPinned size={11} />
                        Tour Guide in &apos;{guide.location}&apos;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mb-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-gray-900">{guide.reports}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Reports this week</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                  >
                    <p className="text-2xl font-bold text-red-500">{guide.rating}</p>
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Avg Rating</p>
                  </motion.div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleGuideAction(guide)}
                    className={`flex-1 text-white text-sm font-semibold py-2.5 rounded-lg shadow-md ${guide.primaryColor}`}
                  >
                    {guide.primaryAction}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04, borderColor: '#FF7A00', color: '#FF7A00' }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 bg-white transition-colors"
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </AdminLayout>
  )
}
