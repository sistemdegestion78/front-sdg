import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MESES } from '../../constants'
import { apiFetch } from '../../utils/api'

function AccesoRapido({ navigate }) {
  const [placas, setPlacas] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [placa, setPlaca] = useState('')
  const [empresa, setEmpresa] = useState('')

  useEffect(() => {
    apiFetch('/api/placas').then(r => r.json()).then(setPlacas).catch(() => {})
    apiFetch('/api/empresas').then(r => r.json()).then(data => setEmpresas(data.map(e => e.nombre))).catch(() => {})
  }, [])

  const irAViajes = () => {
    if (!placa || !empresa) return
    navigate(`/viajes/${encodeURIComponent(placa)}/${encodeURIComponent(empresa)}`)
  }

  return (
    <div className="mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-4 py-4 sm:px-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Acceso rápido</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-slate-600">Placa</label>
          <select
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Seleccionar placa</option>
            {placas.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-slate-600">Empresa</label>
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Seleccionar empresa</option>
            {empresas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={irAViajes}
          disabled={!placa || !empresa}
          className="shrink-0 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ir a viajes
        </button>
      </div>
    </div>
  )
}

function formatMoney(n) {
  return n.toLocaleString('es-CO')
}

const ANIO_FIJO = 2026

function PlacaSection({ item, mes, onVerGanancias }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Header de placa */}
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-black tracking-widest text-white shadow-sm">
            {item.placa}
          </span>
          <span className="text-sm text-slate-500">
            {item.totalViajes} viaje{item.totalViajes !== 1 ? 's' : ''}
            {mes ? ` en ${MESES[mes - 1]}` : ` en ${ANIO_FIJO}`}
          </span>
        </div>
        <span className="self-start rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 sm:self-auto">
          Ganancia: $ {formatMoney(item.ganancia)}
        </span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-6">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {mes ? 'Viajes' : 'Total viajes'}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{item.totalViajes}</p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-blue-500" />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {mes ? 'Mes actual' : 'Mes actual'}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{item.viajesDelMes}</p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-sky-500" />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valor total</p>
          <p className="mt-2 text-xl font-bold text-slate-900">$ {formatMoney(item.valorTotal)}</p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-indigo-500" />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Anticipos</p>
          <p className="mt-2 text-xl font-bold text-slate-900">$ {formatMoney(item.totalAnticipos)}</p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-violet-500" />
        </div>
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gastos</p>
          <p className="mt-2 text-xl font-bold text-slate-900">$ {formatMoney(item.totalGastos)}</p>
          <div className="mt-3 h-0.5 w-6 rounded-full bg-amber-500" />
        </div>
        <button
          type="button"
          onClick={onVerGanancias}
          className="rounded-xl bg-emerald-600 p-4 text-left shadow-md shadow-emerald-600/20 transition-all duration-150 hover:bg-emerald-500 focus:outline-none"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Ganancia</p>
          <p className="mt-2 text-xl font-bold text-white">$ {formatMoney(item.ganancia)}</p>
          <p className="mt-3 text-xs font-semibold text-emerald-300">Ver detalle →</p>
        </button>
      </div>

      {/* Por empresa de esta placa */}
      {item.porEmpresa && item.porEmpresa.length > 0 && (
        <div className="border-t border-slate-100">
          <div className="hidden grid-cols-7 bg-slate-50/60 px-6 py-2.5 sm:grid">
            <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Empresa</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Viajes</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Valor total</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Anticipos</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Gastos</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Ganancia</span>
          </div>
          {item.porEmpresa.map((emp, idx) => (
            <div
              key={emp.empresa}
              className={`grid grid-cols-2 gap-3 px-6 py-3.5 transition-colors hover:bg-slate-50/80 sm:grid-cols-7 sm:gap-0 ${
                idx < item.porEmpresa.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="col-span-2 flex items-center gap-2.5 sm:col-span-2">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                  {emp.empresa.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-slate-700">{emp.empresa}</span>
              </div>
              <div className="text-sm sm:text-right"><span className="text-xs text-slate-400 sm:hidden">Viajes · </span><span className="font-medium text-slate-600">{emp.totalViajes}</span></div>
              <div className="text-sm sm:text-right"><span className="text-xs text-slate-400 sm:hidden">Valor · </span><span className="font-medium text-slate-600">$ {formatMoney(emp.valorTotal)}</span></div>
              <div className="text-sm sm:text-right"><span className="text-xs text-slate-400 sm:hidden">Anticipos · </span><span className="font-medium text-slate-600">$ {formatMoney(emp.totalAnticipos)}</span></div>
              <div className="text-sm sm:text-right"><span className="text-xs text-slate-400 sm:hidden">Gastos · </span><span className="font-medium text-slate-600">$ {formatMoney(emp.totalGastos)}</span></div>
              <div className="text-sm sm:text-right"><span className="text-xs text-slate-400 sm:hidden">Ganancia · </span><span className="font-bold text-emerald-600">$ {formatMoney(emp.ganancia)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  // null = General (año completo), 1-12 = mes específico
  const [mes, setMes] = useState(null)
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setCargando(true)
    setError(null)
    async function load() {
      try {
        const params = new URLSearchParams({ anio: ANIO_FIJO })
        if (mes) params.set('mes', mes)
        const res = await apiFetch(`/api/dashboard/stats?${params}`)
        if (!res.ok) throw new Error('Error al cargar estadísticas')
        const data = await res.json()
        if (!cancelled) setStats(data)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setCargando(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mes])

  const { global, porPlaca } = stats ?? {}

  const labelActivo = mes ? MESES[mes - 1] : `General ${ANIO_FIJO}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">General</h1>
        <p className="mt-1 text-sm text-slate-500">Métricas individuales por vehículo</p>
      </div>

      {/* Selector de mes */}
      <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex min-w-max items-center gap-1 px-3 py-2">
          {/* Tab General */}
          <button
            type="button"
            onClick={() => setMes(null)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              mes === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            General
          </button>
          <div className="mx-2 h-5 w-px bg-slate-200" />
          {/* Tabs de meses */}
          {MESES.map((nombre, i) => {
            const num = i + 1
            return (
              <button
                key={num}
                type="button"
                onClick={() => setMes(num)}
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  mes === num
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nombre}
              </button>
            )
          })}
        </div>
      </div>

      {/* Acceso rápido a tabla de viajes */}
      <AccesoRapido navigate={navigate} />

      {/* Resumen global compacto */}
      {global && !cargando && (
        <div className="mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="px-4 py-2 sm:px-5 sm:py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{labelActivo}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-3 text-sm sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:border-t-0 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Viajes</span>
              <span className="font-bold text-slate-800">{global.totalViajes}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Valor</span>
              <span className="font-bold text-slate-800">$ {formatMoney(global.valorTotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Gastos</span>
              <span className="font-bold text-slate-800">$ {formatMoney(global.totalGastos)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Ganancia</span>
              <span className="font-bold text-emerald-600">$ {formatMoney(global.ganancia)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cargando */}
      {cargando && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
            <span className="text-sm">Cargando {labelActivo}…</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!cargando && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      )}

      {/* Secciones por placa */}
      {!cargando && !error && porPlaca && porPlaca.length > 0 && (
        <div className="space-y-5">
          {porPlaca.map((item) => (
            <PlacaSection
              key={item.placa}
              item={item}
              mes={mes}
              onVerGanancias={() => {
                const params = new URLSearchParams({ anio: ANIO_FIJO })
                if (mes) params.set('mes', mes)
                navigate(`/ganancias?${params}`)
              }}
            />
          ))}
        </div>
      )}

      {!cargando && !error && porPlaca && porPlaca.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-400">
            Sin viajes en {mes ? MESES[mes - 1] : `${ANIO_FIJO}`}.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {mes ? 'Probá con otro mes o mirá la vista General.' : 'Crea un viaje para comenzar.'}
          </p>
        </div>
      )}
    </div>
  )
}
