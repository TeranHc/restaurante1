'use client'

import { useState, useEffect } from 'react'
import RestauranteForm from './RestauranteForm'

export default function Page() {
  const [restaurantes, setRestaurantes] = useState([])
  const [editRestaurante, setEditRestaurante] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchRestaurantes = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/restaurantes')
      if (!res.ok) throw new Error('Error al cargar restaurantes')
      const data = await res.json()
      setRestaurantes(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurantes()
  }, [])

  const onFormSubmit = async (data) => {
    try {
      let res
      if (editRestaurante) {
        res = await fetch(`http://localhost:3001/api/restaurantes/${editRestaurante.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        res = await fetch('http://localhost:3001/api/restaurantes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      if (!res.ok) throw new Error('Error al guardar restaurante')
      await fetchRestaurantes()
      setEditRestaurante(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este restaurante?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/restaurantes/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar restaurante')
      await fetchRestaurantes()
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
      <h1>Restaurantes</h1>

      <RestauranteForm
        restaurante={editRestaurante}
        onSubmit={onFormSubmit}
        onCancel={() => setEditRestaurante(null)}
      />

      {loading ? (
        <p>Cargando restaurantes...</p>
      ) : restaurantes.length === 0 ? (
        <p>No hay restaurantes registrados.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Dirección</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Capacidad</th>
              <th style={thStyle}>Horario</th>
              <th style={thStyle}>Activo</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {restaurantes.map((rest) => (
              <tr key={rest.id}>
                <td style={tdStyle}>{rest.id}</td>
                <td style={tdStyle}>{rest.name}</td>
                <td style={tdStyle}>{rest.address}</td>
                <td style={tdStyle}>{rest.phone}</td>
                <td style={tdStyle}>{rest.email}</td>
                <td style={tdStyle}>{rest.capacity}</td>
                <td style={tdStyle}>{rest.openingTime} - {rest.closingTime}</td>
                <td style={tdStyle}>{rest.isActive ? 'Sí' : 'No'}</td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
                    onClick={() => setEditRestaurante(rest)}
                  >
                    Editar
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
                    onClick={() => onDelete(rest.id)}
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
