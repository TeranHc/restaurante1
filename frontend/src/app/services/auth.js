// src/services/auth.js
import { createClient } from '@supabase/supabase-js'

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Función genérica para llamar a tu backend
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }

  // Agregar token si existe (solo en el cliente)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(url, config)
  
  // Manejar respuestas no JSON (como errores 500, 404, etc)
  let data
  try {
    data = await response.json()
  } catch (error) {
    throw new Error(`Error del servidor: ${response.status}`)
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Error en la petición')
  }

  return data
}

export const authService = {
  // Registrar usuario en Supabase
  register: async (userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            // Metadatos adicionales si los necesitas
            nombre: userData.nombre,
            telefono: userData.telefono,
          }
        }
      })

      if (error) throw error

      const token = data.session?.access_token
      const user = data.user

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      // Opcional: Crear perfil adicional en tu backend
      if (userData.datosAdicionales) {
        try {
          await apiRequest('/auth/create-profile', {
            method: 'POST',
            body: JSON.stringify({
              supabaseId: user.id,
              ...userData.datosAdicionales
            })
          })
        } catch (profileError) {
          console.warn('Error creando perfil adicional:', profileError)
        }
      }

      return { token, user }
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  },

  // Login con Supabase
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const token = data.session?.access_token
      const user = data.user

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      return { token, user }
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  },

  // Logout en Supabase
  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  },

  // Reset password mejorado
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      // Por seguridad, no revelamos si el email existe o no
      if (error && !error.message.includes('rate limit')) {
        console.warn('Reset password error:', error)
      }

      return { success: true, message: 'Si el email existe, recibirás un enlace para resetear tu contraseña' }
    } catch (error) {
      console.error('Error en reset password:', error)
      throw error
    }
  },

  // Confirmar nuevo password
  updatePassword: async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error actualizando contraseña:', error)
      throw error
    }
  },

  // Obtener perfil desde tu backend (si quieres datos extra)
  getProfile: async () => {
    try {
      return await apiRequest('/auth/profile')
    } catch (error) {
      console.error('Error obteniendo perfil:', error)
      throw error
    }
  },

  // Verificar token en backend
  verifyToken: async () => {
    try {
      return await apiRequest('/auth/verify-token')
    } catch (error) {
      console.error('Error verificando token:', error)
      throw error
    }
  },

  // Actualizar perfil en backend
  updateProfile: async (profileData) => {
    try {
      return await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      throw error
    }
  },

  // Obtener usuario actual desde localStorage
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null
    
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  },

  // Obtener token desde localStorage
  getToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Obtener sesión actual de Supabase
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error obteniendo sesión:', error)
      return null
    }
  },

  // Refrescar token automáticamente
  refreshToken: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      const token = data.session?.access_token
      const user = data.session?.user

      if (token && typeof window !== 'undefined') {
        localStorage.setItem('authToken', token)
        localStorage.setItem('user', JSON.stringify(user))
      }

      return { token, user }
    } catch (error) {
      console.error('Error refrescando token:', error)
      // Si falla el refresh, hacer logout
      await this.logout()
      throw error
    }
  },

  // Listener para cambios de autenticación
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (typeof window !== 'undefined') {
        if (session) {
          localStorage.setItem('authToken', session.access_token)
          localStorage.setItem('user', JSON.stringify(session.user))
        } else {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
      }
      
      callback(event, session)
    })
  }
}

// Hook personalizado para usar en componentes React (opcional)
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const session = await authService.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, isAuthenticated: !!user }
}