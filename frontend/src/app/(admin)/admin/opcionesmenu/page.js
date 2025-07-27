'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function OpcionesProductoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const productId = searchParams.get('productId')
  const productName = searchParams.get('productName')
  
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [nuevoValor, setNuevoValor] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

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
        const res = await fetch(`http://localhost:3001/api/product-options?product_id=${producto.id}`)
        
        if (!res.ok) {
          if (res.status === 404) {
            // Si no existe el endpoint o no hay opciones, simplemente mostramos lista vacía
            setOpciones([])
            return
          }
          const errText = await res.text()
          throw new Error(`Error ${res.status}: ${errText || 'al cargar opciones'}`)
        }
        
        const data = await res.json()
        setOpciones(Array.isArray(data) ? data : [])
      } catch (err) {
        // Si hay error de red o servidor, mostramos mensaje pero permitimos seguir usando la página
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
      const successMsg = error
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Opciones de Producto</h1>
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
          {/* Lista de opciones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Opciones Existentes ({opciones.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Cargando opciones...</p>
              </div>
            ) : opciones.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📝</div>
                <p className="text-gray-500">No hay opciones para este producto</p>
                <p className="text-sm text-gray-400 mt-1">Agrega la primera opción usando el formulario</p>
              </div>
            ) : (
              <div className="space-y-3">
                {opciones.map(opt => (
                  <div
                    key={opt.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          <span className="text-blue-600">{opt.option_type}:</span> {opt.option_value}
                        </div>
                        {opt.extra_price && parseFloat(opt.extra_price) > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            +${parseFloat(opt.extra_price).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarOpcion(opt.id)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nueva Opción</h2>

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
        </div>
      </div>
    </div>
  )
}