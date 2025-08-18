'use client'
import { useCart } from './CartContext'
import { useState } from 'react'

export default function CheckoutModal({ isOpen, onClose, onBack }) {
  const { 
    items, 
    total, 
    itemCount,
    createOrder,
    setCartOpen,
    isLoading,
    error: cartError
  } = useCart()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)
  const [orderSuccess, setOrderSuccess] = useState(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipo_entrega: 'delivery',
    direccion_entrega: '',
    telefono_contacto: '',
    metodo_pago: 'efectivo',
    notas: ''
  })

  // Validación de campos requeridos
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {}
    
    if (formData.tipo_entrega === 'delivery' && !formData.direccion_entrega.trim()) {
      newErrors.direccion_entrega = 'La dirección es requerida para delivery'
    }
    
    if (!formData.telefono_contacto.trim()) {
      newErrors.telefono_contacto = 'El teléfono de contacto es requerido'
    } else if (formData.telefono_contacto.length < 10) {
      newErrors.telefono_contacto = 'El teléfono debe tener al menos 10 dígitos'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // 🔥 FUNCIÓN CORREGIDA para crear el pedido
  const handleSubmit = async () => {
    console.log('=== CHECKOUT SUBMIT ===')
    console.log('🛒 Items en carrito:', items.length)
    console.log('💰 Total:', total)
    console.log('📋 Form data:', formData)

    // Validar que hay items en el carrito
    if (!items || items.length === 0) {
      setCheckoutError('El carrito está vacío')
      return
    }

    // Validar formulario
    if (!validateForm()) {
      console.log('❌ Validation failed:', errors)
      return
    }
    
    setIsProcessing(true)
    setCheckoutError(null)
    setOrderSuccess(null)
    
    try {
      console.log('📝 Creando pedido con datos:', formData)
      
      // ✅ Crear pedido - esto automáticamente limpiará el carrito
      const pedido = await createOrder(formData)
      
      console.log('✅ Pedido creado exitosamente:', pedido)
      
      // Mostrar mensaje de éxito
      setOrderSuccess(`¡Pedido creado exitosamente! Número: ${pedido.order_number}`)
      
      // Cerrar modales después de un delay para que el usuario vea el mensaje
      setTimeout(() => {
        onClose()
        setCartOpen(false)
        
        // Reset form
        setFormData({
          tipo_entrega: 'delivery',
          direccion_entrega: '',
          telefono_contacto: '',
          metodo_pago: 'efectivo',
          notas: ''
        })
        setOrderSuccess(null)
      }, 3000) // 3 segundos para mostrar el mensaje de éxito
      
    } catch (error) {
      console.error('❌ Error en checkout:', error)
      setCheckoutError(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Mostrar mensaje de éxito
  if (orderSuccess) {
    return (
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">¡Pedido Creado!</h2>
            <p className="text-gray-600 text-sm">{orderSuccess}</p>
          </div>
          <p className="text-gray-500 text-sm">Cerrando automáticamente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Finalizar Pedido</h2>
                <p className="text-amber-200 text-sm">{itemCount} producto{itemCount !== 1 ? 's' : ''} - ${total.toFixed(2)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {(checkoutError || cartError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{checkoutError || cartError}</p>
                <button
                  onClick={() => {
                    setCheckoutError(null)
                    // Si hay un clearError en el contexto del carrito, usarlo también
                  }}
                  className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Resumen del pedido */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Resumen del Pedido</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.nombre}</span>
                  <span className="font-medium">${(item.precio * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between items-center font-bold">
              <span>Total:</span>
              <span className="text-lg text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario de datos del pedido */}
          <div className="space-y-6">
            {/* Tipo de entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrega *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo_entrega', 'delivery')}
                  className={`p-3 border-2 rounded-lg font-medium transition ${
                    formData.tipo_entrega === 'delivery'
                      ? 'border-amber-500 bg-amber-50 text-black-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>Delivery</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipo_entrega', 'pickup')}
                  className={`p-3 border-2 rounded-lg font-medium transition ${
                    formData.tipo_entrega === 'pickup'
                      ? 'border-amber-500 bg-amber-50 text-black-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Recoger</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dirección de entrega (solo si es delivery) */}
            {formData.tipo_entrega === 'delivery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de Entrega *
                </label>
                <textarea
                  value={formData.direccion_entrega}
                  onChange={(e) => handleInputChange('direccion_entrega', e.target.value)}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                    errors.direccion_entrega ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu dirección completa con referencias..."
                />
                {errors.direccion_entrega && (
                  <p className="text-red-600 text-sm mt-1">{errors.direccion_entrega}</p>
                )}
              </div>
            )}

            {/* Teléfono de contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de Contacto *
              </label>
              <input
                type="tel"
                value={formData.telefono_contacto}
                onChange={(e) => handleInputChange('telefono_contacto', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.telefono_contacto ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: 0999999999"
              />
              {errors.telefono_contacto && (
                <p className="text-red-600 text-sm mt-1">{errors.telefono_contacto}</p>
              )}
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.metodo_pago}
                onChange={(e) => handleInputChange('metodo_pago', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta de Débito/Crédito</option>
              </select>
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Instrucciones especiales, alergias, etc. (opcional)"
              />
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              disabled={isProcessing || isLoading}
              className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver al Carrito</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isProcessing || isLoading || items.length === 0}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2"
            >
              {(isProcessing || isLoading) ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Confirmar Pedido (${total.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}