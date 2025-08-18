'use client'
import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Estado inicial del carrito
const initialState = {
  items: [],
  isOpen: false,
  total: 0
}

// Tipos de acciones
const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  SET_CART_OPEN: 'SET_CART_OPEN'
}

// Reducer para manejar el estado del carrito
function cartReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        // Si el producto ya existe, incrementa la cantidad
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
        // Si es un producto nuevo, lo agrega con cantidad 1
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
        // Si la cantidad es 0 o menor, elimina el producto
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

  // Calcular el total cada vez que cambian los items
  const total = state.items.reduce((sum, item) => {
    return sum + (item.precio * item.quantity)
  }, 0)

  // Calcular la cantidad total de productos
  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0)

  // Funciones para manejar el carrito
  const addItem = (product) => {
    dispatch({ type: ACTIONS.ADD_ITEM, payload: product })
  }

  const removeItem = (productId) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: productId })
  }

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id: productId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART })
  }

  const toggleCart = () => {
    dispatch({ type: ACTIONS.TOGGLE_CART })
  }

  const setCartOpen = (isOpen) => {
    dispatch({ type: ACTIONS.SET_CART_OPEN, payload: isOpen })
  }

  const value = {
    items: state.items,
    isOpen: state.isOpen,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}