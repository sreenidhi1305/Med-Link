import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Mic, Loader2, Shield, Share2, SlidersHorizontal, X } from 'lucide-react'
// Mapbox will be initialized later when token is configured
// import mapboxgl from 'mapbox-gl'
import MapView from '../components/MapView'
import Room from '../live/Room'
import PresenceBar from '../live/PresenceBar'
import type { LngLat } from '../lib/geo'
import { haversineKm, etaMinutesFromKm } from '../lib/geo'

export default function Finder() {
  const [query, setQuery] = useState('Adrenaline Injection')
  const [listLoading, setListLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [user, setUser] = useState<LngLat | undefined>(undefined)
  type Pharmacy = { id: string; name: string; coord: LngLat; trust: number; openNow: boolean; hours24: boolean; languages: string[]; insurance: boolean; inventory: Record<string, number> }
  const [results, setResults] = useState<Pharmacy[]>([
    {
      id: '1', name: 'Lifeline Pharmacy', coord: { lng: 77.595, lat: 12.973 }, trust: 92,
      openNow: true, hours24: true, languages: ['en','hi'], insurance: true,
      inventory: { adrenaline: 24, atropine: 12, oxygen: 4, naloxone: 10 }
    },
    {
      id: '2', name: 'CarePlus Medical Store', coord: { lng: 77.602, lat: 12.969 }, trust: 88,
      openNow: true, hours24: false, languages: ['en'], insurance: false,
      inventory: { adrenaline: 6, atropine: 8, oxygen: 2 }
    },
    {
      id: '3', name: 'HealthHub Pharmacy', coord: { lng: 77.588, lat: 12.966 }, trust: 95,
      openNow: false, hours24: false, languages: ['en','ka'], insurance: true,
      inventory: { adrenaline: 0, atropine: 5, oxygen: 1, naloxone: 3 }
    },
    {
      id: '4', name: 'GreenCross Chemists', coord: { lng: 77.598, lat: 12.978 }, trust: 86,
      openNow: true, hours24: true, languages: ['en','hi','ka'], insurance: true,
      inventory: { adrenaline: 15, oxygen: 7, naloxone: 2 }
    },
    {
      id: '5', name: 'CityCare Pharmacy', coord: { lng: 77.582, lat: 12.971 }, trust: 83,
      openNow: true, hours24: false, languages: ['en'], insurance: true,
      inventory: { adrenaline: 3, atropine: 9 }
    },
    {
      id: '6', name: 'MediTrust Store', coord: { lng: 77.607, lat: 12.975 }, trust: 90,
      openNow: true, hours24: false, languages: ['en','hi'], insurance: false,
      inventory: { adrenaline: 18, oxygen: 0, naloxone: 1 }
    },
    {
      id: '7', name: 'Rapid Relief Meds', coord: { lng: 77.592, lat: 12.961 }, trust: 89,
      openNow: true, hours24: true, languages: ['en','ka'], insurance: true,
      inventory: { adrenaline: 11, atropine: 7, oxygen: 5 }
    },
    {
      id: '8', name: 'Wellness Hub', coord: { lng: 77.611, lat: 12.965 }, trust: 80,
      openNow: false, hours24: false, languages: ['en'], insurance: false,
      inventory: { adrenaline: 2, naloxone: 0 }
    },
  ])
  const [filters, setFilters] = useState({ openNow: false, hours24: false, insurance: false, language: 'any' as 'any'|'en'|'hi'|'ka', minQty: 0 })
  const [compare, setCompare] = useState<string[]>([])
  const [time, setTime] = useState(0.5) // 0..1 timeline scrubber
  const [hiContrast, setHiContrast] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)

  // get user geolocation (optional)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUser({ lng: pos.coords.longitude, lat: pos.coords.latitude })
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 8_000 }
    )
  }, [])

  // parse selection from URL (?sel=ID)
  useEffect(() => {
    const url = new URL(window.location.href)
    const sel = url.searchParams.get('sel')
    if (sel) setSelectedId(sel)
  }, [])

  // listen to global Quick Actions Drawer filter events
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<any>
      const detail = ce.detail || {}
      setFilters((prev) => ({ ...prev, ...detail }))
    }
    window.addEventListener('medlink:quick-filters', handler as EventListener)
    return () => window.removeEventListener('medlink:quick-filters', handler as EventListener)
  }, [])

  // keyboard shortcuts moved below after enriched is defined

  const drugKeyFromQuery = (q: string) => {
    const base = q.toLowerCase().trim()
    // take first word and strip non-letters to map common forms like "Adrenaline Injection"
    const first = base.split(/\s+/)[0]
    return first.replace(/[^a-z]/g, '')
  }

  // Build Google Maps directions URL
  const directionsUrl = (dest: LngLat, origin?: LngLat) => {
    const base = 'https://www.google.com/maps/dir/?api=1'
    const destParam = `&destination=${dest.lat},${dest.lng}`
    const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : ''
    const travel = '&travelmode=driving'
    return `${base}${destParam}${originParam}${travel}`
  }

  // derived with distance, eta and qty for current query
  const enriched = useMemo(() => {
    const base = results.filter((r) => {
      if (filters.openNow && !r.openNow) return false
      if (filters.hours24 && !r.hours24) return false
      if (filters.insurance && !r.insurance) return false
      if (filters.language !== 'any' && !r.languages.includes(filters.language)) return false
      return true
    })
    const key = drugKeyFromQuery(query)
    return base.map((r) => {
      const km = user ? haversineKm(user, r.coord) : undefined
      const eta = km !== undefined ? etaMinutesFromKm(km) : undefined
      const qty = r.inventory[key] ?? 0
      return { ...r, km, eta, qty }
    }).sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity))
  }, [results, user, filters, query])

  const mapPoints = useMemo(() => enriched
    .filter(r => (filters.minQty ?? 0) <= (r.qty ?? 0))
    .map((r) => ({ id: r.id, coord: r.coord, trust: r.trust, title: r.name, qty: r.qty, km: r.km, eta: r.eta })), [enriched, filters.minQty])

  // keyboard shortcuts (after enriched/mapPoints so references are valid)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault()
        const input = document.querySelector('input[placeholder="e.g. Adrenaline, Atropine, Oxygen"]') as HTMLInputElement | null
        input?.focus()
      }
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault()
        handleVoice()
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault()
        // compute current ids from results + filters
        const ids = results
          .filter((r) => {
            if (filters.openNow && !r.openNow) return false
            if (filters.hours24 && !r.hours24) return false
            if (filters.insurance && !r.insurance) return false
            if (filters.language !== 'any' && !r.languages.includes(filters.language)) return false
            return true
          })
          .map((r) => r.id)
        if (ids.length === 0) return
        const currentIndex = selectedId ? Math.max(0, ids.indexOf(selectedId)) : 0
        const next = e.key === 'ArrowRight' ? (currentIndex + 1) % ids.length : (currentIndex - 1 + ids.length) % ids.length
        setSelectedId(ids[next])
      }
      // Enter to open directions (when not typing in an input)
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'INPUT') {
        if (selectedId) {
          const sel = enriched.find(x => x.id === selectedId)
          if (sel) {
            window.open(directionsUrl(sel.coord, user), '_blank')
          }
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [results, filters, selectedId, enriched, user])

  // Voice search (Hindi/English)
  const handleVoice = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!SR) {
      alert('Voice recognition not supported in this browser')
      return
    }
    const rec = new SR()
    rec.lang = 'en-IN' // could be switched to 'hi-IN' dynamically
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setQuery(text)
    }
    rec.start()
  }

  // Map handled by MapView component

  const onSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setListLoading(true)
    // TODO: integrate backend + Liveblocks; for now simulate
    setTimeout(() => {
      setResults((prev) => prev.map((r, i) => ({ ...r, trust: Math.max(70, r.trust - (i === 0 ? 0 : 1)) })))
      setListLoading(false)
    }, 600)
  }

  return (
    <Room>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid gap-6 lg:grid-cols-5">
      {/* Left: controls and results */}
      <div className="lg:col-span-2 space-y-6">
        <motion.form
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium tracking-wide text-slate-800">Search drug</label>
            <span className="inline-flex items-center gap-2 text-xs text-slate-500"><SlidersHorizontal className="h-3.5 w-3.5" /> Filters</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                className="w-full outline-none placeholder:text-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Adrenaline, Atropine, Oxygen"
              />
            </div>
            {/* Drug picker */}
            <select
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              value={drugKeyFromQuery(query)}
              onChange={(e)=>{
                const key = e.target.value
                const label = key.charAt(0).toUpperCase() + key.slice(1)
                setQuery(label)
              }}
              title="Quick drug picker"
            >
              <option value="adrenaline">Adrenaline</option>
              <option value="atropine">Atropine</option>
              <option value="oxygen">Oxygen</option>
              <option value="naloxone">Naloxone</option>
            </select>
            <button
              type="button"
              onClick={handleVoice}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/80"
              title="Voice search"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              <MapPin className="h-4 w-4" /> Find
            </button>
          </div>
          {/* Smart filters */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.openNow} onChange={(e)=>setFilters(f=>({...f, openNow: e.target.checked}))} /> Open now</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.hours24} onChange={(e)=>setFilters(f=>({...f, hours24: e.target.checked}))} /> 24/7</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={filters.insurance} onChange={(e)=>setFilters(f=>({...f, insurance: e.target.checked}))} /> Insurance</label>
            <label className="inline-flex items-center gap-2">Language
              <select className="ml-2 rounded-md border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900/60" value={filters.language} onChange={(e)=>setFilters(f=>({...f, language: e.target.value as any}))}>
                <option value="any">Any</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ka">Kannada</option>
              </select>
            </label>
            {/* Min Qty chips */}
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Min Qty:</span>
              {[0,1,5,20].map(v => (
                <button key={v}
                  type="button"
                  onClick={()=> setFilters(f=>({...f, minQty: v}))}
                  className={`rounded-full px-2 py-1 text-[11px] border ${filters.minQty===v ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/80 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700'}`}
                >{v === 0 ? 'Any' : `${v}+`}</button>
              ))}
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-1">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/80"
                onClick={() => localStorage.setItem('medlink_filters', JSON.stringify(filters))}
              >Save preset</button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50"
                onClick={() => {
                  const s = localStorage.getItem('medlink_filters')
                  if (s) setFilters(JSON.parse(s))
                }}
              >Load preset</button>
              <button
                type="button"
                className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50"
                onClick={() => setFilters({ openNow: false, hours24: false, insurance: false, language: 'any', minQty: 0 })}
              >Reset</button>
            </div>
          </div>
        </motion.form>

        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 shadow-md dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">Nearby pharmacies</h3>
            <div className="flex items-center gap-3">
              <PresenceBar />
              {listLoading && (
              <span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating…
              </span>
              )}
              <button
                className="rounded-md border border-gray-300 bg-white/90 px-2 py-1 text-xs shadow hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                onClick={() => {
                  const url = new URL(window.location.href)
                  if (selectedId) url.searchParams.set('sel', selectedId)
                  navigator.clipboard.writeText(url.toString())
                }}
                title="Copy share link"
              >
                Copy link
              </button>
            </div>
          </div>
          <ul className="mt-3 divide-y divide-gray-100">
            {enriched.filter(r => (filters.minQty ?? 0) <= (r.qty ?? 0)).map((r, idx) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                whileHover={{ scale: 1.01 }}
                className={`py-3 flex items-center justify-between ${selectedId === r.id ? 'bg-emerald-50/60 dark:bg-emerald-500/10' : hoverId === r.id ? 'ring-2 ring-emerald-300/60 bg-emerald-50/40 dark:bg-emerald-500/5' : ''}`}
                onClick={() => setSelectedId(r.id)}
              >
                <div className="min-w-0">
                  <p className="font-medium tracking-wide text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                    {r.name}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs
                      ${r.trust >= 92 ? 'bg-emerald-100 text-emerald-800' : r.trust >= 85 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}
                    >
                      <Shield className="h-3 w-3" /> {r.trust}%
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs
                      ${r.qty > 20 ? 'bg-emerald-100 text-emerald-800' : r.qty > 5 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}
                    >
                      Qty: {r.qty}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {r.km !== undefined ? `${r.km.toFixed(1)} km` : '—'}
                    {r.eta !== undefined ? ` • ETA ${r.eta} min` : ''}
                  </p>
                  <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700/60">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, r.trust))}%`, background: r.trust >= 92 ? '#10b981' : r.trust >= 85 ? '#f59e0b' : '#ef4444' }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                    {r.openNow && <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">Open</span>}
                    {r.hours24 && <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700">24/7</span>}
                    {r.insurance && <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">Insurance</span>}
                    {r.languages.map(l => <span key={l} className="rounded bg-gray-100 px-2 py-0.5">{l.toUpperCase()}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white/90 px-2 py-1 text-xs shadow hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
                    onClick={(e)=>{ e.stopPropagation(); window.open(directionsUrl(r.coord, user), '_blank') }}
                    aria-label={`Get directions to ${r.name}`}
                    title="Directions"
                  >
                    Directions
                  </button>
                  <label className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={compare.includes(r.id)}
                      onChange={(e)=> setCompare(prev => {
                        const next = e.target.checked ? [...prev, r.id] : prev.filter(x=>x!==r.id)
                        return next.slice(-2) // keep last two
                      })}
                      onClick={(e)=> e.stopPropagation()}
                    /> Compare
                  </label>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Map */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-md overflow-hidden"
      >
        {/* Map header controls: time scrubber + share */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <span className="font-medium">Timeline</span>
            <input type="range" min={0} max={100} value={Math.round(time*100)} onChange={(e)=>setTime(Number(e.target.value)/100)} />
          </div>
          <button
            onClick={async () => {
              const el = document.getElementById('map-root')
              if (!el) return
              const { toPng } = await import('html-to-image')
              const dataUrl = await toPng(el)
              const a = document.createElement('a')
              a.href = dataUrl
              a.download = 'medlink-share.png'
              a.click()
            }}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50"
            title="Share current view"
          >
            <Share2 className="h-3.5 w-3.5" /> Share view
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-700 dark:text-slate-300">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={hiContrast} onChange={(e)=> setHiContrast(e.target.checked)} /> High contrast
          </label>
        </div>
        <div id="map-root">
          <MapView user={user} points={mapPoints} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} time={time} highContrast={hiContrast} onHover={(id)=> setHoverId(id)} />
        </div>
      </motion.div>
      {/* Compare Drawer */}
      {compare.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-30 w-[min(720px,96vw)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Compare</span>
            <button className="rounded-md p-1 hover:bg-gray-100" onClick={()=>setCompare([])} aria-label="Close compare"><X className="h-4 w-4"/></button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-700">
            {compare.map((id)=> enriched.find(x=>x.id===id)).filter(Boolean).map((r:any) => (
              <div key={r.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 truncate">{r.name}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]
                    ${r.trust >= 92 ? 'bg-indigo-100 text-indigo-800' : r.trust >= 85 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}
                  >
                    <Shield className="h-3 w-3" /> {r.trust}%
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div>Distance: <strong>{r.km !== undefined ? `${r.km.toFixed(1)} km` : '—'}</strong></div>
                  <div>ETA: <strong>{r.eta !== undefined ? `${r.eta} min` : '—'}</strong></div>
                  <div>Open now: <strong>{r.openNow ? 'Yes' : 'No'}</strong></div>
                  <div>24/7: <strong>{r.hours24 ? 'Yes' : 'No'}</strong></div>
                  <div>Insurance: <strong>{r.insurance ? 'Yes' : 'No'}</strong></div>
                  <div>Languages: <strong>{r.languages.map((l:string)=>l.toUpperCase()).join(', ')}</strong></div>
                  <div>Quantity: <strong>{r.qty}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </Room>
  )
}
