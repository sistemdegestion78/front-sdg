import { formatNum, parseNumInput, toNum } from '../../utils'
import { INPUT_BASE, INPUT_MANIFIESTO, INPUT_VIAJE } from '../../constants'

const tdClass = 'border-b border-slate-100 px-3 py-2.5 align-middle'

export function FilaViaje({
  row,
  index,
  onChange,
  onQuitar,
  onGastos,
  cantidadFilas,
  even = true,
}) {
  return (
    <tr className={`transition-colors duration-100 hover:bg-emerald-50/30 ${even ? 'bg-white' : 'bg-slate-50/50'}`}>
      <td className={tdClass}>
        <input
          type="date"
          value={row.fecha}
          onChange={(e) => onChange(index, 'fecha', e.target.value)}
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={row.manifiesto}
          onChange={(e) => onChange(index, 'manifiesto', e.target.value)}
          className={`${INPUT_BASE} ${INPUT_MANIFIESTO}`}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          value={row.viaje}
          onChange={(e) => onChange(index, 'viaje', e.target.value)}
          className={`${INPUT_BASE} ${INPUT_VIAJE}`}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.valorViaje)}
          onChange={(e) => onChange(index, 'valorViaje', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.rteFuente)}
          onChange={(e) => onChange(index, 'rteFuente', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.rteIca)}
          onChange={(e) => onChange(index, 'rteIca', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.descuentoEmpresa)}
          onChange={(e) => onChange(index, 'descuentoEmpresa', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.descuentoTotal)}
          onChange={(e) => onChange(index, 'descuentoTotal', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <span className="inline-block w-full min-w-[90px] rounded-lg bg-slate-50 px-2.5 py-2 text-sm font-semibold text-slate-700">
          {(toNum(row.valorViaje) - toNum(row.descuentoTotal)).toLocaleString('es-CO')}
        </span>
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.anticipo)}
          onChange={(e) => onChange(index, 'anticipo', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={tdClass}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNum(row.saldo)}
          onChange={(e) => onChange(index, 'saldo', parseNumInput(e.target.value))}
          placeholder="0"
          className={INPUT_BASE}
        />
      </td>
      <td className={`${tdClass} text-center`}>
        <input
          type="checkbox"
          checked={row.pago || false}
          onChange={(e) => onChange(index, 'pago', e.target.checked)}
          className="h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-600 transition-all focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
        />
      </td>
      <td className={tdClass}>
        <button
          type="button"
          className="whitespace-nowrap rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-amber-600"
          onClick={() => onGastos(index)}
        >
          Gastos
        </button>
      </td>
      <td className={tdClass}>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-sm font-bold text-red-500 transition-all duration-150 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-50 disabled:hover:text-red-500"
          onClick={() => onQuitar(index)}
          title="Quitar fila"
          disabled={cantidadFilas === 1}
        >
          −
        </button>
      </td>
    </tr>
  )
}
