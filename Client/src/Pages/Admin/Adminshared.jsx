/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'
import { AlertCircle, CheckCircle2, X, Sparkles } from 'lucide-react'

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

export const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, delay, type: 'spring', stiffness: 260, damping: 22 },
})

export const slideFromRight = (delay = 0) => ({
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } },
}

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((payload, type = 'success') => {
    const t = typeof payload === 'string' ? { message: payload, type } : { ...payload, type: payload.type || type }
    setToast(t)
    setTimeout(() => setToast(null), 3800)
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, showToast, dismiss }
}

export function AnimatedCounter({ value, suffix = '', delay = 0, decimals = 0, className = 'text-3xl font-bold text-gray-900' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 })
  const display = useTransform(spring, (v) => {
    const rounded = decimals > 0 ? v.toFixed(decimals) : Math.round(v)
    if (suffix === '%') return `${rounded}${suffix}`
    if (typeof value === 'number' && value >= 1000) return Number(rounded).toLocaleString() + suffix
    return `${rounded}${suffix}`
  })

  useEffect(() => {
    const t = setTimeout(() => spring.set(value), delay * 1000)
    return () => clearTimeout(t)
  }, [value, delay, spring])

  return <motion.span className={className}>{display}</motion.span>
}

export function Toast({ toast, onDismiss }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95, x: 40 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[200] flex flex-col gap-2 px-5 py-4 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200' :
            toast.type === 'error' ? 'bg-red-50 border-red-200' :
            toast.type === 'critical' ? 'bg-red-600 border-red-700 text-white' :
            toast.type === 'info' ? 'bg-blue-50 border-blue-200' :
            'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' && (
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
                <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
              </motion.div>
            )}
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles size={20} className="text-blue-500 shrink-0 mt-0.5" />}
            {toast.type === 'critical' && (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <AlertCircle size={20} className="text-white shrink-0 mt-0.5" />
              </motion.div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${toast.type === 'critical' ? 'text-white' : 'text-gray-900'}`}>
                {toast.title || toast.message}
              </p>
              {toast.subtitle && (
                <p className={`text-xs mt-0.5 ${toast.type === 'critical' ? 'text-red-100' : 'text-gray-500'}`}>
                  {toast.subtitle}
                </p>
              )}
            </div>
            <motion.button whileHover={{ scale: 1.2, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onDismiss} className={`shrink-0 opacity-60 hover:opacity-100 ${toast.type === 'critical' ? 'text-white' : ''}`}>
              <X size={16} />
            </motion.button>
          </div>
          {toast.action && (
            <RippleButton
              onClick={() => { toast.action.onClick(); onDismiss() }}
              className={`mt-1 w-full py-2 rounded-lg text-xs font-bold ${
                toast.type === 'critical' ? 'bg-white text-red-600' : 'bg-brand text-white'
              }`}
            >
              {toast.action.label}
            </RippleButton>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function RippleButton({ children, className = '', onClick, disabled, ...props }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <motion.span
        className="absolute inset-0 bg-white/25 rounded-[inherit] pointer-events-none"
        initial={{ scale: 0, opacity: 0.6 }}
        whileTap={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.45 }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}

export function Modal({ open, onClose, title, subtitle, children, size = 'md' }) {
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] ${widths[size]} z-[160] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div>
                <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-bold text-gray-900">{title}</motion.h2>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
              <motion.button whileHover={{ scale: 1.15, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </motion.button>
            </div>
            <div className="p-6 overflow-y-auto scrollbar-thin">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-600 mb-6">{message}</motion.p>
      <div className="flex gap-3 justify-end">
        <RippleButton onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white">
          Cancel
        </RippleButton>
        <RippleButton
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md disabled:opacity-60 ${
            danger ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-brand hover:bg-brand-dark shadow-brand/30'
          }`}
        >
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full inline-block" />
          ) : confirmLabel}
        </RippleButton>
      </div>
    </Modal>
  )
}

export function ActionMenu({ items, align = 'right' }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.2, color: '#FF7A00' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="text-gray-300 hover:text-brand p-1"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </motion.button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl z-40 overflow-hidden`}
            >
              {items.map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { item.onClick(); setOpen(false) }}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                    item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-orange-50 hover:text-brand'
                  }`}
                >
                  {item.icon && <item.icon size={14} />}
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SuccessBurst({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i / 12) * Math.PI * 2) * 80,
                y: Math.sin((i / 12) * Math.PI * 2) * 80,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute w-3 h-3 rounded-full bg-brand"
            />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl"
          >
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { x: '10%', y: '20%', size: 280, color: 'rgba(255,122,0,0.07)', delay: 0 },
        { x: '80%', y: '60%', size: 220, color: 'rgba(59,130,246,0.06)', delay: 2 },
        { x: '60%', y: '10%', size: 180, color: 'rgba(255,122,0,0.05)', delay: 4 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ left: orb.x, top: orb.y, width: orb.size, height: orb.size, background: orb.color }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}
    </div>
  )
}

export function EntityAvatar({ initials, Icon, color, size = 'md' }) {
  const sz = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const iconSz = size === 'sm' ? 14 : 16
  return (
    <motion.div
      whileHover={{ scale: 1.12, rotate: Icon ? 0 : 8 }}
      whileTap={{ scale: 0.95 }}
      className={`${sz} rounded-full ${color} flex items-center justify-center text-white shrink-0`}
    >
      {Icon ? <Icon size={iconSz} /> : <span className="text-[10px] font-bold">{initials}</span>}
    </motion.div>
  )
}

export function ProgressRing({ value, size = 56, stroke = 4, color = '#FF7A00' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  )
}
