'use client'
import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Estado inicial del carrito
const initialState = {
  items: [],
  isOpen: false,
  total: 0,
  isLoading: false,
  error: null
}

// Tipos de acciones
const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  SET_CART_OPEN: 'SET_CART_OPEN',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_ITEMS: 'SET_ITEMS'
}

// Reducer para manejar el estado del carrito
function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ITEMS: {
      return {
        ...state,
        items: action.payload || []
      }
    }

    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload
      }
    }

    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      }
    }

    case ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        return {
          ...state,
          items: updatedItems
        }
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        }
      }
    }

    case ACTIONS.REMOVE_ITEM: {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: updatedItems
      }
    }

    case ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { type: ACTIONS.REMOVE_ITEM, payload: id })
      }
      
      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      
      return {
        ...state,
        items: updatedItems
      }
    }

    case ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      }
    }

    case ACTIONS.TOGGLE_CART: {
      return {
        ...state,
        isOpen: !state.isOpen
      }
    }

    case ACTIONS.SET_CART_OPEN: {
      return {
        ...state,
        isOpen: action.payload
      }
    }

    default:
      return state
  }
}

// Helper mejorado para obtener el token de autenticación
const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('adminToken')
  
  const sessionToken = sessionStorage.getItem('authToken') || 
                       sessionStorage.getItem('token') || 
                       sessionStorage.getItem('adminToken')
  
  const finalToken = token || sessionToken
  
  console.log('🔍 Token check:', {
    hasLocalToken: !!token,
    hasSessionToken: !!sessionToken,
    finalToken: finalToken ? `${finalToken.substring(0, 20)}...` : null,
    searchedKeys: ['token', 'authToken', 'adminToken']
  })
  
  return finalToken
}

// Helper para verificar si el usuario está autenticado
const isUserAuthenticated = () => {
  if (typeof window === 'undefined') return false
  
  const token = getAuthToken()
  
  console.log('🔐 Auth check:', {
    hasToken: !!token,
    isAuthenticated: !!token
  })
  
  return !!token
}

