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
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl relative ">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
          <div className="absolute top-4 right-4 w-32 h-32 bg-amber-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-amber-400/10 rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
          <div className="flex items-center justify-between">

            {/* IZQUIERDA: Logo */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl shadow-lg">
                  <span className="text-white text-2xl">🍷</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent leading-none">
                  Bella Vista
                </h1>
                <p className="text-amber-200/80 text-xs font-medium mt-1">
                  Cocina Gourmet • Experiencia Única
                </p>
              </div>
            </div>

            {/* CENTRO: Navegación (solo desktop) */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
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
                  className="text-gray-300 hover:text-amber-400 font-medium transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* DERECHA: Acciones */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Botón del carrito actualizado */}
              <button
                onClick={toggleCart}
                className="relative group"
              >
                <div className="flex items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition">
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                  <span className="ml-2 text-sm">Carrito</span>
                </div>
              </button>

              <Link href="/pedido" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Ordenar Ahora
              </Link>

              <Link href="/reservas" className="border border-amber-400 text-amber-400 px-4 py-2 rounded-lg hover:bg-amber-400 hover:text-slate-900 text-sm font-medium">
                Reservar Mesa
              </Link>

              <LoginButton />
            </div>

            {/* Botón menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden ml-4 flex flex-col justify-center items-center w-8 h-8 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <span className={`h-0.5 w-5 bg-white transition ${isMenuOpen ? 'rotate-45 translate-y-1' : 'mb-1'}`}></span>
              <span className={`h-0.5 w-5 bg-white transition ${isMenuOpen ? 'opacity-0' : 'mb-1'}`}></span>
              <span className={`h-0.5 w-5 bg-white transition ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </button>

          </div>

          {/* Menú móvil */}
          <div className={`lg:hidden transition-all duration-500 overflow-hidden ${isMenuOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
              {[
                { href: '/', label: 'Inicio', icon: '🏠' },
                { href: '/menu', label: 'Carta', icon: '📋' },
                { href: '/reservas', label: 'Reservas', icon: '🗓️' },
                { href: '/eventos', label: 'Eventos', icon: '🎉' },
                { href: '/nosotros', label: 'Historia', icon: '📖' },
                { href: '/contacto', label: 'Contacto', icon: '📞' }
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center space-x-3 text-gray-300 hover:text-amber-400">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-white/10 pt-4 space-y-2">
                <button
                  onClick={toggleCart}
                  className="flex justify-between items-center text-sm text-gray-300 hover:text-amber-400 w-full text-left"
                >
                  Carrito
                  {itemCount > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/pedido" className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-2 rounded-lg text-center text-xs font-medium">
                    Ordenar
                  </Link>
                  <Link href="/reservas" className="border border-amber-400 text-amber-400 px-2 py-2 rounded-lg text-center text-xs font-medium hover:bg-amber-400 hover:text-slate-900">
                    Reservar
                  </Link>
                </div>

                <LoginButton isMobile={true} />
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