import { useState, useMemo, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate, useParams, useSearchParams, Outlet, useOutletContext, Navigate } from 'react-router-dom'
import { useViajes } from './hooks/useViajes'
import { useAuth } from './context/AuthContext'
import { apiFetch } from './utils/api'
import { BarraSuperior } from './components/layout/BarraSuperior'
import { Dashboard } from './components/dashboard/Dashboard'
import { PantallaGanancias } from './components/dashboard/PantallaGanancias'
import { ModalPlaca } from './components/viajes/ModalPlaca'
import { ModalEmpresa } from './components/viajes/ModalEmpresa'
import { TablaViajes } from './components/viajes/TablaViajes'
import { PantallaGastos } from './components/gastos/PantallaGastos'
import { TodosLosViajes } from './components/viajes/TodosLosViajes'
import { PromedioGastos } from './components/estadisticas/PromedioGastos'
import { Login } from './components/auth/Login'
import { Register } from './components/auth/Register'
import { ForgotPassword } from './components/auth/ForgotPassword'
import { ResetPassword } from './components/auth/ResetPassword'

const mesActual = new Date().getMonth() + 1
const anioActual = new Date().getFullYear()

function ViajesLayout() {
  const { placa, empresa } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const placaDecoded = decodeURIComponent(placa || '')
  const empresaDecoded = decodeURIComponent(empresa || '')
  const storageKey = `ultimoMes_${placaDecoded}_${empresaDecoded}`
  const mes = useMemo(() => {
    const m = searchParams.get('mes')
    if (m == null || m === '') {
      const guardado = localStorage.getItem(storageKey)
      if (guardado) {
        const parsed = JSON.parse(guardado)
        return parsed.mes || mesActual
      }
      return mesActual
    }
    const n = parseInt(m, 10)
    return Number.isNaN(n) || n < 1 || n > 12 ? mesActual : n
  }, [searchParams, storageKey])
  const anio = useMemo(() => {
    const a = searchParams.get('anio')
    if (a == null || a === '') {
      const guardado = localStorage.getItem(storageKey)
      if (guardado) {
        const parsed = JSON.parse(guardado)
        return parsed.anio || anioActual
      }
      return anioActual
    }
    const n = parseInt(a, 10)
    return Number.isNaN(n) ? anioActual : n
  }, [searchParams, storageKey])
  const { filas, agregarFila, cambiarCelda, cambiarGasto, quitarFila, guardarEnBackend, guardando, exportarExcel } = useViajes(
    placaDecoded,
    empresaDecoded,
    () => {},
    mes,
    anio
  )
  const onMesAnioChange = (nuevoMes, nuevoAnio) => {
    const params = new URLSearchParams(searchParams)
    params.set('mes', String(nuevoMes))
    params.set('anio', String(nuevoAnio))
    setSearchParams(params)
    localStorage.setItem(storageKey, JSON.stringify({ mes: nuevoMes, anio: nuevoAnio }))
  }
  const abrirGastos = (index) => {
    const q = window.location.search || `?mes=${mes}&anio=${anio}`
    navigate(`/viajes/${encodeURIComponent(placaDecoded)}/${encodeURIComponent(empresaDecoded)}/gastos/${index}${q}`)
  }
  const search = searchParams.toString() ? `?${searchParams.toString()}` : `?mes=${mes}&anio=${anio}`
  const context = {
    filas,
    agregarFila,
    cambiarCelda,
    cambiarGasto,
    quitarFila,
    guardarEnBackend,
    guardando,
    exportarExcel,
    mes,
    anio,
    onMesAnioChange,
    abrirGastos,
    navigate,
    placaDecoded,
    empresaDecoded,
    search,
  }
  return <Outlet context={context} />
}

