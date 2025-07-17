'use client'
import Link from 'next/link'
import { useState } from 'react'
import LoginButton from '../login/LoginButton'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(3)

  return (
    <header className="bg-gradient-to-r p-4 from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative ">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-amber-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-amber-400/10 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-7xl px-36 py-3 relative z-10">
        <div className="flex justify-between items-center gap-6">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl shadow-lg">
                <span className="text-white text-2xl">🍷</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent leading-none">
                Bella Vista
              </h1>
              <p className="text-amber-200/80 text-xs font-medium mt-1">
                Cocina Gourmet • Experiencia Única
              </p>
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden lg:flex items-center space-x-7 flex-1 justify-center">
            {[
              { href: '/', label: 'Inicio' },
              { href: '/menu', label: 'Carta' },
              { href: '/reservas', label: 'Reservas' },
              { href: '/eventos', label: 'Eventos' },
              { href: '/nosotros', label: 'Historia' },
              { href: '/contacto', label: 'Contacto' }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-white/5 relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Carrito, botones y login */}
          <div className="hidden lg:flex items-center gap-5 flex-shrink-0 pl-4 border-l border-white/10">
            <Link href="/carrito" className="relative group">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-2 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300">
                <div className="relative">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">
                  Carrito
                </span>
              </div>
            </Link>

            <Link
              href="/pedido"
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm"
            >
              Ordenar Ahora
            </Link>

            <Link
              href="/reservas"
              className="border border-amber-400 text-amber-400 px-6 py-2 rounded-lg hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 font-medium text-sm"
            >
              Reservar Mesa
            </Link>

            {/* Componente LoginButton para desktop */}
            <LoginButton />
          </div>

          {/* Botón menú móvil */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : 'mb-1'}`}></span>
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'mb-1'}`}></span>
            <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </button>
        </div>

        {/* Menú móvil */}
        <div className={`lg:hidden transition-all duration-500 ${isMenuOpen ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'} `}>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <nav className="space-y-2">
              {[
                { href: '/', label: 'Inicio', icon: '🏠' },
                { href: '/menu', label: 'Carta', icon: '📋' },
                { href: '/reservas', label: 'Reservas', icon: '🗓️' },
                { href: '/eventos', label: 'Eventos', icon: '🎉' },
                { href: '/nosotros', label: 'Historia', icon: '📖' },
                { href: '/contacto', label: 'Contacto', icon: '📞' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-amber-400 py-3 px-4 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
              <Link
                href="/carrito"
                className="flex items-center justify-between bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="font-medium text-gray-300 group-hover:text-amber-400 transition-colors">Carrito</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Componente LoginButton para móvil */}
              <LoginButton isMobile={true} />

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/pedido"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-medium text-center text-sm"
                >
                  Ordenar Ahora
                </Link>
                <Link
                  href="/reservas"
                  className="border border-amber-400 text-amber-400 px-3 py-2.5 rounded-lg hover:bg-amber-400 hover:text-slate-900 transition-all duration-300 font-medium text-center text-sm"
                >
                  Reservar Mesa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}