'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ProductOptionsClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productImage = searchParams.get('productImage')
  const productId = searchParams.get('productId')
  const productName = searchParams.get('productName')
  const basePrice = parseFloat(searchParams.get('basePrice') || '0')
  
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({})
  const [precioTotal, setPrecioTotal] = useState(basePrice)

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
        const url = `http://localhost:3001/api/product-options?product_id=${producto.id}`
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">No se especificó un producto válido</p>
          <button
            onClick={volver}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando producto</h2>
          <p className="text-gray-500">Obteniendo opciones disponibles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold">{producto.nombre}</h1>
              <p className="text-blue-100 mt-1">Personaliza tu producto</p>
            </div>
            <button
              onClick={volver}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Imagen del producto */}
          {productImage && (
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                <img
                  src={productImage.startsWith('http') ? productImage : `http://localhost:3001${productImage}`}
                  alt={producto.nombre}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <p className="text-sm font-medium text-gray-600">Precio Base</p>
                <p className="text-2xl font-bold text-gray-900">${basePrice.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Precio total prominente */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 font-medium">Precio Total</p>
                  <p className="text-4xl font-bold text-green-800">${precioTotal.toFixed(2)}</p>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {Object.keys(opcionesPorTipo).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin opciones disponibles</h3>
                <p className="text-gray-500">Este producto no tiene opciones de personalización</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(opcionesPorTipo).map(([tipo, opcionesDelTipo]) => (
                  <div key={tipo} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      {tipo}
                    </h3>
                    
                    <div className="grid gap-4">
                      {opcionesDelTipo.map(opcion => {
                        const cantidad = opcionesSeleccionadas[opcion.id] || 0
                        const precioExtra = parseFloat(opcion.extra_price || 0)

                        return (
                          <div key={opcion.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">{opcion.option_value}</h4>
                                {precioExtra > 0 && (
                                  <p className="text-green-600 font-medium mt-1">+${precioExtra.toFixed(2)}</p>
                                )}
                              </div>

                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => cambiarCantidadOpcion(opcion.id, -1)}
                                  disabled={cantidad === 0}
                                  className="w-10 h-10 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:hover:scale-100"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>

                                <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <span className="font-bold text-gray-900 text-lg">{cantidad}</span>
                                </div>

                                <button
                                  onClick={() => cambiarCantidadOpcion(opcion.id, 1)}
                                  className="w-10 h-10 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Resumen de selecciones */}
                {Object.keys(opcionesSeleccionadas).length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      Resumen de selecciones
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(opcionesSeleccionadas).map(([opcionId, cantidad]) => {
                        const opcion = opciones.find(opt => opt.id.toString() === opcionId)
                        if (!opcion || cantidad === 0) return null

                        const subtotal = parseFloat(opcion.extra_price || 0) * cantidad

                        return (
                          <div key={opcionId} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                            <span className="font-medium text-gray-700">
                              {opcion.option_value} × {cantidad}
                            </span>
                            <span className="font-bold text-green-600">+${subtotal.toFixed(2)}</span>
                          </div>
                        )
                      })}
                      <div className="border-t border-gray-200 pt-3 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total Final:</span>
                          <span className="text-2xl font-bold text-green-600">${precioTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}