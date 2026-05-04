import { useState, useEffect } from 'react'
import { apiFetch } from '../../utils/api'

export function ModalEmpresa({ abierto, onContinuar, onCancelar }) {
  const [empresas, setEmpresas] = useState([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [nuevaEmpresa, setNuevaEmpresa] = useState('')
  const [rteFuente, setRteFuente] = useState('')
  const [rteIca, setRteIca] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!abierto) return
    setSeleccionada(null)
    setNuevaEmpresa('')
    setRteFuente('')
    setRteIca('')
    setError(null)
    fetchEmpresas()
  }, [abierto])

  async function fetchEmpresas() {
    try {
      const res = await apiFetch('/api/empresas')
      if (!res.ok) throw new Error('Error al cargar empresas')
      const data = await res.json()
      setEmpresas(data)
    } catch {
      setError('No se pudieron cargar las empresas. Revisá que el servidor esté activo.')
    }
  }

  async function handleAgregar() {
    const nombre = nuevaEmpresa.trim()
    if (!nombre) return
    if (!rteFuente || !rteIca) {
      setError('Ingresá el porcentaje de RTE Fuente y RTE ICA')
      return
    }
    setAgregando(true)
    setError(null)
    try {
      const res = await apiFetch('/api/empresas', {
        method: 'POST',
        body: JSON.stringify({
          nombre,
          rteFuente: Number(rteFuente),
          rteIca: Number(rteIca),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al agregar la empresa')
        return
      }
      setNuevaEmpresa('')
      setRteFuente('')
      setRteIca('')
      await fetchEmpresas()
      setSeleccionada(data.empresa.nombre)
    } catch {
      setError('No se pudo agregar la empresa. Revisá la conexión con el servidor.')
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

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
      <div className="relative w-full max-w-lg my-8 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Cabecera */}
        <div className="border-b border-slate-100 px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
          <h2 className="text-lg font-bold text-slate-900">Empresa transportadora</h2>
          <p className="mt-0.5 text-sm text-slate-500">Seleccione la empresa o registre una nueva.</p>
        </div>

        <div className="px-4 py-4 sm:px-6">
          {/* Lista de empresas */}
          <div className="mb-4 max-h-48 space-y-1.5 overflow-y-auto pr-0.5">
            {empresas.length === 0 && !error && (
              <p className="py-4 text-center text-sm text-slate-400">Cargando empresas...</p>
            )}
            {empresas.map((emp) => (
              <label
                key={emp.nombre}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all duration-150 ${
                  seleccionada === emp.nombre
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="empresa"
                  value={emp.nombre}
                  checked={seleccionada === emp.nombre}
                  onChange={() => setSeleccionada(emp.nombre)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{emp.nombre}</div>
                  <div className="mt-0.5 flex gap-3 text-xs text-slate-500">
                    <span>RTE F: <strong className="text-slate-700">{emp.rteFuente}%</strong></span>
                    <span>|</span>
                    <span>ICA: <strong className="text-slate-700">{emp.rteIca}%</strong></span>
                  </div>
                </div>
                {seleccionada === emp.nombre && (
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </label>
            ))}
          </div>

          {/* Nueva empresa */}
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Registrar nueva empresa
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Nombre de la empresa</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={nuevaEmpresa}
                  onChange={(e) => { setNuevaEmpresa(e.target.value); setError(null) }}
                  placeholder="Ej: Transportes ABC"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">RTE Fuente (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    autoComplete="off"
                    value={rteFuente}
                    onChange={(e) => { setRteFuente(e.target.value); setError(null) }}
                    placeholder="Ej: 1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">RTE ICA (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    autoComplete="off"
                    value={rteIca}
                    onChange={(e) => { setRteIca(e.target.value); setError(null) }}
                    placeholder="Ej: 0.6"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAgregar}
                disabled={!nuevaEmpresa.trim() || !rteFuente || !rteIca || agregando}
                className="w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {agregando ? 'Agregando...' : 'Agregar empresa'}
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
