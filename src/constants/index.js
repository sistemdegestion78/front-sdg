export const STORAGE_KEY = 'sdg-viajes'

export const emptyGastos = () => ({
  acpm: '',
  acpmPrecioGalon: '',
  acpmGalones: '',
  peajes: '',
  biaticos: '',
  ligaCargue: '',
  ligaDescargue: '',
  encarpada: '',
  descargue: '',
  pasajes: '',
  hotel: '',
  parqueadero: '',
  otros: '',
})

export const emptyViaje = () => ({
  fecha: '',
  manifiesto: '',
  numeroGuia: '',
  empresaCliente: '',
  clientes: '',
  viaje: '',
  valorViaje: '',
  rteFuente: '',
  rteIca: '',
  descuentoEmpresa: '',
  descuentoTotal: '',
  valorNeto: '',
  anticipo: '',
  saldo: '',
  pago: false,
  gastos: emptyGastos(),
})

export const GASTOS_CAMPOS = [
  { key: 'acpm', label: 'ACPM' },
  { key: 'peajes', label: 'Peajes' },
  { key: 'biaticos', label: 'Biáticos' },
  { key: 'ligaCargue', label: 'Liga Cargue' },
  { key: 'ligaDescargue', label: 'Liga Descargue' },
  { key: 'encarpada', label: 'Encarpada' },
  { key: 'descargue', label: 'Descargue' },
  { key: 'pasajes', label: 'Pasajes' },
  { key: 'hotel', label: 'Hotel' },
  { key: 'parqueadero', label: 'Parqueadero' },
  { key: 'otros', label: 'Otros' },
]

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DASHBOARD_DEMO = {
  totalViajes: 24,
  viajesDelMes: 8,
  valorTotal: 18500000,
  ganancia: 12200000,
  totalAnticipos: 15000000,
}

export const INPUT_BASE =
  'w-full min-w-[90px] rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 box-border'
export const INPUT_MANIFIESTO = 'min-w-[140px]'
export const INPUT_VIAJE = 'min-w-[260px]'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'
