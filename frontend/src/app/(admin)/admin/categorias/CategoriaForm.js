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
    <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="px-3 py-2 border border-gray-400 rounded-md text-gray-800 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="px-3 py-2 border border-gray-400 rounded-md text-gray-800 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Guardar
      </button>
      {categoria && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Cancelar
        </button>
      )}
    </form>
  )
}
