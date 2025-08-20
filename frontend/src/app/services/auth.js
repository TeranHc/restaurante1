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

  // Agregar token si existe
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición')
  }

  return data
}

// src/services/auth.js (añadir dentro de authService)
resetPassword: async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://tuapp.com/nueva-contrasena'
  })

  // No mostrar error de "usuario no encontrado" por seguridad
  if (error && error.message !== 'Usuario no encontrado') throw error

  return data
}


export const authService = {
  // Registrar usuario en Supabase
  register: async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    })

    if (error) throw error

    const token = data.session?.access_token
    const user = data.user

    if (token) {
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
    }

    return { token, user }
  },

  // Login con Supabase
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    const token = data.session?.access_token
    const user = data.user

    if (token) {
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
    }

    return { token, user }
  },

  // Logout en Supabase
  logout: async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  },

  // Obtener perfil desde tu backend (si quieres datos extra)
  getProfile: async () => {
    return await apiRequest('/api/auth/profile')
  },

  // Verificar token en backend
  verifyToken: async () => {
    return await apiRequest('/api/auth/verify-token')
  },

  // Obtener usuario actual desde localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      return null
    }
  },

  // Obtener token desde localStorage
  getToken: () => localStorage.getItem('authToken'),

  // Verificar si está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },
}
