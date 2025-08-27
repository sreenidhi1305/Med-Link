import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-700">You are not logged in.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/login" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Login</Link>
            <Link to="/register" className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Register</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-xl font-semibold text-gray-900">Your profile</h1>
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="col-span-2 font-medium text-gray-900">{user.name}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="col-span-2 font-medium text-gray-900">{user.email}</dd>
          <dt className="text-gray-500">User ID</dt>
          <dd className="col-span-2 text-gray-700">{user.id}</dd>
        </dl>
        <div className="mt-6 flex gap-3">
          <button onClick={logout} className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Logout</button>
          <Link to="/finder" className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Back to Finder</Link>
        </div>
      </div>
    </div>
  )
}
