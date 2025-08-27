import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AuthUser = { id: string; name: string; email: string }

type AuthContextType = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('medlink_user')
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch {}
    }
  }, [])

  const login = async (email: string, _password: string) => {
    // Mock: accept any email/password; in real app, call backend
    const existing = localStorage.getItem('medlink_user')
    if (existing) {
      setUser(JSON.parse(existing))
      return
    }
    const mock: AuthUser = { id: crypto.randomUUID(), name: email.split('@')[0], email }
    localStorage.setItem('medlink_user', JSON.stringify(mock))
    setUser(mock)
  }

  const register = async (name: string, email: string, _password: string) => {
    const mock: AuthUser = { id: crypto.randomUUID(), name, email }
    localStorage.setItem('medlink_user', JSON.stringify(mock))
    setUser(mock)
  }

  const logout = () => {
    localStorage.removeItem('medlink_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
