import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

// Dispatch a CustomEvent with detail as partial filters
function emitQuickFilters(detail: any) {
  const ev = new CustomEvent('medlink:quick-filters', { detail })
  window.dispatchEvent(ev)
}

export default function QuickActionsDrawer() {
  const [open, setOpen] = useState(false)

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* FAB */}
      <button
        aria-label="Quick actions"
        onClick={() => setOpen(v => !v)}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Drawer */}
      {open && (
        <div className="absolute bottom-16 right-0 w-[min(92vw,360px)] rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="px-1 pb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Quick filters</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-emerald-600/60 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 hover:bg-emerald-100"
              onClick={() => emitQuickFilters({ openNow: true })}
            >Open now</button>
            <button
              className="rounded-full border border-blue-600/40 bg-blue-50 px-3 py-1 text-sm text-blue-800 hover:bg-blue-100"
              onClick={() => emitQuickFilters({ hours24: true })}
            >24/7</button>
            <button
              className="rounded-full border border-emerald-600/60 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 hover:bg-emerald-100"
              onClick={() => emitQuickFilters({ insurance: true })}
            >Insurance</button>
            <button
              className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              onClick={() => emitQuickFilters({ language: 'en' })}
            >English</button>
            <button
              className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              onClick={() => emitQuickFilters({ language: 'hi' })}
            >Hindi</button>
            <button
              className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-sm text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              onClick={() => emitQuickFilters({ language: 'ka' })}
            >Kannada</button>
            <button
              className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm text-gray-800 hover:bg-gray-100"
              onClick={() => emitQuickFilters({ openNow: false, hours24: false, insurance: false, language: 'any' })}
            >Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}
