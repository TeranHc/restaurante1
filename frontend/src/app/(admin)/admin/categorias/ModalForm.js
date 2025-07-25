'use client'

import { useState, useEffect } from 'react'

export default function CategoriaForm({ categoria, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (categoria) {
      setName(categoria.name)
      setDescription(categoria.description)
    } else {
      setName('')
      setDescription('')
    }
  }, [categoria])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    onSubmit({ name, description })
    setName('')
    setDescription('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="text-gray-800 p-4 rounded-xl shadow-lg bg-white space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Columna: Nombre + Botones */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Nombre de la categoría
            </label>
            <input
              type="text"
              placeholder="Ej. Bebidas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          {/* Botones dentro de esta columna */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md transition duration-200"
            >
              Guardar
            </button>

            {categoria && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl shadow-md transition duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Columna: Descripción */}
        <div className="w-full md:w-1/2">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Descripción (opcional)
          </label>
          <textarea
            placeholder="Ej. Categoría para bebidas frías y calientes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 resize-none"
          ></textarea>
        </div>
      </div>
    </form>
  )
}