function ViajesTablePage() {
  const ctx = useOutletContext()
  const [placas, setPlacas] = useState([])
  const [empresas, setEmpresas] = useState([])

  useEffect(() => {
    apiFetch('/api/placas')
      .then((r) => r.json())
      .then(setPlacas)
      .catch(() => {})
    apiFetch('/api/empresas')
      .then((r) => r.json())
      .then((data) => setEmpresas(data.map((e) => e.nombre)))
      .catch(() => {})
  }, [])

  return (
    <TablaViajes
      filas={ctx.filas}
      mes={ctx.mes}
      anio={ctx.anio}
      onMesAnioChange={ctx.onMesAnioChange}
      onCambiarCelda={ctx.cambiarCelda}
      onAgregarFila={ctx.agregarFila}
      onQuitarFila={ctx.quitarFila}
      onAbrirGastos={ctx.abrirGastos}
      onGuardar={ctx.guardarEnBackend}
      onExportarExcel={ctx.exportarExcel}
      guardando={ctx.guardando}
      placa={ctx.placaDecoded}
      empresa={ctx.empresaDecoded}
      placas={placas}
      empresas={empresas}
      onCambiarEmpresa={(nuevaEmpresa) =>
        ctx.navigate(
          `/viajes/${encodeURIComponent(ctx.placaDecoded)}/${encodeURIComponent(nuevaEmpresa)}${ctx.search}`
        )
      }
      onCambiarPlaca={(nuevaPlaca) =>
        ctx.navigate(
          `/viajes/${encodeURIComponent(nuevaPlaca)}/${encodeURIComponent(ctx.empresaDecoded)}${ctx.search}`
        )
      }
    />
  )
}

function GastosPage() {
  const { index } = useParams()
  const ctx = useOutletContext()
  const indexNum = parseInt(index, 10)
  const viaje = ctx.filas[indexNum]
  if (viaje == null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-500">Viaje no encontrado.</p>
          <button
            type="button"
            className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            onClick={() => ctx.navigate(`/viajes/${encodeURIComponent(ctx.placaDecoded)}/${encodeURIComponent(ctx.empresaDecoded)}${ctx.search}`)}
          >
            ← Volver a viajes
          </button>
        </div>
      </div>
    )
  }
  return (
    <PantallaGastos
      viaje={viaje}
      index={indexNum}
      gastos={viaje.gastos}
      empresaTransportadora={ctx.empresaDecoded}
      onCambiarGasto={ctx.cambiarGasto}
      onCambiarDatoViaje={ctx.cambiarCelda}
      onVolver={() => ctx.navigate(`/viajes/${encodeURIComponent(ctx.placaDecoded)}/${encodeURIComponent(ctx.empresaDecoded)}${ctx.search}`)}
    />
  )
}

function AppAutenticada() {
  const [modalPlacaAbierto, setModalPlacaAbierto] = useState(false)
  const [modalEmpresaAbierto, setModalEmpresaAbierto] = useState(false)
  const [placaSeleccionada, setPlacaSeleccionada] = useState(null)
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const esDashboard = location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/ganancias'
  const esTodosLosViajes = location.pathname === '/todos-los-viajes'
  const esPromedioGastos = location.pathname === '/promedio-gastos'
  const vista = esDashboard ? 'dashboard' : esTodosLosViajes ? 'todos' : esPromedioGastos ? 'promedio' : 'viajes'

  const handlePlacaContinuar = (placa) => {
    setPlacaSeleccionada(placa)
    setModalPlacaAbierto(false)
    setModalEmpresaAbierto(true)
  }

  const handleEmpresaContinuar = (empresa) => {
    setModalEmpresaAbierto(false)
    navigate(`/viajes/${encodeURIComponent(placaSeleccionada)}/${encodeURIComponent(empresa)}`)
    setPlacaSeleccionada(null)
  }

  const handleCancelar = () => {
    setModalPlacaAbierto(false)
    setModalEmpresaAbierto(false)
    setPlacaSeleccionada(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <BarraSuperior
        vista={vista}
        onIrDashboard={() => navigate('/')}
        onIrTodosLosViajes={() => navigate('/todos-los-viajes')}
        onIrPromedioGastos={() => navigate('/promedio-gastos')}
        onCrearViaje={() => setModalPlacaAbierto(true)}
        usuario={user}
        onLogout={logout}
      />
      <main className="min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ganancias" element={<PantallaGanancias />} />
          <Route path="/todos-los-viajes" element={<TodosLosViajes />} />
          <Route path="/promedio-gastos" element={<PromedioGastos />} />
          <Route path="/viajes/:placa/:empresa" element={<ViajesLayout />}>
            <Route index element={<ViajesTablePage />} />
            <Route path="gastos/:index" element={<GastosPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ModalPlaca
        abierto={modalPlacaAbierto}
        onContinuar={handlePlacaContinuar}
        onCancelar={handleCancelar}
      />
      <ModalEmpresa
        abierto={modalEmpresaAbierto}
        onContinuar={handleEmpresaContinuar}
        onCancelar={handleCancelar}
      />
    </div>
  )
}

function App() {
  const { user, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
          <p className="text-sm text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AppAutenticada />
}

export default App
