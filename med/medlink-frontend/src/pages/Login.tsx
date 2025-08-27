import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      nav('/profile')
    } catch (e: any) {
      setError(e?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-xl font-semibold text-gray-900">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <label className="block text-sm">
          <span className="text-gray-700">Email</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="text-gray-700">Password</span>
          <input className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </label>
        <button disabled={loading} className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-xs text-gray-600">No account? <Link to="/register" className="text-emerald-700 hover:underline">Register</Link></p>
      </form>
    </div>
  )
}
