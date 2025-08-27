import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { MapPin, Mic, ShieldCheck } from 'lucide-react'
import './index.css'
import Home from './pages/Home'
import Finder from './pages/Finder'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Medications from './pages/Medications'
import PharmacyFinder from './pages/PharmacyFinder'
import HealthDashboard from './pages/HealthDashboard'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import LiveProvider from './live/LiveProvider'
import Splash from './components/Splash'
import Announcements from './components/Announcements'
import QuickActionsDrawer from './components/QuickActionsDrawer.tsx'
import SOSButton from './components/SOSButton'

function Header() {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-200 dark:bg-slate-900/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-wide text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <MapPin className="h-5 w-5" />
          </span>
          <span>MedLink</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          <NavLink to="/" className={({isActive}) => `hover:text-emerald-700 ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>Home</NavLink>
          <NavLink to="/pharmacy" className={({isActive}) => `hover:text-emerald-700 ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>Pharmacies</NavLink>
          <NavLink to="/medications" className={({isActive}) => `hover:text-emerald-700 ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>My Meds</NavLink>
          <NavLink to="/health" className={({isActive}) => `hover:text-emerald-700 ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>Health</NavLink>
          <a href="#" className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700 transition-colors">
            <Mic className="h-4 w-4" /> Voice
          </a>
          <span className="h-6 w-px bg-gray-200 hidden sm:inline-block" />
          {!user ? (
            <div className="flex items-center gap-3">
              <NavLink to="/login" className={({isActive}) => `${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'} hover:text-emerald-700`}>Login</NavLink>
              <NavLink to="/register" className={({isActive}) => `inline-flex items-center rounded-full border border-emerald-600 px-3 py-1 ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800/80'}`}>Register</NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/profile" className={({isActive}) => `${isActive ? 'text-emerald-700 font-medium' : 'text-slate-700 dark:text-slate-300'} hover:text-emerald-700`}>{user.name}</NavLink>
              <button onClick={logout} className="text-slate-700 hover:text-rose-600 dark:text-slate-300">Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  // Auto dark mode based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.classList.toggle('dark', prefersDark.matches)
    }
    apply()
    prefersDark.addEventListener('change', apply)
    return () => prefersDark.removeEventListener('change', apply)
  }, [])
  return (
    <BrowserRouter>
      <AuthProvider>
        <LiveProvider>
        <div className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          {showSplash && <Splash onDone={() => setShowSplash(false)} />}
          <Header />
          <Announcements />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/finder" element={<Finder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/pharmacy" element={<PharmacyFinder />} />
              <Route path="/health" element={<HealthDashboard />} />
              <Route path="/pharmacy/:id" element={<PharmacyFinder />} />
            </Routes>
          </main>
          <footer className="border-t border-gray-200 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Saving lives with trusted, real-time availability.
            </div>
          </footer>
          <QuickActionsDrawer />
          <SOSButton />
        </div>
        </LiveProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
