import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sdg-token'))
  const [cargando, setCargando] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('sdg-token')
  }, [])

  const guardarSesion = useCallback((data) => {
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('sdg-token', data.token)
  }, [])

  useEffect(() => {
    if (!token) {
      setCargando(false)
      return
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setCargando(false))
  }, [token, logout])

  const fetchAuth = useCallback(
    (url, options = {}) =>
      fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  )

  return (
    <AuthContext.Provider value={{ user, token, cargando, guardarSesion, logout, fetchAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
