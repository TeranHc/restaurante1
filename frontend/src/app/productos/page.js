'use client'

import { useState, useEffect } from 'react'
import ProductoForm from './ProductoForm'

export default function Page() {
  const [productos, setProductos] = useState([])
  const [editProducto, setEditProducto] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const onFormSubmit = async (formData) => {
    try {
      let res
      if (editProducto) {
        res = await fetch(`http://localhost:3001/api/productos/${editProducto.id}`, {
          method: 'PUT',
          body: formData,  // 👈 Ahora es un FormData, no JSON
        })
      } else {
        res = await fetch('http://localhost:3001/api/productos', {
          method: 'POST',
          body: formData,  // 👈 Ahora es un FormData, no JSON
        })
      }
      if (!res.ok) throw new Error('Error al guardar producto')
      await fetchProductos()
      setEditProducto(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar producto')
      await fetchProductos()
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
      <h1>Productos</h1>

      <ProductoForm
        producto={editProducto}
        onSubmit={onFormSubmit}
        onCancel={() => setEditProducto(null)}
      />

      {loading ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos registrados.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Precio</th>
              <th style={thStyle}>Categoría</th>
              <th style={thStyle}>Restaurante</th>
              <th style={thStyle}>Disponible</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod.id}>
                <td style={tdStyle}>{prod.id}</td>
                <td style={tdStyle}>{prod.nombre}</td>
                <td style={tdStyle}> ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}</td>
                <td style={tdStyle}>{prod.category?.name}</td>
                <td style={tdStyle}>{prod.restaurant?.name}</td>
                <td style={tdStyle}>{prod.disponible ? 'Sí' : 'No'}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
                    onClick={() => setEditProducto(prod)}
                  >
                    Editar
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
                    onClick={() => onDelete(prod.id)}
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
