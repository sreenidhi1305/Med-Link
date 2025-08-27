import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

export default function Announcements() {
  const storageKey = 'medlink_banner_dismissed_v1'
  const [dismissed, setDismissed] = useState<boolean>(true)

  useEffect(() => {
    const v = localStorage.getItem(storageKey)
    setDismissed(v === '1')
  }, [])

  if (dismissed) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mt-3 rounded-2xl border border-emerald-200/60 bg-white/70 backdrop-blur px-4 py-3 shadow-md dark:border-emerald-800/40 dark:bg-slate-900/60">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 text-sm text-slate-700 dark:text-slate-200">
            <p className="font-semibold">Citywide alert</p>
            <p className="mt-0.5">High demand for Adrenaline in central districts. Availability fluctuates. Check nearby alternatives or expand radius.</p>
          </div>
          <button
            aria-label="Dismiss announcement"
            className="rounded-md p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => {
              localStorage.setItem(storageKey, '1')
              setDismissed(true)
            }}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
