import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, MapPin, PhoneCall, Share2, Volume2, X, Settings, Users } from 'lucide-react'
import { RoomProvider, useBroadcastEvent, useEventListener } from '@liveblocks/react'

const SETTINGS_KEY = 'medlink_sos_settings_v1'
const QUEUE_KEY = 'medlink_sos_queue_v1'

type Contact = { name: string; phone: string }
type SettingsState = { contacts: Contact[]; template: string; autoSend: boolean }

export default function SOSButton() {
  const [open, setOpen] = useState(false)
  const [loc, setLoc] = useState<{lat:number,lng:number}|null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const [sirenOn, setSirenOn] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<SettingsState>({ contacts: [], template: 'EMERGENCY: Need immediate help.', autoSend: false })
  const [countdown, setCountdown] = useState<number | null>(null)
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null)
  const [receivedPing, setReceivedPing] = useState(false)

  useEffect(() => {
    // load settings
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) setSettings(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (!open) return
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 8_000 }
    )
  }, [open])

  // Siren using WebAudio API (simple two-tone)
  useEffect(() => {
    if (!sirenOn) {
      audioCtxRef.current?.close().catch(()=>{})
      audioCtxRef.current = null
      return
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = ctx
    let stopped = false

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.value = 0.03 // not too loud by default

    let high = true
    const setFreq = (f:number) => { osc.frequency.setTargetAtTime(f, ctx.currentTime, 0.01) }
    const tick = () => {
      if (stopped) return
      setFreq(high ? 880 : 560)
      high = !high
      setTimeout(tick, 500)
    }
    osc.start()
    tick()

    return () => {
      stopped = true
      try { osc.stop() } catch {}
      try { ctx.close() } catch {}
      audioCtxRef.current = null
    }
  }, [sirenOn])

  // Flash overlay toggle
  useEffect(() => {
    const el = document.getElementById('sos-flash-overlay')
    if (!el) return
    el.style.display = flashOn ? 'block' : 'none'
  }, [flashOn])

  // Wake Lock while SOS modal open or siren/strobe active
  useEffect(() => {
    const active = open || sirenOn || flashOn
    if (!('wakeLock' in navigator) || !(navigator as any).wakeLock?.request) return
    let released = false
    async function acquire() {
      try {
        if (active && !wakeLockSentinel) {
          const sentinel = await (navigator as any).wakeLock.request('screen')
          setWakeLockSentinel(sentinel)
          const onRelease = () => setWakeLockSentinel(null)
          sentinel.addEventListener('release', onRelease, { once: true })
        }
      } catch {}
    }
    acquire()
    const onVis = () => { if (document.visibilityState === 'visible') acquire() }
    document.addEventListener('visibilitychange', onVis)
    return () => { document.removeEventListener('visibilitychange', onVis); if (!released && wakeLockSentinel) { try { wakeLockSentinel.release() } catch {} } }
  }, [open, sirenOn, flashOn])

  const mapsUrl = useMemo(() => {
    if (!loc) return ''
    return `https://maps.google.com/?q=${loc.lat},${loc.lng}`
  }, [loc])

  const messageText = useMemo(() => {
    const base = settings.template || 'EMERGENCY: Need immediate help.'
    return loc ? `${base} My location: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} ${mapsUrl}` : base
  }, [loc, mapsUrl])

  const enqueueIfOffline = async (payload: string) => {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
      q.push({ at: Date.now(), payload })
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
    } catch {}
  }

  const handleShareNow = async () => {
    const data = { title: 'SOS - MedLink', text: messageText, url: mapsUrl || undefined }
    if ((navigator as any).share) {
      try { await (navigator as any).share(data) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${messageText}${mapsUrl ? `\n${mapsUrl}` : ''}`)
        alert('SOS message copied to clipboard')
      } catch {
        alert('Copy failed. You can manually share the message.')
      }
    }
  }

  const handleShare = async () => {
    if (!navigator.onLine) {
      await enqueueIfOffline(`${messageText}${mapsUrl ? `\n${mapsUrl}` : ''}`)
      try { await navigator.clipboard.writeText(`${messageText}${mapsUrl ? `\n${mapsUrl}` : ''}`) } catch {}
      alert('Offline: copied message to clipboard and queued to share later.')
      return
    }
    if (settings.autoSend) {
      setCountdown(5)
    } else {
      handleShareNow()
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      setCountdown(null)
      handleShareNow()
      return
    }
    const t = setTimeout(() => setCountdown((c) => (c! - 1)), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Save settings
  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setShowSettings(false)
  }

  // Liveblocks SOS broadcast
  function SOSLiveUI() {
    const broadcast = useBroadcastEvent()
    useEventListener(({ event }) => {
      if (event && (event as any).type === 'sos') {
        setReceivedPing(true)
        setTimeout(() => setReceivedPing(false), 8000)
      }
    })
    return (
      <button
        onClick={() => broadcast({ type: 'sos', at: Date.now() })}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/80 px-3 py-2 hover:bg-white dark:bg-slate-900/60"
      >
        <Users className="h-4 w-4" /> Broadcast to collaborators
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {/* Flash overlay */}
      <div id="sos-flash-overlay" className="pointer-events-none fixed inset-0 z-[60] hidden" aria-hidden>
        <div className="absolute inset-0 animate-sos-flash bg-rose-600/40 mix-blend-multiply" />
      </div>

      {/* SOS FAB */}
      <button
        aria-label="Emergency SOS"
        onClick={() => setOpen(true)}
        className={`relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-xl hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-300`}
        title="Emergency SOS"
      >
        <AlertTriangle className="h-6 w-6" />
        {receivedPing && <span className="absolute -top-1 -right-1 inline-flex h-3.5 w-3.5 animate-ping items-center justify-center rounded-full bg-rose-300" />}
      </button>

      {/* Modal */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:w-[520px] rounded-t-2xl sm:rounded-2xl border border-rose-200/60 bg-white/80 p-4 shadow-2xl backdrop-blur dark:border-rose-900/40 dark:bg-slate-900/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="text-sm font-semibold">Emergency SOS</h2>
              </div>
              <button aria-label="Close" className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-sm text-slate-800 dark:text-slate-200">
              {/* Settings toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={settings.autoSend} onChange={(e)=>setSettings(s=>({...s, autoSend: e.target.checked}))}/> Auto-send after 5s</label>
                  {countdown !== null && <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700">Sending in {countdown}s… <button className="underline" onClick={()=>setCountdown(null)}>Cancel</button></span>}
                </div>
                <button className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" onClick={()=>setShowSettings(v=>!v)}>
                  <Settings className="h-3.5 w-3.5"/> Settings
                </button>
              </div>

              {showSettings && (
                <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="text-xs font-semibold mb-2">Emergency contacts</div>
                  <div className="space-y-2">
                    {(settings.contacts || []).slice(0,3).map((c, idx)=> (
                      <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <input value={c.name} onChange={(e)=>{
                          setSettings(s=>{ const next={...s}; next.contacts=[...next.contacts]; next.contacts[idx]={...next.contacts[idx], name:e.target.value}; return next })
                        }} placeholder="Name" className="rounded-md border px-2 py-1 text-xs bg-white/80 dark:bg-slate-900/60"/>
                        <input value={c.phone} onChange={(e)=>{
                          setSettings(s=>{ const next={...s}; next.contacts=[...next.contacts]; next.contacts[idx]={...next.contacts[idx], phone:e.target.value}; return next })
                        }} placeholder="Phone" className="rounded-md border px-2 py-1 text-xs bg-white/80 dark:bg-slate-900/60"/>
                        <button className="rounded-md border px-2 py-1 text-xs" onClick={()=> setSettings(s=>{ const next={...s}; next.contacts = s.contacts.filter((_,i)=>i!==idx); return next })}>Remove</button>
                      </div>
                    ))}
                    {settings.contacts.length < 3 && (
                      <button className="rounded-md border px-2 py-1 text-xs" onClick={()=> setSettings(s=> ({...s, contacts:[...s.contacts, { name:'', phone:'' }] }))}>Add contact</button>
                    )}
                  </div>
                  <div className="mt-3 text-xs font-semibold">SMS template</div>
                  <textarea value={settings.template} onChange={(e)=> setSettings(s=> ({...s, template:e.target.value}))} rows={3} className="mt-1 w-full rounded-md border px-2 py-1 text-xs bg-white/80 dark:bg-slate-900/60"/>
                  <div className="mt-2 flex justify-end gap-2">
                    <button className="rounded-md px-2 py-1 text-xs" onClick={()=> setShowSettings(false)}>Close</button>
                    <button className="rounded-md border px-2 py-1 text-xs" onClick={saveSettings}>Save</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a href="tel:112" className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-white hover:bg-rose-700" aria-label="Call 112 emergency">
                  <PhoneCall className="h-4 w-4" /> Call 112
                </a>
                <a href={`sms:?&body=${encodeURIComponent(messageText)}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/80 px-3 py-2 hover:bg-white dark:bg-slate-900/60" aria-label="Compose SOS message">
                  SOS SMS
                </a>
                <button onClick={handleShare} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/80 px-3 py-2 hover:bg-white dark:bg-slate-900/60">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <a
                  href={mapsUrl || '#'}
                  onClick={(e)=>{ if(!mapsUrl) e.preventDefault() }}
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white/80 px-3 py-2 hover:bg-white dark:bg-slate-900/60"
                >
                  <MapPin className="h-4 w-4" /> {loc ? 'Open map' : 'Get location'}
                </a>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSirenOn(v=>!v)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 ${sirenOn ? 'bg-rose-600 text-white' : 'border border-rose-300 bg-white/80 hover:bg-white dark:bg-slate-900/60'}`}
                  aria-pressed={sirenOn}
                >
                  <Volume2 className="h-4 w-4" /> {sirenOn ? 'Stop siren' : 'Play siren'}
                </button>
                <button
                  onClick={() => setFlashOn(v=>!v)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 ${flashOn ? 'bg-rose-600 text-white' : 'border border-rose-300 bg-white/80 hover:bg-white dark:bg-slate-900/60'}`}
                  aria-pressed={flashOn}
                >
                  Screen strobe
                </button>
              </div>

              {/* Liveblocks broadcast UI inside RoomProvider if available */}
              <div className="mt-2">
                {Boolean(import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY) ? (
                  <RoomProvider id="medlink-sos">
                    <SOSLiveUI />
                  </RoomProvider>
                ) : null}
              </div>

              {loc && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 select-all">Location: {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</p>
              )}
              {!loc && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Location access helps responders find you faster.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
