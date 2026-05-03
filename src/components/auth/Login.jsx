import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { InputPassword } from './InputPassword'

export function Login() {
  const { guardarSesion } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
      guardarSesion(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-16 items-center justify-center rounded-xl bg-emerald-500 shadow-lg">
            <span className="text-sm font-black tracking-tight text-white">SDG</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <InputPassword
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Tu contraseña"
              />
            </div>
          </div>

          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
              Olvidé mi contraseña
            </Link>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-400 disabled:opacity-50"
          >
            {enviando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
