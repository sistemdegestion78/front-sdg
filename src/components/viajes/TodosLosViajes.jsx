import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { GASTOS_CAMPOS, MESES } from '../../constants'
import { toNum } from '../../utils'
import { apiFetch } from '../../utils/api'

const thClass = 'border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap sticky top-0'
const tdClass = 'border-b border-slate-100 px-4 py-3 text-sm'

export function TodosLosViajes() {
  const [viajes, setViajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroPlaca, setFiltroPlaca] = useState('')
  const [filtroEmpresa, setFiltroEmpresa] = useState('')
  const [filtroManifiesto, setFiltroManifiesto] = useState('')
  const [filtroMes, setFiltroMes] = useState('') // Nuevo filtro por mes
  const [filtroAnio, setFiltroAnio] = useState('') // Nuevo filtro por año
  const [filtroPago, setFiltroPago] = useState('todos') // 'todos', 'pagados', 'sin_pagar'

  useEffect(() => {
    cargarTodosLosViajes()
  }, [])

  async function cargarTodosLosViajes() {
    setCargando(true)
    try {
      // Obtener todas las placas
      const resPlacas = await apiFetch('/api/placas')
      if (!resPlacas.ok) throw new Error('Error al cargar placas')
      const placas = await resPlacas.json()

      // Para cada placa, obtener todos sus viajes
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

      // Ordenar por fecha ascendente (más antigua primero)
      todosLosViajes.sort((a, b) => {
        const fechaA = new Date(a.fecha || '1900-01-01')
        const fechaB = new Date(b.fecha || '1900-01-01')
        return fechaA - fechaB
      })

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
    if (filtroManifiesto && !viaje.manifiesto.toLowerCase().includes(filtroManifiesto.toLowerCase())) {
      return false
    }
    if (filtroMes && viaje.mes !== Number(filtroMes)) {
      return false
    }
    if (filtroAnio && viaje.anio !== Number(filtroAnio)) {
      return false
    }
    if (filtroPago === 'pagados' && !viaje.pago) {
      return false
    }
    if (filtroPago === 'sin_pagar' && viaje.pago) {
      return false
    }
    return true
  })

  // Calcular totales
  const totales = viajesFiltrados.reduce((acc, viaje) => {
    acc.valorTotal += toNum(viaje.valorNeto)
    acc.anticipoTotal += toNum(viaje.anticipo)
    acc.saldoTotal += toNum(viaje.saldo)
    return acc
  }, { valorTotal: 0, anticipoTotal: 0, saldoTotal: 0 })

  const exportarViajes = () => {
    if (viajesFiltrados.length === 0) return
    const gastoKeys = GASTOS_CAMPOS.map(({ key }) => key)
    const headers = [
      'Placa', 'Empresa', 'Fecha', 'Manifiesto', 'Nº Guía', 'Cliente',
      'Ruta', 'Valor viaje', 'RTE Fuente', 'RTE ICA', 'Desc. Total',
      'Valor neto', 'Anticipo', 'Saldo', 'Pago',
      ...GASTOS_CAMPOS.map(({ label }) => label),
      'Total gastos',
    ]
    const rows = viajesFiltrados.map((v) => {
      const g = v.gastos || {}
      const totalG = gastoKeys.reduce((acc, k) => acc + toNum(g[k]), 0)
      return [
        v.placa, v.empresa || '', v.fecha || '', v.manifiesto || '',
        v.numeroGuia || '', v.empresaCliente || '', v.viaje || '',
        toNum(v.valorViaje), toNum(v.rteFuente), toNum(v.rteIca),
        toNum(v.descuentoTotal), toNum(v.valorNeto), toNum(v.anticipo),
        toNum(v.saldo), v.pago ? 'Sí' : 'No',
        ...gastoKeys.map((k) => toNum(g[k])),
        totalG,
      ]
    })
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Viajes')
    const partes = ['viajes-todos']
    if (filtroMes) partes.push(MESES[Number(filtroMes) - 1])
    if (filtroAnio) partes.push(filtroAnio)
    partes.push(new Date().toISOString().slice(0, 10))
    XLSX.writeFile(wb, `${partes.join('-')}.xlsx`)
  }

  const exportarGastos = () => {
    if (viajesFiltrados.length === 0) return
    const gastoKeys = GASTOS_CAMPOS.map(({ key }) => key)
    const headers = [
      'Placa', 'Empresa', 'Fecha', 'Ruta', 'Manifiesto',
      'ACPM Precio/galón', 'ACPM Galones', 'ACPM Total',
      ...GASTOS_CAMPOS.filter(({ key }) => key !== 'acpm').map(({ label }) => label),
      'Total gastos', 'Valor neto', 'Anticipo',
      'Saldo (anticipo − gastos)', 'Ganancia (neto − gastos)',
    ]
    const rows = viajesFiltrados.map((v) => {
      const g = v.gastos || {}
      const totalG = gastoKeys.reduce((acc, k) => acc + toNum(g[k]), 0)
      const vNeto = toNum(v.valorNeto)
      const ant = toNum(v.anticipo)
      return [
        v.placa, v.empresa || '', v.fecha || '', v.viaje || '', v.manifiesto || '',
        toNum(g.acpmPrecioGalon), toNum(g.acpmGalones), toNum(g.acpm),
        ...gastoKeys.filter((k) => k !== 'acpm').map((k) => toNum(g[k])),
        totalG, vNeto, ant,
        ant - totalG, vNeto - totalG,
      ]
    })
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos')
    const partes = ['gastos-todos']
    if (filtroMes) partes.push(MESES[Number(filtroMes) - 1])
    if (filtroAnio) partes.push(filtroAnio)
    partes.push(new Date().toISOString().slice(0, 10))
    XLSX.writeFile(wb, `${partes.join('-')}.xlsx`)
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Todos los viajes</h1>
          <p className="mt-1 text-sm text-slate-500">Vista consolidada de todos los viajes registrados</p>
        </div>
        {!cargando && viajesFiltrados.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportarViajes}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              Exportar viajes
            </button>
            <button
              type="button"
              onClick={exportarGastos}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 shadow-sm transition-colors hover:bg-amber-100"
            >
              Exportar gastos
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:mb-6 sm:rounded-2xl">
        <div className="grid grid-cols-2 gap-3 px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Placa</label>
            <input
              type="text"
              autoComplete="off"
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
              autoComplete="off"
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              placeholder="Filtrar"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Manifiesto</label>
            <input
              type="text"
              autoComplete="off"
              value={filtroManifiesto}
              onChange={(e) => setFiltroManifiesto(e.target.value)}
              placeholder="Nº"
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 sm:text-sm">Estado</label>
            <select
              value={filtroPago}
              onChange={(e) => setFiltroPago(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="todos">Todos</option>
              <option value="pagados">Pagados</option>
              <option value="sin_pagar">Sin pagar</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setFiltroPlaca('')
              setFiltroEmpresa('')
              setFiltroManifiesto('')
              setFiltroMes('')
              setFiltroAnio('')
              setFiltroPago('todos')
            }}
            className="col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 sm:col-span-1 sm:ml-auto"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Total viajes</p>
          <p className="mt-1 text-xl font-bold text-slate-800 sm:mt-1.5 sm:text-2xl">{viajesFiltrados.length}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Valor total</p>
          <p className="mt-1 text-lg font-bold text-slate-800 sm:mt-1.5 sm:text-2xl">${totales.valorTotal.toLocaleString('es-CO')}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Total anticipos</p>
          <p className="mt-1 text-lg font-bold text-slate-800 sm:mt-1.5 sm:text-2xl">${totales.anticipoTotal.toLocaleString('es-CO')}</p>
        </div>
        <div className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200 sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Saldo total</p>
          <p className="mt-1 text-lg font-bold text-slate-800 sm:mt-1.5 sm:text-2xl">${totales.saldoTotal.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl">
        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
              <p className="text-sm text-slate-500">Cargando viajes...</p>
            </div>
          </div>
        ) : viajesFiltrados.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">No hay viajes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
            <table className="w-full min-w-[1400px] border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Placa</th>
                  <th className={thClass}>Empresa</th>
                  <th className={thClass}>Fecha</th>
                  <th className={thClass}>Manifiesto</th>
                  <th className={thClass}>Nº Guía</th>
                  <th className={thClass}>Cliente</th>
                  <th className={thClass}>Ruta</th>
                  <th className={thClass}>Valor viaje</th>
                  <th className={thClass}>RTE Fuente</th>
                  <th className={thClass}>RTE ICA</th>
                  <th className={thClass}>Desc. Total</th>
                  <th className={thClass}>Valor neto</th>
                  <th className={thClass}>Anticipo</th>
                  <th className={thClass}>Saldo</th>
                  <th className={thClass}>Pago</th>
                </tr>
              </thead>
              <tbody>
                {viajesFiltrados.map((viaje, index) => {
                  const saldo = toNum(viaje.saldo)
                  const isPagado = viaje.pago

                  return (
                    <tr
                      key={`${viaje.placa}-${index}`}
                      className={`transition-colors duration-100 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className={`${tdClass} font-bold text-slate-800`}>{viaje.placa}</td>
                      <td className={`${tdClass} font-semibold text-slate-700`}>{viaje.empresa || '—'}</td>
                      <td className={tdClass}>{viaje.fecha || '—'}</td>
                      <td className={tdClass}>{viaje.manifiesto || '—'}</td>
                      <td className={tdClass}>{viaje.numeroGuia || '—'}</td>
                      <td className={tdClass}>{viaje.empresaCliente || '—'}</td>
                      <td className={`${tdClass} max-w-xs truncate`} title={viaje.viaje}>
                        {viaje.viaje || '—'}
                      </td>
                      <td className={`${tdClass} text-right font-medium`}>
                        ${toNum(viaje.valorViaje).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        ${toNum(viaje.rteFuente).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        ${toNum(viaje.rteIca).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        ${toNum(viaje.descuentoTotal).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right font-semibold text-slate-800`}>
                        ${toNum(viaje.valorNeto).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        ${toNum(viaje.anticipo).toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-right font-bold ${
                        isPagado
                          ? 'bg-emerald-100 text-emerald-700'
                          : saldo >= 0
                            ? 'text-slate-800'
                            : 'text-red-600'
                      }`}>
                        ${saldo.toLocaleString('es-CO')}
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {isPagado ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            ✓ Pagado
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
