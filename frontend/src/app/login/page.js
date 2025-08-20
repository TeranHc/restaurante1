'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BellaVistaLogin() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido'
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // FUNCIÓN CORREGIDA PARA GOOGLE OAUTH
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('Iniciando Google OAuth...');
      
      // CORRECCIÓN: Hacer GET request (no POST) y no enviar formData
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
        // NO enviar body con formData
      });

      const data = await response.json();
      console.log('Respuesta del backend:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener URL de autenticación');
      }

      console.log('Redirigiendo a Google OAuth:', data.authUrl);
      
      // Redirigir a Google OAuth
      window.location.href = data.authUrl;

    } catch (err) {
      console.error('Error iniciando sesión con Google:', err);
      setErrors({ 
        general: `Error al iniciar sesión con Google: ${err.message}` 
      });
      setIsGoogleLoading(false);
    }
    // No pongas setIsGoogleLoading(false) aquí porque la página se redirigirá
  };

  // Login tradicional con email/password - Sin cambios
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        throw new Error(`Respuesta inválida del servidor: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión')
      }

      // Guardar datos en localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('refresh_token', data.refresh_token)
      localStorage.setItem('userRole', data.user?.role || 'CLIENT')
      localStorage.setItem('userName', data.user?.firstName || '')
      localStorage.setItem('userLastName', data.user?.lastName || '')
      localStorage.setItem('userEmail', data.user?.email || '')
      localStorage.setItem('userId', data.user?.id || '')
      localStorage.setItem('userPhone', data.user?.phone || '')

      console.log('Login exitoso:', {
        userId: data.user?.id,
        email: data.user?.email,
        role: data.user?.role,
        name: `${data.user?.firstName} ${data.user?.lastName}`.trim()
      })

      // Redireccionar según rol
      if (data.user?.role === 'ADMIN') {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/'
      }

    } catch (error) {
      console.error('Error en login:', error)
      setErrors({ general: error.message || 'Error en el inicio de sesión' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-1 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Fondo decorativo - Optimizado para móvil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-32 h-32 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-24 h-24 sm:w-48 sm:h-48 bg-amber-400/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-amber-300/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Logo y título - Optimizado para móvil */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl">
                <span className="text-white text-2xl sm:text-4xl">🍷</span>
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent mb-1 sm:mb-2">
            Bella Vista
          </h1>
          <p className="text-amber-200/80 text-xs sm:text-sm font-medium">
            Cocina Gourmet • Experiencia Única
          </p>
        </div>

        {/* Formulario de login - Optimizado para móvil */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">¡Bienvenido de vuelta!</h2>
            <p className="text-gray-300 text-xs sm:text-sm">Inicia sesión en tu cuenta</p>
          </div>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 sm:mb-6">
              <p className="text-red-200 text-xs sm:text-sm text-center">{errors.general}</p>
            </div>
          )}

          {/* Botón de Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full mb-4 sm:mb-6 bg-white hover:bg-gray-50 text-gray-900 py-2.5 sm:py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base active:scale-95 flex items-center justify-center"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-900" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Conectando con Google...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white/10 text-gray-300">o continúa con email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 text-sm sm:text-base ${
                    errors.email ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300 text-sm sm:text-base ${
                    errors.password ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 hover:border-white/30'
                  }`}
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Recordar contraseña - Stack en móvil */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 focus:ring-amber-400/50 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="remember" className="ml-2 block text-xs sm:text-sm text-gray-300">
                  Recordar contraseña
                </label>
              </div>
              <Link href="/forgot-password" className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando Sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>



          {/* Registro */}
          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-300 text-xs sm:text-sm">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}