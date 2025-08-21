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
      {/* HEADER CON POSICIÓN FIJA EN MÓVILES */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-lg border-b border-white/10 shadow-2xl supports-[backdrop-filter]:bg-slate-950/95">
        
        {/* Fondo decorativo mejorado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-72 h-72 bg-gradient-to-tr from-amber-400/8 via-amber-500/4 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* LOGO - Mejorado y más grande */}
            <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group flex-shrink-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-2 sm:p-3 rounded-xl shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white text-lg sm:text-2xl">🍷</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                  Bella Vista
                </h1>
                <p className="text-amber-200/80 text-xs sm:text-sm lg:text-base font-medium -mt-1">
                  Cocina Gourmet
                </p>
              </div>
            </Link>

            {/* NAVEGACIÓN DESKTOP - Rediseñada con mejor espaciado */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { href: '/admin/menu', label: 'Administrar Menú', icon: '📖' },
                { href: '/admin/ReservationAdmin', label: 'Administrar Reservas', icon: '🗓️' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex items-center space-x-3 px-6 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 font-medium text-lg"
                >
                  <span className="text-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200">
                    {item.icon}
                  </span>
                  <span className="group-hover:text-amber-400 transition-colors duration-200">
                    {item.label}
                  </span>
                  {/* Indicador de hover */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500 group-hover:w-3/4 transition-all duration-300 rounded-full"></div>
                </Link>
              ))}
            </nav>

            {/* ACCIONES - Mejor organizadas */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Carrito - Mejorado */}
              <button
                onClick={toggleCart}
                className="relative group flex items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {itemCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse shadow-lg">
                    {itemCount > 99 ? '99' : itemCount}
                  </div>
                )}
                <span className="hidden md:inline ml-2 sm:ml-3 text-sm sm:text-base font-medium text-white group-hover:text-amber-400 transition-colors duration-200">
                  Carrito
                </span>
              </button>

              {/* Botón CTA Principal */}
              <div className="hidden sm:block">
                <Link 
                  href="/pedido" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-amber-500/30 hover:scale-105 flex items-center space-x-2"
                >
                  <span>Ordenar Ahora</span>
                  <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Login Button */}
              <div className="hidden md:block">
                <LoginButton />
              </div>

              {/* Menú hamburguesa mejorado */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden flex flex-col justify-center items-center w-10 sm:w-12 h-10 sm:h-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-xl transition-all duration-300 group hover:scale-105"
              >
                <span className={`h-0.5 w-5 sm:w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : 'mb-1.5 group-hover:w-6 sm:group-hover:w-7'}`}></span>
                <span className={`h-0.5 w-5 sm:w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'mb-1.5 group-hover:w-4 sm:group-hover:w-5'}`}></span>
                <span className={`h-0.5 w-5 sm:w-6 bg-white transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : 'group-hover:w-6 sm:group-hover:w-7'}`}></span>
              </button>
            </div>
          </div>

          {/* MENÚ MÓVIL - Completamente rediseñado */}
          <div className={`lg:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="py-4 sm:py-6">
              <div className="bg-gradient-to-br from-white/8 to-white/[0.03] backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/15 shadow-2xl">
                
                {/* Navegación móvil */}
                <div className="space-y-2 mb-4 sm:mb-6">
                  {[
                    { href: '/', label: 'Inicio', icon: '🏠' },
                    { href: '/menu', label: 'Nuestra Carta', icon: '📖' },
                    { href: '/reservas', label: 'Hacer Reserva', icon: '🗓️' },
                    { href: '/nosotros', label: 'Sobre Nosotros', icon: '👥' },
                  ].map((item, index) => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-white/20"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </span>
                        <span className="font-medium text-base sm:text-lg group-hover:text-amber-400 transition-colors duration-200">
                          {item.label}
                        </span>
                      </div>
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500 group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Separador elegante */}
                <div className="relative mb-4 sm:mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-900 px-4 text-amber-400 text-sm">🛍️</span>
                  </div>
                </div>

                {/* Carrito móvil */}
                <button
                  onClick={() => {
                    toggleCart()
                    setIsMenuOpen(false)
                  }}
                  className="flex justify-between items-center w-full p-3 sm:p-4 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 mb-3 sm:mb-4 group border border-white/10 hover:border-amber-400/30"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <svg className="w-5 sm:w-6 h-5 sm:h-6 group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z" />
                    </svg>
                    <span className="font-medium text-base sm:text-lg group-hover:text-amber-400 transition-colors duration-200">Mi Carrito</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-full h-6 sm:h-7 w-6 sm:w-7 flex items-center justify-center font-bold shadow-lg">
                      {itemCount > 99 ? '99' : itemCount}
                    </span>
                  )}
                </button>

                {/* Botones CTA móvil */}
                <div className="space-y-3 mb-4 sm:mb-5">
                  <Link 
                    href="/pedido" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-center text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-amber-500/30 flex items-center justify-center space-x-3 hover:scale-105"
                  >
                    <span>🚀</span>
                    <span>Ordenar Ahora</span>
                  </Link>
                </div>

                {/* Login móvil */}
                <div className="md:hidden">
                  <LoginButton isMobile={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ESPACIADOR PARA CONTENIDO - No necesario con sticky */}

      {/* Modal del carrito */}
      <CartModal />
    </>
  )
}