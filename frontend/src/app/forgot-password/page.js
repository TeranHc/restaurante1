'use client'

import { useState } from 'react'

export default function BellaVistaForgotPassword() {
  const [formData, setFormData] = useState({
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular respuesta exitosa
      console.log('Email de recuperación enviado a:', formData.email)
      setIsEmailSent(true)
      
    } catch (error) {
      console.error('Error al enviar email:', error)
      setErrors({ 
        general: 'Error de conexión. Por favor intenta nuevamente.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    // En una app real, esto sería un router.push('/login')
    console.log('Regresando al login')
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Email reenviado')
    } catch (error) {
      console.error('Error al reenviar email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Fondo decorativo - Optimizado para móvil */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="absolute top-10 right-10 sm:top-20 sm:right-20 w-32 h-32 sm:w-64 sm:h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 sm:bottom-20 sm:left-20 w-24 h-24 sm:w-48 sm:h-48 bg-amber-400/10 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-amber-300/5 rounded-full blur-3xl"></div>
      </div>

      {/* Partículas flotantes - Reducidas en móvil */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-1 h-1 bg-amber-400/30 rounded-full"></div>
          </div>
        ))}
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

        {/* Formulario de recuperación */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/20 shadow-2xl">
          
          {!isEmailSent ? (
            <>
              {/* Encabezado */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="bg-amber-500/20 p-3 sm:p-4 rounded-full">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-gray-300 text-xs sm:text-sm">
                  No te preocupes, te enviaremos un enlace para recuperarla
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 sm:mb-6">
                  <p className="text-red-200 text-xs sm:text-sm text-center">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
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

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl text-sm sm:text-base active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Enviar Enlace de Recuperación
                    </div>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Pantalla de confirmación */
            <div className="text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="bg-green-500/20 p-4 sm:p-6 rounded-full">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">¡Email Enviado!</h2>
              <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6">
                Te hemos enviado un enlace para recuperar tu contraseña a <span className="text-amber-400 font-medium">{formData.email}</span>
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                Revisa tu bandeja de entrada y sigue las instrucciones. Si no encuentras el email, revisa tu carpeta de spam.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reenviando...
                    </div>
                  ) : (
                    'Reenviar Email'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="my-4 sm:my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white/10 text-gray-300">o</span>
              </div>
            </div>
          </div>

          {/* Volver al login */}
          <div className="text-center">
            <button
              onClick={handleBackToLogin}
              className="inline-flex items-center text-amber-400 hover:text-amber-300 font-medium transition-colors text-xs sm:text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <a href="/login" className="text-xs sm:text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    Volver al Login
              </a>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}