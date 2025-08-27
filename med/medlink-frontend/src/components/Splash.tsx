import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export default function Splash({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white">
      {/* Glow backdrop */}
      <div className="absolute inset-0 opacity-30" style={{
        background:
          'radial-gradient(600px 600px at 50% 50%, rgba(16,185,129,0.6), transparent 60%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        {/* Rotating ring */}
        {!reduce && (
          <motion.span
            className="absolute -inset-12 rounded-full border border-white/15"
            style={{ boxShadow: '0 0 120px rgba(255,255,255,0.1) inset' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-xl">
          <MapPin className="h-8 w-8" />
          {!reduce && (
            <span className="pointer-events-none absolute -inset-2 animate-ping rounded-3xl bg-white/20" />
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-2xl font-semibold"
        >
          MedLink
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-2 text-sm text-emerald-100"
        >
          Nearest life‑saving drug, instantly.
        </motion.p>

        {!reduce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-2 text-xs text-emerald-100/90"
          >
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: '0ms' }} />
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: '120ms' }} />
            <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: '240ms' }} />
            <span className="ml-2">Loading</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
