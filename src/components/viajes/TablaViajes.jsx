import { FilaViaje } from './FilaViaje'
import { MESES } from '../../constants'

const thClass =
  'border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap'

export function TablaViajes({
  filas,
  mes = new Date().getMonth() + 1,
  anio = new Date().getFullYear(),
  onMesAnioChange,
  onCambiarCelda,
  onAgregarFila,
  onQuitarFila,
  onAbrirGastos,
  onGuardar,
  onExportarExcel,
  guardando = false,
  placa,
  empresa,
  placas = [],
  empresas = [],
  onCambiarEmpresa,
  onCambiarPlaca,
}) {
  const mesNum = Math.min(12, Math.max(1, Number(mes) || 1))
  const anioNum = Number(anio) || new Date().getFullYear()

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6 sm:py-8">
      {/* Header de página */}
      <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6 sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Viajes</h1>
        </div>

        {(placa || empresa) && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de placa */}
            {placa && placas.length > 1 && onCambiarPlaca ? (
              <div className="relative">
                <select
                  value={placa}
                  onChange={(e) => onCambiarPlaca(e.target.value)}
                  className="appearance-none cursor-pointer rounded-md border border-slate-600 bg-slate-800 py-1 pl-2.5 pr-7 text-xs font-bold tracking-wide text-white transition-all duration-150 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                >
                  {placas.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            ) : (
              placa && (
                <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-bold tracking-wide text-white">
                  {placa}
                </span>
              )
            )}

            {/* Selector de empresa */}
            {empresa && onCambiarEmpresa && (
              <div className="relative">
                <select
                  value={empresa}
                  onChange={(e) => onCambiarEmpresa(e.target.value)}
                  className="appearance-none cursor-pointer rounded-md border border-emerald-200 bg-emerald-50 py-1 pl-2.5 pr-7 text-xs font-semibold text-emerald-700 transition-all duration-150 hover:bg-emerald-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                >
                  {empresas.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
                {/* Ícono de flecha */}
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-500">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selector de mes y año */}
      <div className="mb-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:mb-6 sm:rounded-2xl">
        <div className="flex min-w-max items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2">
          {MESES.map((nombre, i) => {
            const num = i + 1
            const activo = num === mesNum
            return (
              <button
                key={num}
                type="button"
                onClick={() => onMesAnioChange?.(num, anioNum)}
                className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  activo
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {nombre}
              </button>
            )
          })}
          <div className="ml-2 h-6 w-px bg-slate-200" />
          <select
            value={anioNum}
            onChange={(e) => onMesAnioChange?.(mesNum, Number(e.target.value))}
            className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {[anioNum - 2, anioNum - 1, anioNum, anioNum + 1, anioNum + 2].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse">
            <thead>
              <tr>
                <th className={`${thClass} min-w-[120px]`}>Fecha</th>
                <th className={`${thClass} min-w-[150px]`}>Nº Manifiesto</th>
                <th className={`${thClass} min-w-[280px]`}>Viaje</th>
                <th className={`${thClass} min-w-[120px]`}>Valor de viaje</th>
                <th className={`${thClass} min-w-[100px]`}>RTE Fuente</th>
                <th className={`${thClass} min-w-[100px]`}>RTE ICA</th>
                <th className={`${thClass} min-w-[110px]`}>Desc. Empresa</th>
                <th className={`${thClass} min-w-[110px]`}>Desc. Total</th>
                <th className={`${thClass} min-w-[110px]`}>Valor neto</th>
                <th className={`${thClass} min-w-[110px]`}>Anticipo</th>
                <th className={`${thClass} min-w-[110px]`}>Saldo</th>
                <th className={`${thClass} min-w-[70px]`}>Pago</th>
                <th className={`${thClass} min-w-[90px]`}>Gastos</th>
                <th className={`${thClass} w-14`} />
              </tr>
            </thead>
            <tbody>
              {filas.map((row, i) => (
                <FilaViaje
                  even={i % 2 === 0}
                  key={i}
                  row={row}
                  index={i}
                  onChange={onCambiarCelda}
                  onQuitar={onQuitarFila}
                  onGastos={onAbrirGastos}
                  cantidadFilas={filas.length}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
        <button
          type="button"
          onClick={onAgregarFila}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-300"
        >
          + Agregar viaje
        </button>
        {onGuardar && (
          <button
            type="button"
            onClick={onGuardar}
            disabled={guardando}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        )}
        {onExportarExcel && (
          <button
            type="button"
            onClick={onExportarExcel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-300"
          >
            Exportar Excel
          </button>
        )}
      </div>
    </div>
  )
}
