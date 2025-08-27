import { useMemo } from 'react'
import type { LngLat } from '../lib/geo'

export type MapPoint = {
  id: string
  coord: LngLat
  trust: number
  title?: string
  qty?: number
  km?: number
  eta?: number
}

type Props = {
  user?: LngLat
  points?: MapPoint[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  time?: number // 0..1 timeline scrubber to modulate visuals
  highContrast?: boolean
  onHover?: (id: string | null) => void
}

export default function MapView({ user, points = [], selectedId, onSelect, time = 0.5, highContrast = false, onHover }: Props) {
  // Equirectangular projection helpers (for static image)
  const project = (lng: number, lat: number) => {
    const x = (lng + 180) / 360 // 0..1
    const y = (90 - lat) / 180  // 0..1
    return { x, y }
  }

  const items = useMemo(() => {
    return points.map((p) => ({
      id: p.id,
      trust: p.trust,
      title: p.title || '',
      qty: p.qty ?? undefined,
      km: p.km,
      eta: p.eta,
      pos: project(p.coord.lng, p.coord.lat),
    }))
  }, [points])

  // Group nearby items into clusters to reduce congestion
  const clusters = useMemo(() => {
    const thresh = 0.03 // ~3% of width/height in normalized equirectangular space
    const remaining = new Set(items.map((_, i) => i))
    const groups: { id: string; pos: { x: number; y: number }; members: typeof items }[] = []
    while (remaining.size) {
      const i = remaining.values().next().value as number
      remaining.delete(i)
      const seed = items[i]
      const members = [seed]
      for (const j of Array.from(remaining)) {
        const b = items[j]
        if (Math.abs(seed.pos.x - b.pos.x) < thresh && Math.abs(seed.pos.y - b.pos.y) < thresh) {
          members.push(b)
          remaining.delete(j)
        }
      }
      const cx = members.reduce((acc, m) => acc + m.pos.x, 0) / members.length
      const cy = members.reduce((acc, m) => acc + m.pos.y, 0) / members.length
      groups.push({ id: `cluster-${seed.id}`, pos: { x: cx, y: cy }, members })
    }
    return groups
  }, [items])

  const userPos = user ? project(user.lng, user.lat) : undefined
  const selectedItem = useMemo(() => items.find((x) => x.id === selectedId), [items, selectedId])

  return (
    <div className="group relative h-[560px] w-full overflow-hidden" role="region" aria-label="Availability map showing pharmacies on a world view">
      {/* Background 3D-like Earth image (equirectangular) */}
      <div
        className="absolute inset-0 earth-pan"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: highContrast ? 'saturate(1.25) contrast(1.25) brightness(1.05)' : 'saturate(1.05) contrast(1.05)',
        }}
        aria-hidden
      />

      {/* Soft vignette for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.25)_100%)]" />

      {/* Global pulse overlay (breathing with timeline) */}
      <div
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{
          opacity: 0.05 + time * 0.1,
          background:
            'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 35%, rgba(0,0,0,0) 70%)',
          mixBlendMode: 'screen',
        }}
        aria-hidden
      />

      {/* Density heatmap (translucent radial blobs) */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply">
        {items.map((it) => {
          const left = `${Math.max(0, Math.min(1, it.pos.x)) * 100}%`
          const top = `${Math.max(0, Math.min(1, it.pos.y)) * 100}%`
          const col = it.trust >= 92 ? 'rgba(16,185,129,0.18)' : it.trust >= 85 ? 'rgba(245,158,11,0.18)' : 'rgba(244,63,94,0.18)'
          const size = 120 + Math.round(time * 100)
          return (
            <div
              key={`heat-${it.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left, top, width: size, height: size, borderRadius: '9999px',
                background: `radial-gradient(circle at center, ${col} 0%, rgba(0,0,0,0) 70%)` }}
            />
          )
        })}
      </div>

      {/* Availability markers (clustered) */}
      <div className="absolute inset-0">
        {clusters.map((cl) => {
          const left = `${Math.max(0, Math.min(1, cl.pos.x)) * 100}%`
          const top = `${Math.max(0, Math.min(1, cl.pos.y)) * 100}%`
          if (cl.members.length === 1) {
            const it = cl.members[0]
            const color = it.trust >= 92 ? 'bg-emerald-500' : it.trust >= 85 ? 'bg-amber-500' : 'bg-rose-500'
            const ring = highContrast
              ? 'ring-white'
              : it.trust >= 92
              ? 'ring-emerald-200'
              : it.trust >= 85
              ? 'ring-amber-200'
              : 'ring-rose-200'
            const isSelected = selectedId === it.id
            return (
              <button
                key={it.id}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left, top }}
                onClick={() => onSelect && onSelect(it.id)}
                title={it.title}
                aria-label={`${it.title || 'Pharmacy'} with trust ${it.trust}%${typeof it.qty === 'number' ? ` and quantity ${it.qty}` : ''}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect && onSelect(it.id)
                  }
                }}
                onMouseEnter={() => onHover && onHover(it.id)}
                onMouseLeave={() => onHover && onHover(null)}
              >
                <span
                  className={`absolute rounded-full ${color}/30 ${isSelected ? 'animate-ping' : 'animate-pulse'} ${highContrast ? 'ring-2 ring-white/70' : ''}`}
                  style={{ left: -12, top: -12, height: 24 + time * 6 + (it.qty ? Math.min(18, it.qty) : 0), width: 24 + time * 6 + (it.qty ? Math.min(18, it.qty) : 0) }}
                />
                {isSelected && (
                  <span className={`absolute rounded-full ${color}/25 animate-ping`} style={{ left: -24, top: -24, height: 48 + time * 10, width: 48 + time * 10 }} aria-hidden />
                )}
                <span className={`relative inline-flex rounded-full ${color} ring-2 ${ring} shadow transition-transform duration-200 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
                  style={{ height: 14 + (it.qty ? Math.min(10, it.qty) : 0) / 2, width: 14 + (it.qty ? Math.min(10, it.qty) : 0) / 2 }}
                />
                <span className="tooltip-fade absolute left-1/2 top-[-28px] -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-white shadow">
                  {it.title || 'Pharmacy'} • Trust {it.trust}%{typeof it.qty === 'number' ? ` • Qty ${it.qty}` : ''}
                </span>
              </button>
            )
          }

          // For clusters with multiple members, render a compact count marker
          const size = 22 + Math.min(10, cl.members.length) // slightly grow with count
          const best = cl.members.reduce((a, b) => (a.trust >= b.trust ? a : b))
          const color = best.trust >= 92 ? 'bg-emerald-600' : best.trust >= 85 ? 'bg-amber-600' : 'bg-rose-600'
          const ring = highContrast
            ? 'ring-white'
            : best.trust >= 92
            ? 'ring-emerald-200'
            : best.trust >= 85
            ? 'ring-amber-200'
            : 'ring-rose-200'
          const tooltip = cl.members.slice(0, 3).map(m => m.title || 'Pharmacy').join(', ') + (cl.members.length > 3 ? ` +${cl.members.length - 3} more` : '')
          return (
            <button
              key={cl.id}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left, top }}
              onClick={() => onSelect && onSelect(best.id)}
              title={tooltip}
              aria-label={`${cl.members.length} pharmacies clustered here. Selecting top option: ${best.title || 'Pharmacy'}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect && onSelect(best.id)
                }
              }}
              onMouseEnter={() => onHover && onHover(best.id)}
              onMouseLeave={() => onHover && onHover(null)}
            >
              <span
                className={`absolute rounded-full ${color}/25 ${highContrast ? 'ring-2 ring-white/70' : ''}`}
                style={{ left: -size/2, top: -size/2, height: size + time * 6, width: size + time * 6 }}
              />
              <span className={`relative inline-flex items-center justify-center rounded-full ${color} ring-2 ${ring} text-[11px] font-semibold text-white shadow transition-transform duration-200 group-hover:scale-105`}
                style={{ height: size, width: size }}
              >
                {cl.members.length}
              </span>
              <span className="tooltip-fade absolute left-1/2 top-[-30px] -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-white shadow">
                {tooltip}
              </span>
            </button>
          )
        })}
        {/* Dotted path from user to selected */}
        {userPos && selectedItem && (
          <>
            <svg className="pointer-events-none absolute inset-0" aria-hidden>
              <line
                x1={`${userPos.x * 100}%`} y1={`${userPos.y * 100}%`}
                x2={`${selectedItem.pos.x * 100}%`} y2={`${selectedItem.pos.y * 100}%`}
                stroke="rgba(59,130,246,0.9)" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            {typeof selectedItem.eta === 'number' && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow"
                style={{ left: `${(userPos.x + selectedItem.pos.x) * 50}%`, top: `${(userPos.y + selectedItem.pos.y) * 50}%` }}
                aria-label={`Estimated time ${selectedItem.eta} minutes`}
              >
                ETA {selectedItem.eta}m
              </div>
            )}
          </>
        )}
        {userPos && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${userPos.x * 100}%`, top: `${userPos.y * 100}%` }}
          >
            <span className="absolute -left-4 -top-4 h-8 w-8 animate-ping rounded-full bg-cyan-400/30" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-600 ring-2 ring-white shadow" aria-label="Your location" />
          </div>
        )}
      </div>

      {/* Legends */}
      <div className="absolute right-3 top-3 space-y-2 text-xs">
        <div className="rounded-xl bg-white/85 px-3 py-2 backdrop-blur shadow">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> High trust</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Low</span>
          </div>
        </div>
        <div className="rounded-xl bg-white/85 px-3 py-2 backdrop-blur shadow">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><span className="inline-block rounded-full bg-slate-500" style={{width:8,height:8}} /> Qty low</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block rounded-full bg-slate-500" style={{width:11,height:11}} /> Qty med</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block rounded-full bg-slate-500" style={{width:14,height:14}} /> Qty high</span>
          </div>
        </div>
      </div>

      {/* Accessibility live region for selection announcements */}
      <span className="sr-only" aria-live="polite">
        {selectedItem ? `${selectedItem.title || 'Pharmacy'} selected, trust ${selectedItem.trust} percent` : ''}
      </span>
    </div>
  )
}
