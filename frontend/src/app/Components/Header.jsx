// src/components/Header.jsx
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(3) // Ejemplo de contador

  return (
    <header className="bg-white shadow-lg border-b-2 border-orange-500">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-full">
              <span className="text-white text-2xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Restaurante Delicioso</h1>
              <p className="text-sm text-gray-600">Sabores auténticos desde 1985</p>
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200">
              Inicio
            </Link>
            <Link href="/menu" className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200">
              Menú
            </Link>
            <Link href="/reservas" className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200">
              Reservas
            </Link>
            <Link href="/nosotros" className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200">
              Nosotros
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200">
              Contacto
            </Link>
          </nav>

          {/* Carrito y botón de pedido */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/carrito" className="relative text-gray-700 hover:text-orange-500 transition-colors duration-200">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/pedido" className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 font-medium">
              Hacer Pedido
            </Link>
          </div>

          {/* Botón menú móvil */}
          <button
            className="md:hidden flex flex-col space-y-1 w-6 h-6"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-full bg-gray-700 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>

        {/* Menú móvil */}
        <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <nav className="pt-4 pb-2 space-y-2">
            <Link href="/" className="block text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
              Inicio
            </Link>
            <Link href="/menu" className="block text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
              Menú
            </Link>
            <Link href="/reservas" className="block text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
              Reservas
            </Link>
            <Link href="/nosotros" className="block text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
              Nosotros
            </Link>
            <Link href="/contacto" className="block text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
              Contacto
            </Link>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Link href="/carrito" className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 py-2 px-4 rounded hover:bg-orange-50 transition-colors duration-200">
                <span className="text-xl">🛒</span>
                <span>Carrito ({cartCount})</span>
              </Link>
              <Link href="/pedido" className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors duration-200 text-sm">
                Hacer Pedido
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
