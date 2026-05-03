import { useState, useEffect } from 'react'
import { GASTOS_CAMPOS, MESES } from '../../constants'
import { toNum } from '../../utils'
import { apiFetch } from '../../utils/api'

export function PromedioGastos() {
  const [viajes, setViajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroPlaca, setFiltroPlaca] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroAnio, setFiltroAnio] = useState('')

  useEffect(() => {
    cargarTodosLosViajes()
  }, [])

  async function cargarTodosLosViajes() {
    setCargando(true)
    try {
      const resPlacas = await apiFetch('/api/placas')
      if (!resPlacas.ok) throw new Error('Error al cargar placas')
      const placas = await resPlacas.json()

      const todosLosViajes = []
      for (const placa of placas) {
        try {
          const resViajes = await apiFetch(`/api/${encodeURIComponent(placa)}/viajes/all`)
          if (resViajes.ok) {
            const viajesPlaca = await resViajes.json()
            viajesPlaca.forEach((viaje) => {
              todosLosViajes.push({
                ...viaje,
                placa,
              })
            })
          }
        } catch (err) {
          console.error(`Error cargando viajes de ${placa}:`, err)
        }
      }

      setViajes(todosLosViajes)
    } catch (error) {
      console.error('Error cargando viajes:', error)
    } finally {
      setCargando(false)
    }
  }

  // Filtrar viajes
  const viajesFiltrados = viajes.filter((viaje) => {
    if (filtroPlaca && !viaje.placa.toLowerCase().includes(filtroPlaca.toLowerCase())) {
      return false
    }
    if (filtroEmpresa && !viaje.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase())) {
      return false
    }
    if (filtroMes && viaje.mes !== Number(filtroMes)) {
      return false
    }
    if (filtroAnio && viaje.anio !== Number(filtroAnio)) {
      return false
    }
    return true
  })

  // Calcular promedios por categoría de gasto
  const totalViajes = viajesFiltrados.length
  const promedios = GASTOS_CAMPOS.reduce((acc, { key, label }) => {
    const total = viajesFiltrados.reduce((sum, viaje) => {
      return sum + toNum(viaje.gastos?.[key] || 0)
    }, 0)
    acc[key] = {
      label,
      total,
      promedio: totalViajes > 0 ? total / totalViajes : 0,
    }
    return acc
  }, {})

  // Calcular promedio total de gastos por viaje
  const totalGastosGlobal = viajesFiltrados.reduce((sum, viaje) => {
    const gastosViaje = GASTOS_CAMPOS.reduce((acc, { key }) => {
      return acc + toNum(viaje.gastos?.[key] || 0)
    }, 0)
    return sum + gastosViaje
  }, 0)

  const promedioTotalPorViaje = totalViajes > 0 ? totalGastosGlobal / totalViajes : 0

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Promedio de gastos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Análisis del promedio de gastos por categoría en todos los viajes
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:mb-6 sm:rounded-2xl">
        <div className="grid grid-cols-2 gap-3 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Placa</label>
            <input
              type="text"
              value={filtroPlaca}
              onChange={(e) => setFiltroPlaca(e.target.value)}
              placeholder="Filtrar"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Empresa</label>
            <input
              type="text"
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              placeholder="Filtrar"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Mes</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Todos</option>
              {MESES.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Año</label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Todos</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setFiltroPlaca('')
              setFiltroEmpresa('')
              setFiltroMes('')
              setFiltroAnio('')
            }}
            className="col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:col-span-1 sm:ml-auto"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
            <p className="text-sm text-slate-500">Cargando estadísticas...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen general */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 py-4 text-white shadow-lg sm:px-6 sm:py-5">
              <p className="text-xs font-semibold opacity-90 sm:text-sm">Total de viajes</p>
              <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{totalViajes}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-4 text-white shadow-lg sm:px-6 sm:py-5">
              <p className="text-xs font-semibold opacity-90 sm:text-sm">Total en gastos</p>
              <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-3xl">${totalGastosGlobal.toLocaleString('es-CO')}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 px-4 py-4 text-white shadow-lg sm:px-6 sm:py-5">
              <p className="text-xs font-semibold opacity-90 sm:text-sm">Promedio por viaje</p>
              <p className="mt-1 text-xl font-bold sm:mt-2 sm:text-3xl">${Math.round(promedioTotalPorViaje).toLocaleString('es-CO')}</p>
            </div>
          </div>

          {/* Tabla de promedios por categoría */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Promedio por categoría de gasto
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Categoría
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Total
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      Promedio
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {GASTOS_CAMPOS.map(({ key, label }, index) => {
                    const datos = promedios[key]
                    const porcentaje = totalGastosGlobal > 0 ? (datos.total / totalGastosGlobal) * 100 : 0

                    return (
                      <tr
                        key={key}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="px-3 py-3 text-sm font-semibold text-slate-800 sm:px-6 sm:py-4">{label}</td>
                        <td className="px-3 py-3 text-right text-sm font-medium text-slate-700 sm:px-6 sm:py-4">
                          ${datos.total.toLocaleString('es-CO')}
                        </td>
                        <td className="px-3 py-3 text-right text-sm font-bold text-emerald-600 sm:px-6 sm:py-4">
                          ${Math.round(datos.promedio).toLocaleString('es-CO')}
                        </td>
                        <td className="px-3 py-3 text-right text-sm text-slate-600 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden h-2 w-20 overflow-hidden rounded-full bg-slate-200 sm:block">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium">{porcentaje.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                    <td className="px-3 py-3 text-sm text-slate-900 sm:px-6 sm:py-4">TOTAL</td>
                    <td className="px-3 py-3 text-right text-sm text-slate-900 sm:px-6 sm:py-4">
                      ${totalGastosGlobal.toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-emerald-700 sm:px-6 sm:py-4">
                      ${Math.round(promedioTotalPorViaje).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-slate-900 sm:px-6 sm:py-4">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
