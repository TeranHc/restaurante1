'use client'
import Link from 'next/link'
import { useState } from 'react'
import LoginButton from '../login/LoginButton'
import { useCart } from '../Carrito/CartContext'
import CartModal from '../Carrito/CartModal'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemCount, toggleCart } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-lg border-b border-white/5 shadow-2xl">
        {/* Fondo decorativo mejorado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-72 h-72 bg-gradient-to-tr from-amber-400/8 via-amber-500/4 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">

            {/* LOGO - Mejorado */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-2.5 sm:p-3 rounded-xl shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-xl sm:text-2xl">🍷</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                  Bella Vista
                </h1>
                <p className="text-amber-200/70 text-xs lg:text-sm font-medium -mt-1">
                  Cocina Gourmet
                </p>
              </div>
            </Link>

            {/* NAVEGACIÓN DESKTOP - Simplificada */}
            <nav className="hidden xl:flex items-center space-x-2">
              {[
                { href: '/', label: 'Inicio', icon: '🏠' },
                { href: '/menu', label: 'Carta', icon: '📋' },
                { href: '/reservas', label: 'Reservas', icon: '🗓️' },
                { href: '/contacto', label: 'Contacto', icon: '📞' }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center space-x-2 px-5 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                >
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity text-base">
                    {item.icon}
                  </span>
                  <span className="group-hover:text-amber-400 transition-colors">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* ACCIONES - Optimizadas con mejor espaciado */}
            <div className="flex items-center space-x-4">
              
              {/* Carrito */}
              <button
                onClick={toggleCart}
                className="relative group flex items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-lg px-4 py-3 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {itemCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {itemCount > 99 ? '99+' : itemCount}
                  </div>
                )}
                <span className="hidden sm:inline ml-3 text-sm font-medium text-white group-hover:text-amber-400 transition-colors">
                  Carrito
                </span>
              </button>

              {/* Botones CTA - Más espaciados y grandes */}
              <div className="hidden sm:flex items-center space-x-4">
                <Link 
                  href="/pedido" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-amber-500/25 hover:scale-105"
                >
                  Ordenar Ahora
                </Link>

                <Link 
                  href="/reservas" 
                  className="border border-amber-400/60 hover:border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg"
                >
                  Reservar Mesa
                </Link>
              </div>

              {/* Login Button */}
              <div className="hidden sm:block">
                <LoginButton />
              </div>

              {/* Menú hamburguesa mejorado */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden flex flex-col justify-center items-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 group"
              >
                <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1 group-hover:w-6'}`}></span>
                <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'mb-1 group-hover:w-4'}`}></span>
                <span className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'group-hover:w-6'}`}></span>
              </button>
            </div>
          </div>

          {/* MENÚ MÓVIL - Completamente rediseñado */}
          <div className={`xl:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="py-4">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl">
                
                {/* Navegación móvil */}
                <div className="space-y-1 mb-6">
                  {[
                    { href: '/', label: 'Inicio', icon: '🏠' },
                    { href: '/menu', label: 'Carta', icon: '📋' },
                    { href: '/reservas', label: 'Reservas', icon: '🗓️' },
                    // { href: '/eventos', label: 'Eventos', icon: '🎉' },
                    // { href: '/nosotros', label: 'Historia', icon: '📖' },
                    { href: '/contacto', label: 'Contacto', icon: '📞' }
                  ].map((item, index) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="flex items-center space-x-3 p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="font-medium group-hover:text-amber-400 transition-colors">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Separador */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

                {/* Carrito móvil */}
                <button
                  onClick={toggleCart}
                  className="flex justify-between items-center w-full p-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 mb-4 group"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z" />
                    </svg>
                    <span className="font-medium group-hover:text-amber-400 transition-colors">Mi Carrito</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>

                {/* Botones CTA móvil */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Link 
                    href="/pedido" 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
                  >
                    Ordenar Ahora
                  </Link>
                  <Link 
                    href="/reservas" 
                    className="border border-amber-400/60 hover:border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 px-4 py-3 rounded-xl text-center text-sm font-medium transition-all duration-200"
                  >
                    Reservar Mesa
                  </Link>
                </div>

                {/* Login móvil */}
                <div className="sm:hidden">
                  <LoginButton isMobile={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal del carrito */}
      <CartModal />
    </>
  )
}