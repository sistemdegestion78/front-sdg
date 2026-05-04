import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { API_URL } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { InputPassword } from './InputPassword'

export function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { guardarSesion } = useAuth()
  const [form, setForm] = useState({ password: '', confirmar: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    setEnviando(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al restablecer')
      guardarSesion(data)
      navigate('/')
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
          <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Nueva contraseña
              </label>
              <InputPassword
                id="password"
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmar" className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirmar contraseña
              </label>
              <InputPassword
                id="confirmar"
                minLength={6}
                autoComplete="new-password"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                placeholder="Repite tu contraseña"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="mt-6 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-400 disabled:opacity-50"
          >
            {enviando ? 'Guardando...' : 'Guardar contraseña'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
