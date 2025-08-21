'use client'

import { useState, useEffect } from 'react'
import CategoriaForm from './CategoriaForm'

export default function Page() {
  const [categorias, setCategorias] = useState([])
  const [editCategoria, setEditCategoria] = useState(null)
  const [loading, setLoading] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchCategorias = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/categorias`)
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
    fetchCategorias()
  }, [])

  const onFormSubmit = async (categoriaData) => {
    try {
      let res
      if (editCategoria) {
        res = await fetch(`${API_URL}/api/categorias/${editCategoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoriaData),
        })
      } else {
        res = await fetch(`${API_URL}/api/categorias`, {
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
      const res = await fetch(`${API_URL}/api/categorias/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar categoría')
      await fetchCategorias()
    } catch (error) {
      alert(error.message)
    }
  }

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '1rem',
  }

  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    textAlign: 'left',
  }

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    color: '#333',
  }

  const buttonStyle = {
    marginRight: '0.5rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: 'white', minHeight: '100vh', color: '#333' }}>
      <h1>Categorías</h1>

      <CategoriaForm
        categoria={editCategoria}
        onSubmit={onFormSubmit}
        onCancel={() => setEditCategoria(null)}
      />

      {loading ? (
        <p>Cargando categorías...</p>
      ) : categorias.length === 0 ? (
        <p>No hay categorías registradas.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Descripción</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td style={tdStyle}>{cat.id}</td>
                <td style={tdStyle}>{cat.name}</td>
                <td style={tdStyle}>{cat.description || '-'}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
                    onClick={() => setEditCategoria(cat)}
                  >
                    Editar
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
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
    </div>
  )
}
