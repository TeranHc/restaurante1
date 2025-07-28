'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OpcionesProductoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const productId = searchParams.get('productId')
  const productName = searchParams.get('productName')
  const basePrice = parseFloat(searchParams.get('basePrice') || '0')
  
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [nuevoValor, setNuevoValor] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Estados para la vista del cliente
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

  // Calcular precio total cuando cambian las opciones seleccionadas
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

  const agregarOpcion = async () => {
    if (guardando) return
    
    setError('')
    
    if (!nuevoTipo.trim() || !nuevoValor.trim()) {
      setError('Debes ingresar tanto el tipo como el valor de la opción.')
      return
    }

    if (!producto?.id) {
      setError('Error: No se ha especificado el producto.')
      return
    }

    const parsedPrecio = parseFloat(nuevoPrecio || 0)

    setGuardando(true)
    try {
      const res = await fetch(`http://localhost:3001/api/product-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: producto.id,
          option_type: nuevoTipo.trim(),
          option_value: nuevoValor.trim(),
          extra_price: isNaN(parsedPrecio) ? 0 : parsedPrecio
        })
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Error ${res.status}: ${errBody || 'al guardar opción'}`)
      }

      const nuevaOpcion = await res.json()
      setOpciones(prev => [...prev, nuevaOpcion])
      setNuevoTipo('')
      setNuevoValor('')
      setNuevoPrecio('')
      
      // Mensaje de éxito temporal
      setError('✓ Opción agregada exitosamente')
      setTimeout(() => setError(''), 3000)
      
    } catch (err) {
      setError(`Error al guardar: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  const eliminarOpcion = async (opcionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta opción?')) {
      return
    }

    try {
      const res = await fetch(`http://localhost:3001/api/product-options/${opcionId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error(`Error ${res.status}: al eliminar opción`)
      }

      setOpciones(prev => prev.filter(opt => opt.id !== opcionId))
      // Limpiar la opción de las selecciones si estaba seleccionada
      setOpcionesSeleccionadas(prev => {
        const updated = { ...prev }
        delete updated[opcionId]
        return updated
      })
      setError('✓ Opción eliminada exitosamente')
      setTimeout(() => setError(''), 3000)
    } catch (err) {
      setError(`Error al eliminar: ${err.message}`)
    }
  }

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

  // Agrupar opciones por tipo para mejor visualización
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">No se especificó un producto válido</p>
          <button
            onClick={volver}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Opciones de Producto</h1>
              <p className="text-gray-600 mt-1">{producto.nombre}</p>
            </div>
            <button
              onClick={volver}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LADO IZQUIERDO - VISTA DEL CLIENTE */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Vista del Cliente</h2>
              <div className="text-right">
                <p className="text-sm text-gray-600">Precio Base: ${basePrice.toFixed(2)}</p>
                <p className="text-lg font-bold text-green-600">Total: ${precioTotal.toFixed(2)}</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando opciones...</p>
              </div>
            ) : Object.keys(opcionesPorTipo).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🛍️</div>
                <p className="text-gray-500">No hay opciones disponibles</p>
                <p className="text-sm text-gray-400 mt-1">Agrega opciones desde el panel de administrador</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(opcionesPorTipo).map(([tipo, opcionesDelTipo]) => (
                  <div key={tipo} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3 text-blue-600">{tipo}</h3>
                    <div className="space-y-2">
                      {opcionesDelTipo.map(opcion => {
                        const cantidad = opcionesSeleccionadas[opcion.id] || 0
                        const precioExtra = parseFloat(opcion.extra_price || 0)
                        
                        return (
                          <div key={opcion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium">{opcion.option_value}</span>
                              {precioExtra > 0 && (
                                <span className="text-green-600 text-sm ml-2">+${precioExtra.toFixed(2)}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => cambiarCantidadOpcion(opcion.id, -1)}
                                disabled={cantidad === 0}
                                className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center transition-colors"
                              >
                                −
                              </button>
                              
                              <span className="w-8 text-center font-medium">{cantidad}</span>
                              
                              <button
                                onClick={() => cambiarCantidadOpcion(opcion.id, 1)}
                                className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Resumen de selecciones */}
                {Object.keys(opcionesSeleccionadas).length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resumen de selecciones:</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(opcionesSeleccionadas).map(([opcionId, cantidad]) => {
                        const opcion = opciones.find(opt => opt.id.toString() === opcionId)
                        if (!opcion || cantidad === 0) return null
                        
                        const subtotal = parseFloat(opcion.extra_price || 0) * cantidad
                        
                        return (
                          <div key={opcionId} className="flex justify-between text-gray-600">
                            <span>{opcion.option_value} × {cantidad}</span>
                            <span>+${subtotal.toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LADO DERECHO - PANEL DE ADMINISTRADOR */}
          <div className="space-y-6">
            {/* Formulario para agregar opciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Panel de Administrador</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de opción *
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Tamaño, Color, Material"
                    value={nuevoTipo}
                    onChange={e => setNuevoTipo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Grande, Rojo, Algodón"
                    value={nuevoValor}
                    onChange={e => setNuevoValor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio adicional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={nuevoPrecio}
                    onChange={e => setNuevoPrecio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Costo adicional de esta opción (opcional)
                  </p>
                </div>

                <button
                  onClick={agregarOpcion}
                  disabled={guardando}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Agregar Opción'
                  )}
                </button>

                {error && (
                  <div className={`p-3 rounded-lg text-sm ${
                    error.startsWith('✓') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Lista de opciones existentes para administrar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Opciones Existentes ({opciones.length})
              </h3>

              {opciones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No hay opciones agregadas</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {opciones.map(opt => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          <span className="text-blue-600">{opt.option_type}:</span> {opt.option_value}
                        </div>
                        {opt.extra_price && parseFloat(opt.extra_price) > 0 && (
                          <div className="text-xs text-green-600">
                            +${parseFloat(opt.extra_price).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarOpcion(opt.id)}
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors ml-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}