'use client'

import { useState, useEffect } from 'react'
import RestauranteForm from './ModalForm'

export default function ModalRestaurantes({ open, onClose }) {
  const [restaurantes, setRestaurantes] = useState([])
  const [editRestaurante, setEditRestaurante] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchRestaurantes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/api/restaurants')
      if (!res.ok) throw new Error('Error al cargar restaurantes')
      const data = await res.json()
      setRestaurantes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchRestaurantes()
    }
  }, [open])

  const closeModal = () => {
    setEditRestaurante(null)
    setError(null)
    onClose()
  }

  const handleFormSubmit = async (formData) => {
    setSaving(true)
    setError(null)
    try {
      const url = editRestaurante
        ? `http://localhost:3001/api/restaurants/${editRestaurante.id}`
        : 'http://localhost:3001/api/restaurants'
      const method = editRestaurante ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Error guardando restaurante')
      await fetchRestaurantes()
      setEditRestaurante(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este restaurante?')) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:3001/api/restaurants/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar restaurante')
      await fetchRestaurantes()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      backdropFilter: 'blur(2px)',
    },
    modalContainer: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      zIndex: 1001,
      width: '95vw',
      maxWidth: '1400px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      gap: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formWrapper: {
      flex: '1 1 400px',
      borderRight: '1px solid #eee',
      paddingRight: '1.5rem',
      minWidth: '300px', // Mínimo para evitar que colapse demasiado
    },
    tableWrapper: {
      flex: '2 1 800px',
      overflowY: 'auto',
      minWidth: '500px', // Mínimo para la tabla
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#fff',
      color: '#222',
      fontSize: '0.95rem',
    },
    th: {
      borderBottom: '2px solid #ddd',
      padding: '12px 10px',
      textAlign: 'left',
      backgroundColor: '#f8f8f8',
      color: '#333',
      fontWeight: '600',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#f0f0f0',
      },
    },
    td: {
      borderBottom: '1px solid #eee',
      padding: '10px',
      verticalAlign: 'middle',
      color: '#222',
      transition: 'background-color 0.3s',
      '&:hover': {
        backgroundColor: '#fafafa',
      },
    },
    buttonPrimary: {
      backgroundColor: '#0070f3',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.2s',
      '&:hover': {
        backgroundColor: '#005bb5',
        transform: 'translateY(-1px)',
      },
      '&:disabled': {
        backgroundColor: '#99c2ff',
        cursor: 'not-allowed',
      },
    },
    buttonDanger: {
      backgroundColor: '#e00',
      color: 'white',
      padding: '0.4rem 0.9rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.2s',
      '&:hover': {
        backgroundColor: '#b30000',
        transform: 'translateY(-1px)',
      },
      '&:disabled': {
        backgroundColor: '#ff9999',
        cursor: 'not-allowed',
      },
    },
    error: {
      color: '#e00',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      padding: '0.5rem',
      backgroundColor: '#ffebee',
      borderRadius: '4px',
    },
    loading: {
      textAlign: 'center',
      color: '#666',
      padding: '1rem',
    },
  }

  // Lógica para colapsar a una columna en pantallas pequeñas
  const isMobile = window.innerWidth <= 768
  const containerStyle = {
    ...styles.modalContainer,
    flexDirection: isMobile ? 'column' : 'row',
    padding: isMobile ? '1.5rem' : '2rem',
  }
  const formWrapperStyle = {
    ...styles.formWrapper,
    borderRight: isMobile ? 'none' : '1px solid #eee',
    paddingRight: isMobile ? 0 : '1.5rem',
  }
  const tableWrapperStyle = {
    ...styles.tableWrapper,
    flex: isMobile ? '1 1 auto' : '2 1 800px',
  }

  return (
    open && (
      <>
        <div onClick={closeModal} style={styles.modalOverlay} aria-hidden="true" />

        <div role="dialog" aria-modal="true" style={containerStyle} aria-labelledby="modal-title">
          <div style={formWrapperStyle}>
            <h2 id="modal-title" style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
              Gestión de Restaurantes
            </h2>
            <RestauranteForm
              key={editRestaurante ? editRestaurante.id : 'new'}
              restaurante={editRestaurante}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditRestaurante(null)}
              disabled={saving}
            />
          </div>

          <div style={tableWrapperStyle}>
            {loading ? (
              <div style={styles.loading}>Cargando restaurantes...</div>
            ) : error ? (
              <div style={styles.error}>{error}</div>
            ) : restaurantes.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>No hay restaurantes registrados.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Dirección</th>
                    <th style={styles.th}>Teléfono</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Capacidad</th>
                    <th style={styles.th}>Horario</th>
                    <th style={styles.th}>Activo</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantes.map((rest) => (
                    <tr key={rest.id}>
                      <td style={styles.td}>{rest.name}</td>
                      <td style={styles.td}>{rest.address}</td>
                      <td style={styles.td}>{rest.phone}</td>
                      <td style={styles.td}>{rest.email}</td>
                      <td style={styles.td}>{rest.capacity}</td>
                      <td style={styles.td}>{rest.openingTime} - {rest.closingTime}</td>
                      <td style={styles.td}>{rest.isActive ? 'Sí' : 'No'}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setEditRestaurante(rest)}
                          style={styles.buttonPrimary}
                          disabled={saving}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(rest.id)}
                          style={styles.buttonDanger}
                          disabled={saving}
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
        </div>
      </>
    )
  )
}