import { STORAGE_KEY, emptyViaje, emptyGastos } from '../constants'

export function toNum(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n : 0
}

export function formatNum(val) {
  if (val === '' || val == null) return ''
  return toNum(val).toLocaleString('es-CO')
}

export function parseNumInput(str) {
  return str.replace(/\D/g, '')
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [emptyViaje()]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return [emptyViaje()]
    return parsed.map((v) => ({
      ...emptyViaje(),
      ...v,
      gastos: { ...emptyGastos(), ...(v.gastos || {}) },
    }))
  } catch {
    return [emptyViaje()]
  }
}
