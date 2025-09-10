import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type AuthUser = {
  id: string
  email: string
  token: string
  name?: string
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: Record<string, unknown>) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'nutrio_auth_user'
const API_BASE_URL = 'http://localhost:4000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const saved = JSON.parse(raw) as Partial<AuthUser>
      if (saved && saved.email && saved.token && saved.id) return saved as AuthUser
      return null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      try {
        const next = e.newValue ? (JSON.parse(e.newValue) as Partial<AuthUser>) : null
        if (next && next.email && next.token && next.id) setUser(next as AuthUser)
        else setUser(null)
      } catch {
        setUser(null)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Email and password required')
    const res = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      let message = 'Login failed'
      try {
        const data = (await res.json()) as any
        message = data?.error || message
      } catch {}
      throw new Error(message)
    }
    const data = (await res.json()) as any
    const token = String(data?.token || '')
    const id = String(data?.user_id || '')
    if (!token || !id) throw new Error('Invalid server response')

    let name: string | undefined
    try {
      const profRes = await fetch(`${API_BASE_URL}/api/users/${id}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (profRes.ok) {
        const prof = (await profRes.json()) as any
        name = prof?.user_profile_data?.profile?.name || undefined
      }
    } catch {}

    const nextUser: AuthUser = { id, email, token, name }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const register = async (payload: Record<string, unknown>) => {
    const email = String(payload.email || '')
    const password = String(payload.password || '')
    if (!email || !password) throw new Error('Email and password required')

    const res = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let message = 'Registration failed'
      try {
        const data = (await res.json()) as any
        message = data?.error || message
      } catch {}
      throw new Error(message)
    }
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


