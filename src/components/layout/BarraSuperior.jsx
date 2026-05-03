import { useState } from 'react'

export function BarraSuperior({ vista, onIrDashboard, onIrTodosLosViajes, onIrPromedioGastos, onCrearViaje, usuario, onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const navBtn = (onClick, activo, label) => (
    <button
      type="button"
      onClick={() => { onClick(); setMenuAbierto(false) }}
      className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 md:w-auto md:text-center ${
        activo
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-10 border-b border-slate-700/50 bg-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-3.5">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-7 w-10 items-center justify-center rounded-md bg-emerald-500 shadow-sm">
            <span className="text-[10px] font-black tracking-tight text-white">SDG</span>
          </div>
          <h1 className="text-sm font-semibold text-slate-100">
            <span className="hidden sm:inline">Sistema de gestión </span>
            <span className="hidden sm:inline text-slate-500">· </span>
            <span className="text-emerald-400">Viajes</span>
          </h1>
        </div>

        {/* Botones desktop */}
        <nav className="hidden items-center gap-2 md:flex">
          {navBtn(onIrDashboard, vista === 'dashboard', 'General')}
          {navBtn(onIrTodosLosViajes, vista === 'todos', 'Todos los viajes')}
          {navBtn(onIrPromedioGastos, vista === 'promedio', 'Promedio gastos')}
          <button
            type="button"
            onClick={onCrearViaje}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-400"
          >
            + Crear viaje
          </button>
          {usuario && (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-700 pl-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                {usuario.nombre.charAt(0).toUpperCase()}
              </span>
              <span className="text-sm text-slate-300">{usuario.nombre}</span>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
              >
                Salir
              </button>
            </div>
          )}
        </nav>

        {/* Botón hamburguesa mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onCrearViaje}
            className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm"
          >
            + Crear
          </button>
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            {menuAbierto ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menú mobile desplegable */}
      {menuAbierto && (
        <nav className="border-t border-slate-700/50 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navBtn(onIrDashboard, vista === 'dashboard', 'General')}
            {navBtn(onIrTodosLosViajes, vista === 'todos', 'Todos los viajes')}
            {navBtn(onIrPromedioGastos, vista === 'promedio', 'Promedio gastos')}
            {usuario && (
              <div className="mt-2 flex items-center justify-between border-t border-slate-700/50 pt-3">
                <span className="text-sm text-slate-300">{usuario.nombre}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
