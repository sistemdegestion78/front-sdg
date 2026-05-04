import { useMemo } from 'react'
import { toNum, formatNum, parseNumInput } from '../../utils'
import { GASTOS_CAMPOS, INPUT_BASE } from '../../constants'

export function PantallaGastos({ viaje, index, gastos, empresaTransportadora, onCambiarGasto, onCambiarDatoViaje, onVolver }) {
  const valorNeto = toNum(viaje.valorNeto)
  const anticipo = toNum(viaje.anticipo)

  const { totalGastos, saldo, ganancia } = useMemo(() => {
    const total = GASTOS_CAMPOS.reduce((acc, { key }) => acc + toNum(gastos[key]), 0)
    const saldoCalc = anticipo - total
    const gananciaCalc = valorNeto - total
    return { totalGastos: total, saldo: saldoCalc, ganancia: gananciaCalc }
  }, [gastos, anticipo, valorNeto])

  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Gastos del viaje</h1>
          <p className="mt-1 truncate text-sm text-slate-500">Viaje #{index + 1} · {viaje.viaje || '—'}</p>
        </div>
        <button
          type="button"
          onClick={onVolver}
          className="ml-3 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:px-4"
        >
          ← Volver
        </button>
      </div>

      {/* Resumen del viaje */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Datos del viaje</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-slate-600">Empresa transportadora</span>
            <span className="text-sm font-semibold text-slate-800">{viaje.empresa || empresaTransportadora || '—'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Nº guía</label>
            <input
              type="text"
              autoComplete="off"
              value={viaje.numeroGuia ?? ''}
              onChange={(e) => onCambiarDatoViaje?.(index, 'numeroGuia', e.target.value)}
              className={INPUT_BASE}
              placeholder="Ingrese manualmente"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Empresa (cliente)</label>
            <input
              type="text"
              autoComplete="off"
              value={viaje.empresaCliente ?? ''}
              onChange={(e) => onCambiarDatoViaje?.(index, 'empresaCliente', e.target.value)}
              className={INPUT_BASE}
              placeholder="Ingrese manualmente"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Clientes</label>
            <input
              type="text"
              autoComplete="off"
              value={viaje.clientes ?? ''}
              onChange={(e) => onCambiarDatoViaje?.(index, 'clientes', e.target.value)}
              className={INPUT_BASE}
              placeholder="Ingrese manualmente"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-slate-600">Fecha</span>
            <span className="text-sm font-semibold text-slate-800">{viaje.fecha || '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Ruta</span>
            <span className="text-sm font-semibold text-slate-800">{viaje.viaje || '—'}</span>
          </div>
        </div>
      </div>

      {/* Gastos */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Detalle de gastos</h2>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          {/* ACPM - Manejo especial con cálculo */}
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-600">ACPM</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Precio/galón</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatNum(gastos.acpmPrecioGalon)}
                  onChange={(e) => {
                    const precio = parseNumInput(e.target.value)
                    onCambiarGasto(index, 'acpmPrecioGalon', precio)
                    const galones = toNum(gastos.acpmGalones)
                    const total = toNum(precio) * galones
                    onCambiarGasto(index, 'acpm', String(total))
                  }}
                  className={INPUT_BASE}
                  placeholder="10907"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Galones</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatNum(gastos.acpmGalones)}
                  onChange={(e) => {
                    const galones = parseNumInput(e.target.value)
                    onCambiarGasto(index, 'acpmGalones', galones)
                    const precio = toNum(gastos.acpmPrecioGalon)
                    const total = precio * toNum(galones)
                    onCambiarGasto(index, 'acpm', String(total))
                  }}
                  className={INPUT_BASE}
                  placeholder="30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Total ACPM</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatNum(gastos.acpm)}
                  onChange={(e) => onCambiarGasto(index, 'acpm', parseNumInput(e.target.value))}
                  className={`${INPUT_BASE} bg-emerald-50 font-bold text-emerald-700`}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Otros gastos */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {GASTOS_CAMPOS.filter(({ key }) => key !== 'acpm').map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-600 sm:text-xs">{label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatNum(gastos[key])}
                  onChange={(e) => onCambiarGasto(index, key, parseNumInput(e.target.value))}
                  className={INPUT_BASE}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-200">
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">Total gastos</p>
            <p className="mt-1 text-base font-bold text-slate-800 sm:mt-1.5 sm:text-xl">
              {totalGastos.toLocaleString('es-CO')}
            </p>
          </div>
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">Saldo</p>
            <p className={`mt-1 text-base font-bold sm:mt-1.5 sm:text-xl ${saldo >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
              {saldo.toLocaleString('es-CO')}
            </p>
            <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">anticipo − gastos</p>
          </div>
          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">Ganancia</p>
            <p className={`mt-1 text-base font-bold sm:mt-1.5 sm:text-xl ${ganancia >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {ganancia.toLocaleString('es-CO')}
            </p>
            <p className="mt-0.5 hidden text-xs text-slate-400 sm:block">valor neto − gastos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
