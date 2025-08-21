'use client'
import { useCart } from './CartContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CheckoutModal from './CheckoutModal'

export default function CartModal() {
  const { 
    items, 
    isOpen, 
    total, 
    itemCount, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    setCartOpen,
    isLoading: cartLoading,
    error: cartError,
    clearError
  } = useCart()
  
  // Estados para controlar los modales
  const [showCheckout, setShowCheckout] = useState(false)
  const [localTotal, setLocalTotal] = useState(0)

  // Calcular total localmente como respaldo
  useEffect(() => {
    const calculateTotal = () => {
      return items.reduce((sum, item) => {
        const itemPrice = item.precio || 0
        const quantity = item.quantity || 0
        return sum + (itemPrice * quantity)
      }, 0)
    }
    
    setLocalTotal(calculateTotal())
  }, [items])

  if (!isOpen) return null

  const handleQuantityChange = async (itemIdentifier, newQuantity) => {
    if (newQuantity < 0) return
    
    console.log('🔄 Cambiando cantidad:', { itemIdentifier, newQuantity, currentItems: items.length })
    
    // Si la nueva cantidad es 0, remover el item
    if (newQuantity === 0) {
      console.log('🗑️ Removiendo item con cantidad 0')
      await removeItem(itemIdentifier)
      return
    }
    
    try {
      // Actualizar cantidad
      console.log('➕ Actualizando cantidad:', itemIdentifier, 'a', newQuantity)
      await updateQuantity(itemIdentifier, newQuantity)
      console.log('✅ Cantidad actualizada exitosamente')
    } catch (error) {
      console.error('❌ Error actualizando cantidad:', error)
    }
  }

  const handleProceedToCheckout = () => {
    setShowCheckout(true)
  }

  const handleBackFromCheckout = () => {
    setShowCheckout(false)
  }

  const handleCloseCart = () => {
    setCartOpen(false)
    setShowCheckout(false)
  }

  const handleClearCart = async () => {
    if (confirm('¿Estás seguro que deseas vaciar el carrito?')) {
      await clearCart()
    }
  }

  // Usar el total del contexto, pero como respaldo usar el total local
  const displayTotal = total || localTotal

  return (
    <>
      {/* Modal del Carrito */}
      {!showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Tu Carrito</h2>
                    <p className="text-amber-200 text-sm">{itemCount} producto{itemCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCart}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {cartError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{cartError}</p>
                    <button
                      onClick={clearError}
                      className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {cartLoading && (
              <div className="p-6 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Cargando carrito...</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {items.length === 0 && !cartLoading ? (
                // Carrito vacío
                <div className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600 mb-6">Agrega algunos deliciosos platos a tu carrito</p>
                  <Link
                    href="/menu"
                    onClick={handleCloseCart}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition"
                  >
                    <span>Ver Carta</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              ) : (
                // Lista de productos
                <div className="p-6">
                  <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                    {items.map((item) => {
                      // Usar cartItemId si existe, sino usar id
                      const itemIdentifier = item.cartItemId || item.id
                      
                      return (
                        <div key={itemIdentifier} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          {/* Imagen del producto */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.imagen ? (
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{item.nombre}</h4>
                            <p className="text-sm text-gray-600 truncate">{item.descripcion}</p>
                            
                            {/* Debug info */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="text-xs text-blue-600 mt-1">
                                ID: {itemIdentifier} | Cantidad: {item.quantity} | Precio: ${item.precio}
                              </div>
                            )}
                            
                            {/* Mostrar opciones seleccionadas */}
                            {item.selected_options && item.selected_options.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {item.selected_options.map((option, index) => (
                                  <div key={index} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded inline-block mr-1">
                                    {option.option_type}: {option.option_value}
                                    {option.extra_price > 0 && ` (+${option.extra_price.toFixed(2)})`}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Mostrar desglose de precios */}
                            <div className="mt-1">
                              {item.precio_opciones && item.precio_opciones > 0 ? (
                                <div className="text-sm">
                                  <span className="text-gray-600">Base: ${item.precio_base?.toFixed(2)}</span>
                                  <span className="text-amber-600 ml-2">+ Extras: ${item.precio_opciones?.toFixed(2)}</span>
                                  <div className="text-amber-600 font-bold">
                                    Total: ${item.precio?.toFixed(2)} x {item.quantity} = ${(item.precio * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-amber-600 font-bold">
                                  ${item.precio?.toFixed(2)} x {item.quantity} = ${(item.precio * item.quantity).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                console.log('🔘 Botón - clicked:', itemIdentifier, 'cantidad actual:', item.quantity)
                                handleQuantityChange(itemIdentifier, item.quantity - 1)
                              }}
                              disabled={cartLoading || item.quantity <= 1}
                              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-full flex items-center justify-center transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                              </svg>
                            </button>
                            
                            {/* Campo de entrada manual para debug */}
                            <div className="flex flex-col items-center">
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              {process.env.NODE_ENV === 'development' && (
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQty = parseInt(e.target.value) || 1
                                    handleQuantityChange(itemIdentifier, newQty)
                                  }}
                                  className="w-12 text-xs text-center border rounded mt-1"
                                  min="1"
                                />
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                console.log('🔘 Botón + clicked:', itemIdentifier, 'cantidad actual:', item.quantity)
                                handleQuantityChange(itemIdentifier, item.quantity + 1)
                              }}
                              disabled={cartLoading}
                              className="w-8 h-8 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => {
                              console.log('🗑️ Eliminando item:', itemIdentifier)
                              removeItem(itemIdentifier)
                            }}
                            disabled={cartLoading}
                            className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-lg transition"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total y acciones */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-amber-600">
                        ${displayTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Debug info - remover en producción */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-2 bg-blue-50 rounded text-xs">
                        <div>Context Total: ${total?.toFixed(2) || '0.00'}</div>
                        <div>Local Total: ${localTotal.toFixed(2)}</div>
                        <div>Items: {items.length}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleClearCart}
                        disabled={cartLoading}
                        className="border border-red-300 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium transition"
                      >
                        Vaciar Carrito
                      </button>
                      
                      <button
                        onClick={handleProceedToCheckout}
                        disabled={cartLoading || items.length === 0}
                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2"
                      >
                        <span>Continuar</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      <CheckoutModal 
        isOpen={showCheckout}
        onClose={handleCloseCart}
        onBack={handleBackFromCheckout}
      />
    </>
  )
}