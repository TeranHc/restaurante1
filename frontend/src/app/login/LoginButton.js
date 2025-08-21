'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginButton({ isMobile = false }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      console.log('API_URL:', API_URL)
      console.log('Verificando token:', token)
      
      const response = await fetch(`${API_URL}/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Response data:', result)
        
        const userData = result.user || result.data || result
        
        console.log('User data:', userData)
        setUser(userData)
        
        if (userData) {
          localStorage.setItem('userRole', userData.role || '')
          localStorage.setItem('userName', userData.firstName || userData.name || '')
          localStorage.setItem('userEmail', userData.email || '')
        }
      } else {
        console.error('Token verification failed:', response.status)
        clearLocalStorage()
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      const fallbackUser = {
        firstName: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
      }
      
      if (fallbackUser.firstName) {
        console.log('Using fallback user data:', fallbackUser)
        setUser(fallbackUser)
      } else {
        clearLocalStorage()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setUser(null)
  }

  const handleLogout = () => {
    clearLocalStorage()
    setIsDropdownOpen(false)
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-pulse bg-white/10 rounded-lg px-4 py-2">
          <div className="h-4 bg-white/20 rounded w-20"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={`${
          isMobile 
            ? 'w-full bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 text-white px-6 py-4 rounded-xl text-center text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 border border-white/20 hover:border-white/30 shadow-lg backdrop-blur-sm'
            : 'bg-gradient-to-r from-slate-700/60 to-slate-600/60 hover:from-slate-600/80 hover:to-slate-500/80 text-white px-6 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center space-x-2 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105'
        }`}
      >
        <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Iniciar Sesión</span>
        {!isMobile && (
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </Link>
    )
  }

  if (isMobile) {
    return (
      <div className="w-full space-y-2 border-t border-white/10 pt-2">
        <div className="text-center py-2">
          <p className="text-white font-medium text-sm">{user.firstName || user.name || 'Usuario'}</p>
          <p className="text-gray-300 text-xs">{user.email || 'Sin email'}</p>
          <span className="inline-block bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs font-medium mt-1">
            {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        
        <Link href="/profile" className="block w-full text-left text-gray-300 hover:text-white text-sm py-2 px-2 rounded hover:bg-white/10 transition">
          👤 Mi Perfil
        </Link>
        
        {user.role === 'ADMIN' && (
          <Link href="/admin/dashboard" className="block w-full text-left text-gray-300 hover:text-white text-sm py-2 px-2 rounded hover:bg-white/10 transition">
            ⚙️ Panel de Administración
          </Link>
        )}
        
        <button
          onClick={handleLogout}
          className="block w-full text-left text-red-300 hover:text-red-200 text-sm py-2 px-2 rounded hover:bg-red-500/10 transition"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    )
  }

  // VERSIÓN DESKTOP CON DROPDOWN RESPONSIVE
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="group flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-2 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300"
      >
        <div className="w-5 h-5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {(user.firstName || user.name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-amber-400 transition-colors">
          {user.firstName || user.name || 'Usuario'}
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

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 
                        w-64 sm:w-72 md:w-80 
                        max-w-[90vw] 
                        bg-gray-800 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl z-50 ring-1 ring-black/5
                        transform origin-top-right
                        sm:right-0 
                        -right-4 sm:-right-0">
          
          {/* Header del dropdown */}
          <div className="p-4 border-b border-gray-700/50">
            <p className="text-sm font-medium text-white truncate">{user.firstName || user.name || 'Usuario'}</p>
            <p className="text-xs text-gray-300 truncate">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded">
                {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
              </span>
            )}
          </div>
          
          {/* Opciones del dropdown */}
          <div className="p-2">
            <Link
              href="/profile"
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-amber-400 transition-colors rounded-md"
              onClick={() => setIsDropdownOpen(false)}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">Mi Perfil</span>
            </Link>

            {/* Opción de admin solo si es admin */}
            {user.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700/50 hover:text-amber-400 transition-colors rounded-md"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Panel de Admin</span>
              </Link>
            )}
            
            {/* Separador */}
            <div className="my-2 border-t border-gray-700/50"></div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-md w-full"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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