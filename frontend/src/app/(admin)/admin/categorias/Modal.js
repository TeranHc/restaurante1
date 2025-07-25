'use client'

import { useState, useEffect } from 'react'
import CategoriaForm from './ModalForm'

export default function ModalCategorias({ open, onClose }) {
  const [categorias, setCategorias] = useState([])
  const [editCategoria, setEditCategoria] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCategorias = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/categorias')
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      setCategorias(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategorias()
    }
  }, [open])

  const onFormSubmit = async (categoriaData) => {
    try {
      let res
      if (editCategoria) {
        res = await fetch(`http://localhost:3001/api/categorias/${editCategoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaData),
        })
      } else {
        res = await fetch('http://localhost:3001/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaData),
        })
      }
      if (!res.ok) throw new Error('Error al guardar categoría')
      await fetchCategorias()
      setEditCategoria(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/categorias/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar categoría')
      await fetchCategorias()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    open && (
      <>
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
        />

        <div
          role="dialog"
          aria-modal="true"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 md:p-8 rounded-xl z-50 w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Gestión de Categorías
          </h2>

          <CategoriaForm
            categoria={editCategoria}
            onSubmit={onFormSubmit}
            onCancel={() => setEditCategoria(null)}
          />

          {loading ? (
            <p className="mt-4 text-gray-600">Cargando categorías...</p>
          ) : categorias.length === 0 ? (
            <p className="mt-4 text-gray-600">No hay categorías registradas.</p>
          ) : (
            <table className="w-full border border-gray-200 mt-6 text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left text-gray-700 font-medium">Nombre</th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-gray-700 font-medium">Descripción</th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-gray-700 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-gray-800">{cat.name}</td>
                    <td className="border border-gray-200 px-4 py-2 text-gray-800">{cat.description || '-'}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                        onClick={() => setEditCategoria(cat)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        onClick={() => onDelete(cat.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="text-right mt-6">
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </>
    )
  )
}
