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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Producto no encontrado</h2>
          <p className="text-slate-600 mb-6">No se pudo cargar la información del producto</p>
          <button
            onClick={volver}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando opciones del producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={volver}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span className="font-medium">Volver</span>
            </button>
            
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-slate-900">{producto.nombre}</h1>
              <p className="text-sm text-slate-500 mt-1">Configurar opciones</p>
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Product Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Product Image */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              {productImage ? (
                <div className="aspect-square flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
                  <img
                    src={productImage.startsWith('http') ? productImage : `http://localhost:3001${productImage}`}
                    alt={producto.nombre}
                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-400 text-sm">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="text-center">
                <p className="text-emerald-700 font-medium mb-2">Precio Total</p>
                <div className="text-3xl font-bold text-emerald-800 mb-3">
                  ${precioTotal.toFixed(2)}
                </div>
                {precioTotal !== basePrice && (
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <span className="text-slate-500 line-through">${basePrice.toFixed(2)}</span>
                    <span className="text-emerald-600 font-medium">
                      (+${(precioTotal - basePrice).toFixed(2)})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {Object.keys(opcionesSeleccionadas).length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Resumen del pedido</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Precio base</span>
                    <span className="font-medium text-slate-900">${basePrice.toFixed(2)}</span>
                  </div>
                  
                  {Object.entries(opcionesSeleccionadas).map(([opcionId, cantidad]) => {
                    const opcion = opciones.find(opt => opt.id.toString() === opcionId)
                    if (!opcion || cantidad === 0) return null
                    const subtotal = parseFloat(opcion.extra_price || 0) * cantidad
                    return (
                      <div key={opcionId} className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate mr-3">
                          {opcion.option_value} × {cantidad}
                        </span>
                        <span className="font-medium text-emerald-600">+${subtotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                  
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-900">Total</span>
                      <span className="text-emerald-700">${precioTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options Panel */}
          <div className="lg:col-span-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {Object.keys(opcionesPorTipo).length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Sin opciones disponibles</h3>
                <p className="text-slate-600">Este producto no tiene opciones de personalización.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(opcionesPorTipo).map(([tipo, opcionesDelTipo]) => (
                  <div key={tipo} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">{tipo}</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid gap-4">
                        {opcionesDelTipo.map(opcion => {
                          const cantidad = opcionesSeleccionadas[opcion.id] || 0
                          const precioExtra = parseFloat(opcion.extra_price || 0)

                          return (
                            <div key={opcion.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <span className="font-medium text-slate-900">
                                      {opcion.option_value}
                                    </span>
                                    {precioExtra > 0 && (
                                      <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                        +${precioExtra.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 ml-6">
                                  <button
                                    onClick={() => cambiarCantidadOpcion(opcion.id, -1)}
                                    disabled={cantidad === 0}
                                    className="w-9 h-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                  >
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 12h-15" />
                                    </svg>
                                  </button>

                                  <div className="w-10 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
                                    <span className="font-semibold text-slate-900">{cantidad}</span>
                                  </div>

                                  <button
                                    onClick={() => cambiarCantidadOpcion(opcion.id, 1)}
                                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
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