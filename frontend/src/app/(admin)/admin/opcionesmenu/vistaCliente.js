'use client'

import { useEffect, useState } from 'react'

export default function VistaCliente({ opciones = [], basePrice = 0, productImage = '' }) {
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState({})
  const [precioTotal, setPrecioTotal] = useState(basePrice)

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

  const opcionesPorTipo = opciones.reduce((acc, opcion) => {
    const tipo = opcion.option_type
    if (!acc[tipo]) {
      acc[tipo] = []
    }
    acc[tipo].push(opcion)
    return acc
  }, {})

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Imagen producto arriba */}
      {productImage && (
        <div className="mb-4 rounded overflow-hidden shadow-md max-h-48">
          <img
            src={productImage.startsWith('http') ? productImage : `http://localhost:3001${productImage}`}
            alt="Imagen del producto"
            className="w-full object-cover"
            style={{ maxHeight: '192px' }}
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Vista del Cliente</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">Precio Base: ${basePrice.toFixed(2)}</p>
          <p className="text-lg font-bold text-green-600">Total: ${precioTotal.toFixed(2)}</p>
        </div>
      </div>

      {Object.keys(opcionesPorTipo).length === 0 ? (
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
  )
}