// Helper para hacer peticiones a la API
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  if (!token) {
    throw new Error('No hay token de autenticación disponible')
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  }

  try {
    console.log(`📡 API Request: ${endpoint}`, {
      method: config.method || 'GET',
      hasAuth: !!config.headers.Authorization
    })
    
    const response = await fetch(`http://localhost:3001/api${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`❌ API Error [${endpoint}]:`, error)
    throw error
  }
}

// Crear el contexto
const CartContext = createContext()

// Hook para usar el contexto
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
}

// Provider del contexto
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [authLoading, setAuthLoading] = React.useState(true)

  // Calcular el total cada vez que cambian los items
  const total = state.items.reduce((sum, item) => {
    return sum + (item.precio * item.quantity)
  }, 0)

  // Calcular la cantidad total de productos
  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0)

  // Verificar estado de autenticación
  const checkAuthStatus = () => {
    const authenticated = isUserAuthenticated()
    console.log('🔄 Checking auth status:', authenticated)
    setIsAuthenticated(authenticated)
    setAuthLoading(false)
  }

  // Función temporal para debugging
  const forceAuthRecheck = () => {
    console.log('🔄 FORCING AUTH RECHECK...')
    const wasAuthenticated = isAuthenticated
    checkAuthStatus()
    console.log('Auth changed from', wasAuthenticated, 'to', isAuthenticated)
  }

  // Cargar carrito desde BD al iniciar
  const loadCartFromDB = async () => {
    if (!isAuthenticated || authLoading) {
      console.log('⏸️ Skipping cart load - not authenticated or still loading')
      return
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      console.log('🛒 Loading cart from database...')
      const cartData = await apiRequest('/cart')
      
      // Transformar datos con estructura consistente
      const transformedItems = cartData.map(item => {
        console.log('🔍 Processing cart item:', item)
        
        return {
          id: item.productos.id,              
          cartItemId: item.id,                
          nombre: item.productos.nombre,
          descripcion: item.productos.descripcion,
          precio: item.productos.precio,
          imagen: item.productos.imagen,
          quantity: item.quantity,
          product_id: item.product_id,        
          disponible: item.productos.disponible
        }
      })

      console.log('🔍 Transformed items:', transformedItems)
      dispatch({ type: ACTIONS.SET_ITEMS, payload: transformedItems })
      console.log('✅ Cart loaded successfully:', transformedItems.length, 'items')
    } catch (error) {
      console.error('❌ Error loading cart:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Agregar producto al carrito (BD + Estado local)
  const addItem = async (product) => {
    console.log('=== DEBUG addItem ===')
    console.log('🎯 Adding item to cart:', {
      productId: product.id,
      productName: product.nombre,
      isAuthenticated,
      authLoading
    })

    const token = getAuthToken()
    const userAuth = isUserAuthenticated()
    
    console.log('🔍 DETAILED AUTH CHECK:')
    console.log('- getAuthToken():', token ? `${token.substring(0, 20)}...` : 'NULL')
    console.log('- isUserAuthenticated():', userAuth)
    console.log('- isAuthenticated state:', isAuthenticated)
    console.log('- authLoading state:', authLoading)

    if (!isAuthenticated) {
      const errorMsg = 'Debes iniciar sesión para agregar productos al carrito'
      console.error('❌', errorMsg)
      dispatch({ type: ACTIONS.SET_ERROR, payload: errorMsg })
      return
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      console.log('📦 Sending to API...')
      // Enviar a BD
      const response = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({
          product_id: product.originalId || product.id,
          quantity: 1
        })
      })

      console.log('🔍 API Response:', response)

      // Recargar carrito completo desde BD después de agregar
      await loadCartFromDB()
      
      console.log(`✅ Producto "${product.nombre}" agregado al carrito`)
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Actualizar cantidad de producto
  const updateQuantity = async (productId, quantity) => {
    console.log('=== DEBUG updateQuantity ===')
    console.log('🔍 Input:', { productId, quantity })
    console.log('🔍 Current items:', state.items)
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated')
      return
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      const item = state.items.find(item => item.id === productId)
      console.log('🔍 Found item:', item)
      
      if (!item) {
        console.error('❌ Item not found in cart:', productId)
        throw new Error('Producto no encontrado en el carrito')
      }

      if (!item.cartItemId) {
        console.error('❌ Item missing cartItemId:', item)
        throw new Error('Item del carrito sin ID válido')
      }

      if (quantity <= 0) {
        await removeItem(productId)
        return
      }

      console.log(`📝 Actualizando item carrito ID: ${item.cartItemId} con cantidad: ${quantity}`)

      await apiRequest(`/cart/${item.cartItemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      })

      // Actualizar estado local
      dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } })
      
      console.log('✅ Quantity updated successfully')
      
    } catch (error) {
      console.error('Error updating quantity:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      
      console.log('🔄 Reloading cart due to error...')
      await loadCartFromDB()
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Eliminar producto del carrito
  const removeItem = async (productId) => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      const item = state.items.find(item => item.id === productId)
      if (!item) {
        console.error('Item not found for removal:', productId)
        return
      }

      if (!item.cartItemId) {
        console.error('Item missing cartItemId for removal:', item)
        throw new Error('Item del carrito sin ID válido')
      }

      await apiRequest(`/cart/${item.cartItemId}`, {
        method: 'DELETE'
      })

      // Actualizar estado local
      dispatch({ type: ACTIONS.REMOVE_ITEM, payload: productId })
      
      console.log('✅ Product removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      await loadCartFromDB()
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Limpiar todo el carrito
  const clearCart = async () => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      // Limpiar BD
      await apiRequest('/cart', {
        method: 'DELETE'
      })

      // Limpiar estado local
      dispatch({ type: ACTIONS.CLEAR_CART })
      
      console.log('✅ Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // 🔥 CORRECCIÓN CRÍTICA: Usar la función correcta del backend que limpia el carrito
  const createOrder = async (orderData = {}) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para realizar un pedido')
    }

    if (state.items.length === 0) {
      throw new Error('El carrito está vacío')
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: ACTIONS.SET_ERROR, payload: null })

      console.log('📝 Creating order with data:', orderData)
      console.log('🛒 Current cart items:', state.items.length)

      // 🔥 CAMBIO CRÍTICO: Usar el endpoint correcto que limpia el carrito
      const pedido = await apiRequest('/pedidos/limpiar-carrito', {
        method: 'POST',
        body: JSON.stringify({
          tipo_entrega: orderData.tipo_entrega || 'delivery',
          direccion_entrega: orderData.direccion_entrega,
          telefono_contacto: orderData.telefono_contacto,
          notas: orderData.notas,
          metodo_pago: orderData.metodo_pago || 'efectivo'
        })
      })

      console.log('🔍 Order response:', pedido)

      // ✅ LIMPIAR CARRITO LOCAL inmediatamente
      if (pedido && pedido.id) {
        console.log('🧹 Clearing local cart state...')
        
        // Limpiar estado local del carrito
        dispatch({ type: ACTIONS.CLEAR_CART })
        
        console.log('✅ Local cart cleared')
        
        // Verificar limpieza en BD recargando carrito
        try {
          await loadCartFromDB()
          console.log('🔄 Cart reloaded from database to verify cleanup')
        } catch (reloadError) {
          console.warn('⚠️ Could not reload cart from DB:', reloadError.message)
        }
      }
      
      console.log('✅ Order created and cart cleared:', pedido.order_number)
      return pedido

    } catch (error) {
      console.error('❌ Error creating order:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      throw error
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Funciones para manejar UI
  const toggleCart = () => {
    dispatch({ type: ACTIONS.TOGGLE_CART })
  }

  const setCartOpen = (isOpen) => {
    dispatch({ type: ACTIONS.SET_CART_OPEN, payload: isOpen })
  }

  const clearError = () => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null })
  }

  // Efecto para verificar autenticación al montar
  useEffect(() => {
    checkAuthStatus()

    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user') {
        console.log('📱 Storage changed, rechecking auth...')
        checkAuthStatus()
      }
    }

    const handleAuthChange = () => {
      console.log('🔄 Auth event detected, rechecking...')
      checkAuthStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authStateChanged', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  // Cargar/limpiar carrito cuando cambie el estado de autenticación
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('✅ User authenticated, loading cart...')
      loadCartFromDB()
    } else if (!isAuthenticated && !authLoading) {
      console.log('🧹 User not authenticated, clearing cart...')
      dispatch({ type: ACTIONS.SET_ITEMS, payload: [] })
    }
  }, [isAuthenticated, authLoading])

  const value = {
    // Estado
    items: state.items,
    isOpen: state.isOpen,
    total,
    itemCount,
    isLoading: state.isLoading || authLoading,
    error: state.error,
    isAuthenticated,
    
    // Funciones del carrito
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    createOrder,
    
    // Funciones UI
    toggleCart,
    setCartOpen,
    clearError,
    
    // Utilidades
    loadCartFromDB,
    checkAuthStatus,
    forceAuthRecheck
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}