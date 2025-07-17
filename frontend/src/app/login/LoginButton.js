'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginButton() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const userName = localStorage.getItem('userName')
        const userEmail = localStorage.getItem('userEmail')
        const userRole = localStorage.getItem('userRole')
        
        if (token && userName && userEmail && userRole) {
          // Verificar token con el backend
          const response = await fetch('http://localhost:3001/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Token inválido, usar datos del localStorage como respaldo
            setUser({
              name: userName,
              email: userEmail,
              role: userRole
            })
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        // En caso de error, usar datos del localStorage si existen
        const userName = localStorage.getItem('userName')
        const userEmail = localStorage.getItem('userEmail')
        const userRole = localStorage.getItem('userRole')
        
        if (userName && userEmail && userRole) {
          setUser({
            name: userName,
            email: userEmail,
            role: userRole
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    setUser(null)
    setIsDropdownOpen(false)
    router.push('/')
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-2">
        <div className="animate-spin w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full"></div>
        <span className="text-sm font-medium text-gray-300">Cargando...</span>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar botón de login
  if (!user) {
    return (
      <Link href="/login" className="group">
        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-2 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300">
          <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">
            Iniciar Sesión
          </span>
        </div>
      </Link>
    )
  }

  // Si hay usuario autenticado, mostrar dropdown con su nombre
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-2 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
      >
        <div className="w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">
          {user.name || 'Usuario'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Mejorado para funcionar en fondos claros y oscuros */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl z-50 ring-1 ring-black/5">
          <div className="p-4 border-b border-gray-700/50">
            <p className="text-sm font-medium text-white">{user.name || 'Usuario'}</p>
            <p className="text-xs text-gray-300">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">
                {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </span>
            )}
          </div>
          
          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-amber-400 transition-colors rounded-md"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">Mi Perfil</span>
            </Link>
            
            {user.role === 'ADMIN' && (
              <Link
                href="/productos"
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-amber-400 transition-colors rounded-md"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm">Panel de Administración</span>
              </Link>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-md w-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}