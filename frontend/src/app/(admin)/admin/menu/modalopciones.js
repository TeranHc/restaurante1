'use client'

import { useEffect, useState } from 'react'

export default function ModalOpcionesProducto({ producto, onClose }) {
  const [opciones, setOpciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [nuevoValor, setNuevoValor] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!producto) return

    const fetchOpciones = async () => {
      setLoading(true)
      try {
        // ✅ CORREGIDO: Usar variable de entorno
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-options?product_id=${producto.id}`)
        if (!res.ok) {
          const errText = await res.text()
          throw new Error(`Error ${res.status}: ${errText || 'al cargar opciones del producto'}`)
        }
        const data = await res.json()
        setOpciones(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOpciones()
  }, [producto])

  const agregarOpcion = async () => {
    setError('')
    if (!nuevoTipo || !nuevoValor) {
      setError('Debes ingresar tanto el tipo como el valor de la opción.')
      return
    }

    const parsedPrecio = parseFloat(nuevoPrecio || 0)

    try {
      // ✅ CORREGIDO: Usar variable de entorno
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: producto.id,
          option_type: nuevoTipo,
          option_value: nuevoValor,
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
    } catch (err) {
      setError(err.message)
    }
  }

  const eliminarOpcion = async (opcionId) => {
    try {
      // ✅ CORREGIDO: Usar variable de entorno
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-options/${opcionId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Error ${res.status}: ${errBody || 'al eliminar opción'}`)
      }

      setOpciones(prev => prev.filter(opt => opt.id !== opcionId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-4 max-w-md bg-white rounded shadow text-black">
      <h2 className="text-xl font-bold mb-4">Opciones de {producto.nombre}</h2>

      {loading ? (
        <p className="text-gray-500">Cargando opciones...</p>
      ) : opciones.length === 0 ? (
        <p className="text-gray-500">No hay opciones para este producto.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {opciones.map(opt => (
            <li key={opt.id} className="text-black flex justify-between items-center bg-gray-50 p-2 rounded">
              <div>
                <strong>{opt.option_type}:</strong> {opt.option_value}
                {opt.extra_price && parseFloat(opt.extra_price) > 0 && (
                  <span className="text-green-600"> (+${parseFloat(opt.extra_price).toFixed(2)})</span>
                )}
              </div>
              <button
                onClick={() => eliminarOpcion(opt.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Tipo de opción (ej: Tamaño)"
          value={nuevoTipo}
          onChange={e => setNuevoTipo(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Valor (ej: Grande)"
          value={nuevoValor}
          onChange={e => setNuevoValor(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Precio adicional (opcional)"
          value={nuevoPrecio}
          onChange={e => setNuevoPrecio(e.target.value)}
          className="w-full border px-3 py-2 rounded text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={agregarOpcion}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Agregar Opción
        </button>

        {error && (
          <div className="text-red-600 mt-2 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
      >
        Cerrar
      </button>
    </div>
  )
}