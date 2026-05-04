import { useState, useEffect } from 'react'
import { apiFetch } from '../../utils/api'

export function ModalPlaca({ abierto, onContinuar, onCancelar }) {
  const [placas, setPlacas] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [nuevaPlaca, setNuevaPlaca] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!abierto) return
    setSeleccionada(null)
    setNuevaPlaca('')
    setError(null)
    fetchPlacas()
  }, [abierto])

  async function fetchPlacas() {
    try {
      const res = await apiFetch('/api/placas')
      if (!res.ok) throw new Error('Error al cargar placas')
      const data = await res.json()
      setPlacas(data)
    } catch {
      setError('No se pudieron cargar las placas. Revisá que el servidor esté activo.')
    }
  }

  async function handleAgregar() {
    const placa = nuevaPlaca.trim()
    if (!placa) return
    setAgregando(true)
    setError(null)
    try {
      const res = await apiFetch('/api/placas', {
        method: 'POST',
        body: JSON.stringify({ placa }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al agregar la placa')
        return
      }
      setNuevaPlaca('')
      await fetchPlacas()
      setSeleccionada(data.placa)
    } catch {
      setError('No se pudo agregar la placa. Revisá la conexión con el servidor.')
    } finally {
      setAgregando(false)
    }
  }

  const handleContinuar = () => {
    if (seleccionada) {
      onContinuar(seleccionada)
      setSeleccionada(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAgregar()
  }

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancelar}
        onKeyDown={(e) => e.key === 'Escape' && onCancelar()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar modal"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Cabecera */}
        <div className="border-b border-slate-100 px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <h2 className="text-lg font-bold text-slate-900">Seleccionar vehículo</h2>
          <p className="mt-0.5 text-sm text-slate-500">Elija la placa o registre una nueva.</p>
        </div>

        <div className="px-4 py-4 sm:px-6">
          {/* Lista de placas */}
          <div className="mb-4 max-h-48 space-y-1.5 overflow-y-auto pr-0.5">
            {placas.length === 0 && !error && (
              <p className="py-4 text-center text-sm text-slate-400">Cargando placas…</p>
            )}
            {placas.map((placa) => (
              <label
                key={placa}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all duration-150 ${
                  seleccionada === placa
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="placa"
                  value={placa}
                  checked={seleccionada === placa}
                  onChange={() => setSeleccionada(placa)}
                  className="sr-only"
                />
                <span className="text-sm font-bold tracking-wider text-slate-800">{placa}</span>
                {seleccionada === placa && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Nueva placa */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registrar nueva placa
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                autoComplete="off"
                value={nuevaPlaca}
                onChange={(e) => { setNuevaPlaca(e.target.value.toUpperCase()); setError(null) }}
                onKeyDown={handleKeyDown}
                maxLength={10}
                placeholder="Ej: ABC123"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold uppercase tracking-wider text-slate-800 placeholder-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={handleAgregar}
                disabled={!nuevaPlaca.trim() || agregando}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {agregando ? '…' : 'Agregar'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleContinuar}
            disabled={!seleccionada}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
