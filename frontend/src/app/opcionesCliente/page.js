'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '../Carrito/CartContext' // Ajusta la ruta según tu estructura

// Componente que contiene toda la lógica con useSearchParams
function ProductOptionsClientContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
const { addItem, toggleCart, forceAuthRecheck, isAuthenticated, isLoading } = useCart() // ✅ Agregar todas las funciones que necesitas  
  const productImage = searchParams.get('productImage')
  const productId = searchParams.get('productId')
  const productName = searchParams.get('productName')
  const basePrice = parseFloat(searchParams.get('basePrice') || '0')
  const productDescription = searchParams.get('productDescription') // Agregar descripción si está disponible
  
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({})
  const [precioTotal, setPrecioTotal] = useState(basePrice)
  const [addingToCart, setAddingToCart] = useState(false) // Estado para el botón de agregar

  // Crear objeto producto simple
  const producto = productId ? { id: productId, nombre: decodeURIComponent(productName || 'Producto') } : null

  useEffect(() => {
    if (!producto) {
      setError('No se especificó un producto válido')
      setLoading(false)
      return
    }

    const fetchOpciones = async () => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/product-options?product_id=${producto.id}`
    const res = await fetch(url)
    
    if (!res.ok) {
      if (res.status === 404) {
        setOpciones([])
        return
      }
      const errText = await res.text()
      throw new Error(`Error ${res.status}: ${errText || 'al cargar opciones'}`)
    }
    
    const data = await res.json()
    setOpciones(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('Error al cargar opciones:', err)
    setError(`No se pudieron cargar las opciones: ${err.message}`)
    setOpciones([])
  } finally {
    setLoading(false)
  }
}
    fetchOpciones()
  }, [producto])

  useEffect(() => {
    let total = basePrice
    Object.entries(opcionesSeleccionadas).forEach(([opcionId, cantidad]) => {
      const opcion = opciones.find(opt => opt.id.toString() === opcionId)
      if (opcion && cantidad > 0) {
        total += parseFloat(opcion.extra_price || 0) * cantidad
      }
    })
    setPrecioTotal(total)
  }, [opcionesSeleccionadas, opciones, basePrice])

  const cambiarCantidadOpcion = (opcionId, delta) => {
    setOpcionesSeleccionadas(prev => {
      const cantidadActual = prev[opcionId] || 0
      const nuevaCantidad = Math.max(0, cantidadActual + delta)

      if (nuevaCantidad === 0) {
        const updated = { ...prev }
        delete updated[opcionId]
        return updated
      }

      return {
        ...prev,
        [opcionId]: nuevaCantidad
      }
    })
  }

// Función para agregar al carrito con opciones personalizadas - VERSIÓN CORREGIDA
// VERSIÓN CON DEBUGGING COMPLETO - REEMPLAZA handleAddToCart
const handleAddToCart = async () => {
  if (!producto) return

  console.log('=== DEBUGGING COMPLETO ===')
  console.log('🎯 Producto original:', {
    id: producto.id,
    nombre: producto.nombre,
    type: typeof producto.id
  })
  
  console.log('💰 Precios:', {
    basePrice,
    precioTotal,
    basePriceType: typeof basePrice
  })

  console.log('📋 Opciones cargadas:', opciones.map(opt => ({
    id: opt.id,
    type: typeof opt.id,
    product_id: opt.product_id,
    option_type: opt.option_type,
    option_value: opt.option_value,
    extra_price: opt.extra_price
  })))

  console.log('✅ Opciones seleccionadas RAW:', opcionesSeleccionadas)

  // Verificar si tenemos acceso a forceAuthRecheck desde el contexto
  if (forceAuthRecheck) {
    console.log('🔄 Forcing auth recheck before adding...')
    forceAuthRecheck()
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  setAddingToCart(true)

  try {
    // Convertir opciones seleccionadas al formato que espera el backend
    const selectedOptionIds = []
    
    Object.entries(opcionesSeleccionadas).forEach(([opcionId, cantidad]) => {
      if (cantidad > 0) {
        console.log(`🔍 Procesando opción ID: ${opcionId}, cantidad: ${cantidad}`)
        
        // Verificar que la opción existe en las opciones cargadas
        const opcionExiste = opciones.find(opt => opt.id.toString() === opcionId.toString())
        if (!opcionExiste) {
          console.error(`❌ OPCIÓN NO ENCONTRADA: ID ${opcionId}`)
          throw new Error(`Opción con ID ${opcionId} no encontrada`)
        }
        
        console.log(`✅ Opción encontrada:`, opcionExiste)
        
        // Agregar el ID tantas veces como la cantidad
        for (let i = 0; i < cantidad; i++) {
          selectedOptionIds.push(parseInt(opcionId))
        }
      }
    })

    console.log('🎯 Selected option IDs FINAL:', selectedOptionIds)

    // Verificar que el product_id es correcto
    const finalProductId = parseInt(producto.id)
    console.log('🏷️ Final product ID:', finalProductId, 'type:', typeof finalProductId)

    // Crear el producto para el carrito
    const productoParaCarrito = {
      id: finalProductId,
      originalId: finalProductId,
      nombre: producto.nombre,
      descripcion: productDescription ? decodeURIComponent(productDescription) : '',
      precio: basePrice,
      imagen: productImage
    }

    console.log('📦 Producto para carrito:', productoParaCarrito)
    console.log('📋 Opciones que se enviarán:', selectedOptionIds)

    // DEBUGGING: Hacer una verificación manual de las opciones
    console.log('🔍 VERIFICACIÓN MANUAL:')
    console.log('- Product ID que se enviará:', finalProductId)
    console.log('- Option IDs que se enviarán:', selectedOptionIds)
    console.log('- Opciones disponibles para este producto:', opciones.filter(opt => 
      opt.product_id.toString() === finalProductId.toString()
    ))

    // Verificar que todas las opciones seleccionadas pertenecen al producto
    const opcionesInvalidas = selectedOptionIds.filter(optionId => {
      const opcionValida = opciones.find(opt => 
        opt.id === optionId && 
        opt.product_id.toString() === finalProductId.toString()
      )
      return !opcionValida
    })

    if (opcionesInvalidas.length > 0) {
      console.error('❌ OPCIONES INVÁLIDAS DETECTADAS:', opcionesInvalidas)
      throw new Error(`Opciones inválidas: ${opcionesInvalidas.join(', ')}`)
    }

    console.log('✅ Todas las opciones son válidas, procediendo...')

    // Llamar a addItem
    await addItem(productoParaCarrito, selectedOptionIds)

    console.log('✅ Producto agregado exitosamente')

    // Feedback visual
    setTimeout(() => {
      setAddingToCart(false)
      toggleCart()
      console.log('🛒 Carrito abierto')
    }, 800)

  } catch (error) {
    console.error('❌ ERROR COMPLETO:', error)
    console.error('❌ Stack trace:', error.stack)
    setAddingToCart(false)
    setError('Error al agregar el producto al carrito: ' + error.message)
  }
}

  const volver = () => {
    router.back()
  }

  const opcionesPorTipo = opciones.reduce((acc, opcion) => {
    const tipo = opcion.option_type
    if (!acc[tipo]) {
      acc[tipo] = []
    }
    acc[tipo].push(opcion)
    return acc
  }, {})

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Producto no encontrado</h2>
          <p className="text-gray-500 mb-6">No se pudo cargar la información del producto</p>
          <button
            onClick={volver}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando opciones del producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={volver}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </div>
              <span className="font-medium text-sm">Volver</span>
            </button>
            
            <div className="flex-1 text-center px-6">
              <h1 className="text-xl font-bold text-gray-800">{producto.nombre}</h1>
              <p className="text-xs text-gray-500 mt-1">Personalización de producto</p>
            </div>
            
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
        
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Product Sidebar - Sticky */}
          <div className="xl:w-80 xl:flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Product Image */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  {productImage ? (
                    <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
                      <img
                        src={productImage.startsWith('http') ? productImage : `${process.env.NEXT_PUBLIC_API_URL}${productImage}`}
                        alt={producto.nombre}
                        className="max-w-full max-h-full object-contain drop-shadow-sm rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-xs">Sin imagen</p>
                      </div>
                    </div>
                  )}
                </div>

              {/* Order Summary & Total Combined */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4 border-b border-amber-200">
                  <h3 className="font-semibold text-amber-700 text-sm">Resumen del Pedido</h3>
                </div>
                
                <div className="p-5">
                  <div className="space-y-3">
                    {/* Base price */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio base</span>
                      <span className="font-medium text-gray-800">${basePrice.toFixed(2)}</span>
                    </div>
                    
                    {/* Selected options */}
                    {Object.entries(opcionesSeleccionadas).length > 0 ? (
                      Object.entries(opcionesSeleccionadas).map(([opcionId, cantidad]) => {
                        const opcion = opciones.find(opt => opt.id.toString() === opcionId)
                        if (!opcion || cantidad === 0) return null
                        const subtotal = parseFloat(opcion.extra_price || 0) * cantidad
                        return (
                          <div key={opcionId} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate mr-3">
                              {opcion.option_type} {opcion.option_value} × {cantidad}
                            </span>
                            <span className="font-medium text-amber-600">+${subtotal.toFixed(2)}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-gray-400 text-sm">No hay opciones seleccionadas</p>
                      </div>
                    )}
                    
                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-600">${precioTotal.toFixed(2)}</div>
                          {precioTotal !== basePrice && (
                            <div className="text-xs text-gray-500 mt-1">
                              Extras: +${(precioTotal - basePrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add to cart button - ACTUALIZADO */}
                    <div className="pt-3">
                      <button 
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-sm flex items-center justify-center space-x-2"
                      >
                        {addingToCart ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Agregando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9" />
                            </svg>
                            <span>Agregar al Carrito</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center text-red-600">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {Object.keys(opcionesPorTipo).length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin opciones disponibles</h3>
                <p className="text-gray-500">Este producto no tiene opciones de personalización.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(opcionesPorTipo).map(([tipo, opcionesDelTipo]) => (
                  <div key={tipo} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{tipo}</h3>
                    </div>
                    <div className="p-5">
                      <div className="space-y-3">
                        {opcionesDelTipo.map(opcion => {
                          const cantidad = opcionesSeleccionadas[opcion.id] || 0
                          const precioExtra = parseFloat(opcion.extra_price || 0)
                          const isSelected = cantidad > 0

                          return (
                            <div key={opcion.id} className={`rounded-xl p-4 border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-amber-200 bg-amber-50/50 shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-800 text-sm">
                                        {opcion.option_value}
                                      </h4>
                                      {precioExtra > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Costo adicional: ${precioExtra.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                    {precioExtra > 0 && (
                                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap">
                                        +${precioExtra.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  <button
                                    onClick={() => cambiarCantidadOpcion(opcion.id, -1)}
                                    disabled={cantidad === 0}
                                    className="w-8 h-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                                  >
                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.5 12h-15" />
                                    </svg>
                                  </button>

                                  <div className="w-12 h-8 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="font-semibold text-gray-700 text-sm">{cantidad}</span>
                                  </div>

                                  <button
                                    onClick={() => cambiarCantidadOpcion(opcion.id, 1)}
                                    className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all duration-200 shadow-sm"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente loading para el Suspense
function ProductOptionsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Cargando página...</p>
      </div>
    </div>
  )
}

// Componente principal que exportas - ENVUELVE TODO EN SUSPENSE
export default function ProductOptionsClientPage() {
  return (
    <Suspense fallback={<ProductOptionsLoading />}>
      <ProductOptionsClientContent />
    </Suspense>
  )
}