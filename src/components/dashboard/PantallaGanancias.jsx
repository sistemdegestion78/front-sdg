import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MESES } from '../../constants'
import { apiFetch } from '../../utils/api'

function formatMoney(n) {
  return n.toLocaleString('es-CO')
}

const ANIO_FIJO = 2026

export function PantallaGanancias() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Leer mes inicial desde la URL (viene del dashboard)
  const mesParam = Number(searchParams.get('mes')) || null
  const [mes, setMes] = useState(mesParam)

  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const cambiarMes = (nuevoMes) => {
    setMes(nuevoMes)
    const p = { anio: ANIO_FIJO }
    if (nuevoMes) p.mes = nuevoMes
    setSearchParams(p)
  }

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
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ganancias</h1>
          <p className="mt-1 text-sm text-slate-500">Rentabilidad por vehículo y empresa</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          ← Volver
        </button>
      </div>

      {/* Selector de mes */}
      <div className="mb-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex min-w-max items-center gap-1 px-3 py-2">
          <button
            type="button"
            onClick={() => cambiarMes(null)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              mes === null
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            General
          </button>
          <div className="mx-2 h-5 w-px bg-slate-200" />
          {MESES.map((nombre, i) => {
            const num = i + 1
            return (
              <button
                key={num}
                type="button"
                onClick={() => cambiarMes(num)}
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

      {!cargando && !error && global && (
        <>
          {/* Tarjeta hero */}
          <div className="mb-8 overflow-hidden rounded-2xl bg-emerald-600 p-8 shadow-xl shadow-emerald-600/20">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
              Ganancia total · {labelActivo}
            </p>
            <p className="mt-3 text-5xl font-bold tracking-tight text-white">
              $ {formatMoney(global.ganancia)}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-emerald-200">
              <span>Valor neto</span>
              <span className="font-bold text-white">$ {formatMoney(global.valorTotal)}</span>
              <span className="text-emerald-400">−</span>
              <span>Gastos</span>
              <span className="font-bold text-white">$ {formatMoney(global.totalGastos)}</span>
            </div>
          </div>

          {/* Sin datos */}
          {(!porPlaca || porPlaca.length === 0) && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-400">Sin viajes en {labelActivo}.</p>
            </div>
          )}

          {/* Por placa */}
          {porPlaca && porPlaca.length > 0 && (
            <div className="space-y-4">
              {porPlaca.map((item) => (
                <div key={item.placa} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                  {/* Header placa */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-black tracking-widest text-white">
                        {item.placa}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.totalViajes} viaje{item.totalViajes !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5 text-sm">
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">Valor neto</p>
                        <p className="font-semibold text-slate-700">$ {formatMoney(item.valorTotal)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">Gastos</p>
                        <p className="font-semibold text-slate-700">$ {formatMoney(item.totalGastos)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">Ganancia</p>
                        <p className="text-xl font-bold text-emerald-600">$ {formatMoney(item.ganancia)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Por empresa de esta placa */}
                  {item.porEmpresa && item.porEmpresa.length > 0 && (
                    <>
                      <div className="hidden grid-cols-5 bg-slate-50/50 px-6 py-2.5 sm:grid">
                        <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Empresa</span>
                        <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Valor neto</span>
                        <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Gastos</span>
                        <span className="text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Ganancia</span>
                      </div>
                      {item.porEmpresa.map((emp, idx) => (
                        <div
                          key={emp.empresa}
                          className={`flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70 ${
                            idx < item.porEmpresa.length - 1 ? 'border-b border-slate-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                              {emp.empresa.charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{emp.empresa}</p>
                              <p className="text-xs text-slate-400">{emp.totalViajes} viaje{emp.totalViajes !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Valor neto</p>
                              <p className="font-semibold text-slate-700">$ {formatMoney(emp.valorTotal)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Gastos</p>
                              <p className="font-semibold text-slate-700">$ {formatMoney(emp.totalGastos)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Ganancia</p>
                              <p className="text-lg font-bold text-emerald-600">$ {formatMoney(emp.ganancia)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
