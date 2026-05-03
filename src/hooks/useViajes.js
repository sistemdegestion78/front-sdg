import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { toNum } from '../utils'
import { STORAGE_KEY, emptyViaje, API_URL } from '../constants'
import { sdgAlert } from '../utils/swal'
import { apiFetch } from '../utils/api'



const now = new Date()
const mesActual = now.getMonth() + 1
const anioActual = now.getFullYear()

export function useViajes(placa, empresaSeleccionada, setViajeEnGastos, mes = mesActual, anio = anioActual) {
  const [filas, setFilas] = useState([emptyViaje()])
  const [guardando, setGuardando] = useState(false)
  const ratesRef = useRef({ rteFuente: 1, rteIca: 0.5 })
  const mesNum = mes != null && !Number.isNaN(Number(mes)) ? Number(mes) : mesActual
  const anioNum = anio != null && !Number.isNaN(Number(anio)) ? Number(anio) : anioActual

  // Cargar tasas RTE de la empresa seleccionada
  useEffect(() => {
    if (!empresaSeleccionada) return
    let cancelled = false
    async function loadRates() {
      try {
        const res = await apiFetch('/api/empresas')
        if (!res.ok) return
        const empresas = await res.json()
        const emp = empresas.find((e) => e.nombre === empresaSeleccionada)
        if (!cancelled && emp) {
          ratesRef.current = { rteFuente: emp.rteFuente, rteIca: emp.rteIca }
        }
      } catch { /* usar defaults */ }
    }
    loadRates()
    return () => { cancelled = true }
  }, [empresaSeleccionada])

  useEffect(() => {
    if (!placa || !empresaSeleccionada) return
    let cancelled = false
    async function load() {
      try {
        const params = new URLSearchParams({ empresa: empresaSeleccionada })
        params.set('mes', String(mesNum))
        params.set('anio', String(anioNum))
        const res = await apiFetch(`/api/${encodeURIComponent(placa)}/viajes?${params.toString()}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setFilas(data.length > 0 ? data : [emptyViaje()])
        }
      } catch {
        if (!cancelled) setFilas([emptyViaje()])
      }
    }
    load()
    return () => { cancelled = true }
  }, [placa, empresaSeleccionada, mesNum, anioNum])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filas))
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e)
    }
  }, [filas])

  const guardarEnBackend = async () => {
    if (!placa || !empresaSeleccionada) return
    setGuardando(true)
    try {
      const res = await apiFetch(`/api/${encodeURIComponent(placa)}/viajes`, {
        method: 'POST',
        body: JSON.stringify({ viajes: filas, empresa: empresaSeleccionada, mes: mesNum, anio: anioNum }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      sdgAlert.success('Guardado', 'Los viajes se guardaron correctamente.')
    } catch (e) {
      console.warn('No se pudo guardar en el servidor', e)
      sdgAlert.error('No se pudo guardar', 'Comprueba que el servidor esté en marcha y vuelve a intentar.')
    } finally {
      setGuardando(false)
    }
  }

  const exportarExcel = () => {
    const headers = [
      'Fecha',
      'Nº Manifiesto',
      'Viaje',
      'Valor de viaje',
      'RTE Fuente',
      'RTE ICA',
      'Descuento Empresa',
      'Descuento total',
      'Valor neto',
      'Anticipo',
      'Saldo',
      'Total gastos',
    ]
    const rows = filas.map((row) => {
      const g = row.gastos || {}
      const totalGastos = ['acpm', 'peajes', 'biaticos', 'ligaCargue', 'ligaDescargue', 'encarpada', 'descargue', 'pasajes', 'hotel', 'parqueadero', 'otros'].reduce(
        (acc, k) => acc + toNum(g[k]),
        0
      )
      return [
        row.fecha ?? '',
        row.manifiesto ?? '',
        row.viaje ?? '',
        row.valorViaje ?? '',
        row.rteFuente ?? '',
        row.rteIca ?? '',
        row.descuentoEmpresa ?? '',
        row.descuentoTotal ?? '',
        row.valorNeto ?? '',
        row.anticipo ?? '',
        row.saldo ?? '',
        totalGastos,
      ]
    })
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Viajes')
    const nombre = empresaSeleccionada
      ? `viajes-${placa}-${empresaSeleccionada.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`
      : `viajes-${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, nombre)
  }

  const agregarFila = () => {
    setFilas((f) => [...f, emptyViaje()])
  }

  const cambiarCelda = (indexFila, campo, valor) => {
    const { rteFuente: rteFuentePct, rteIca: rteIcaPct } = ratesRef.current
    const rteFuenteRate = rteFuentePct / 100
    const rteIcaRate = rteIcaPct / 100

    if (campo === 'valorViaje') {
      const v = toNum(valor)
      const rteF = v * rteFuenteRate
      const rteI = v * rteIcaRate
      setFilas((f) =>
        f.map((row, i) => {
          if (i !== indexFila) return row
          const descEmp = toNum(row.descuentoEmpresa)
          const dt = rteF + rteI + descEmp
          const vn = v - dt
          return {
            ...row,
            valorViaje: valor,
            rteFuente: rteF,
            rteIca: rteI,
            descuentoTotal: dt,
            valorNeto: vn,
            saldo: vn - toNum(row.anticipo),
          }
        })
      )
      return
    }
    if (campo === 'descuentoEmpresa') {
      setFilas((f) =>
        f.map((row, i) => {
          if (i !== indexFila) return row
          const rteF = toNum(row.rteFuente)
          const rteI = toNum(row.rteIca)
          const dt = rteF + rteI + toNum(valor)
          const vn = toNum(row.valorViaje) - dt
          return {
            ...row,
            descuentoEmpresa: valor,
            descuentoTotal: dt,
            valorNeto: vn,
            saldo: vn - toNum(row.anticipo),
          }
        })
      )
      return
    }
    if (campo === 'rteFuente' || campo === 'rteIca') {
      setFilas((f) =>
        f.map((row, i) => {
          if (i !== indexFila) return row
          const rteF = campo === 'rteFuente' ? toNum(valor) : toNum(row.rteFuente)
          const rteI = campo === 'rteIca' ? toNum(valor) : toNum(row.rteIca)
          const descEmp = toNum(row.descuentoEmpresa)
          const dt = rteF + rteI + descEmp
          const vn = toNum(row.valorViaje) - dt
          return {
            ...row,
            [campo]: valor,
            descuentoTotal: dt,
            valorNeto: vn,
            saldo: vn - toNum(row.anticipo),
          }
        })
      )
      return
    }
    if (campo === 'anticipo') {
      setFilas((f) =>
        f.map((row, i) => {
          if (i !== indexFila) return row
          const vn = toNum(row.valorNeto)
          const ant = toNum(valor)
          return {
            ...row,
            anticipo: valor,
            saldo: vn - ant,
          }
        })
      )
      return
    }
    if (campo === 'valorViaje' || campo === 'descuentoTotal') {
      setFilas((f) =>
        f.map((row, i) => {
          if (i !== indexFila) return row
          const v = campo === 'valorViaje' ? toNum(valor) : toNum(row.valorViaje)
          const dt = campo === 'descuentoTotal' ? toNum(valor) : toNum(row.descuentoTotal)
          const vn = v - dt
          return {
            ...row,
            [campo]: valor,
            valorNeto: vn,
            saldo: vn - toNum(row.anticipo),
          }
        })
      )
      return
    }
    setFilas((f) =>
      f.map((row, i) =>
        i === indexFila ? { ...row, [campo]: valor } : row
      )
    )
  }

  const cambiarGasto = (indexFila, campo, valor) => {
    setFilas((f) =>
      f.map((row, i) =>
        i === indexFila
          ? { ...row, gastos: { ...row.gastos, [campo]: valor } }
          : row
      )
    )
  }

  const quitarFila = async (indexFila) => {
    if (filas.length <= 1) return
    const confirmado = await sdgAlert.confirm(
      '¿Eliminar viaje?',
      'Esta acción no se puede deshacer.',
      'Eliminar'
    )
    if (!confirmado) return

    // Eliminar del estado local
    const nuevasFilas = filas.filter((_, i) => i !== indexFila)
    setFilas(nuevasFilas)

    // Guardar cambios en el backend inmediatamente
    if (placa && empresaSeleccionada) {
      try {
        const res = await apiFetch(`/api/${encodeURIComponent(placa)}/viajes`, {
          method: 'POST',
          body: JSON.stringify({ viajes: nuevasFilas, empresa: empresaSeleccionada, mes: mesNum, anio: anioNum }),
        })
        if (!res.ok) throw new Error('Error al guardar')
        sdgAlert.success('Viaje eliminado', 'El viaje se eliminó correctamente.')
      } catch (e) {
        console.error('Error al eliminar viaje:', e)
        sdgAlert.error('Error', 'No se pudo eliminar el viaje del servidor.')
        // Revertir cambios
        setFilas(filas)
      }
    }

    if (setViajeEnGastos) {
      setViajeEnGastos((current) => {
        if (current === indexFila) return null
        if (current > indexFila) return current - 1
        return current
      })
    }
  }

  return { filas, agregarFila, cambiarCelda, cambiarGasto, quitarFila, guardarEnBackend, guardando, exportarExcel }
}
