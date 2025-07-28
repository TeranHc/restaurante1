'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import VistaCliente from './vistaCliente' // Ajusta la ruta según tu estructura de carpetas

export default function OpcionesProductoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productImage = searchParams.get('productImage')
  
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
  
  // Estado para edición
  const [editando, setEditando] = useState(null) // ID de la opción que se está editando

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
      setError('✓ Opción eliminada exitosamente')
      setTimeout(() => setError(''), 3000)
    } catch (err) {
      setError(`Error al eliminar: ${err.message}`)
    }
  }

  const iniciarEdicion = (opcion) => {
    setEditando(opcion.id)
    // Cargar los valores en los campos del formulario principal
    setNuevoTipo(opcion.option_type)
    setNuevoValor(opcion.option_value)
    setNuevoPrecio(opcion.extra_price || '')
    setError('') // Limpiar errores previos
  }

  const cancelarEdicion = () => {
    setEditando(null)
    // Limpiar los campos del formulario
    setNuevoTipo('')
    setNuevoValor('')
    setNuevoPrecio('')
    setError('')
  }

  const guardarEdicion = async () => {
    if (guardando || !editando) return
    
    setError('')
    
    if (!nuevoTipo.trim() || !nuevoValor.trim()) {
      setError('Debes ingresar tanto el tipo como el valor de la opción.')
      return
    }

    const parsedPrecio = parseFloat(nuevoPrecio || 0)

    setGuardando(true)
    try {
      const res = await fetch(`http://localhost:3001/api/product-options/${editando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          option_type: nuevoTipo.trim(),
          option_value: nuevoValor.trim(),
          extra_price: isNaN(parsedPrecio) ? 0 : parsedPrecio
        })
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Error ${res.status}: ${errBody || 'al actualizar opción'}`)
      }

      const opcionActualizada = await res.json()
      
      // Actualizar la opción en el estado
      setOpciones(prev => prev.map(opt => 
        opt.id === editando ? opcionActualizada : opt
      ))
      
      // Limpiar estados de edición
      cancelarEdicion()
      
      // Mensaje de éxito temporal
      setError('✓ Opción actualizada exitosamente')
      setTimeout(() => setError(''), 3000)
      
    } catch (err) {
      setError(`Error al actualizar: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  const volver = () => {
    router.back()
  }

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
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando opciones...</p>
              </div>
            </div>
          ) : (
            <VistaCliente opciones={opciones} basePrice={basePrice} productImage={productImage} />
          )}

          {/* LADO DERECHO - PANEL DE ADMINISTRADOR */}
          <div className="space-y-6">
            {/* Formulario para agregar/editar opciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editando ? 'Editar Opción' : 'Panel de Administrador'}
              </h2>

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

                {editando ? (
                  // Botones para modo edición
                  <div className="flex space-x-3">
                    <button
                      onClick={cancelarEdicion}
                      disabled={guardando}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarEdicion}
                      disabled={guardando}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center"
                    >
                      {guardando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Actualizando...
                        </>
                      ) : (
                        'Actualizar Opción'
                      )}
                    </button>
                  </div>
                ) : (
                  // Botón para modo agregar
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
                )}

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
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        editando === opt.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
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
                      <div className="flex items-center space-x-2">
                        {editando === opt.id ? (
                          <span className="text-xs text-blue-600 font-medium">Editando...</span>
                        ) : (
                          <>
                            <button
                              onClick={() => iniciarEdicion(opt)}
                              disabled={editando !== null}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminarOpcion(opt.id)}
                              disabled={editando !== null}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
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