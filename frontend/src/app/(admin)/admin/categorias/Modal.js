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

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
    },
    modalContainer: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '12px',
      zIndex: 1001,
      width: '95vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '1rem',
    },
    th: {
      border: '1px solid #ccc',
      padding: '8px',
      backgroundColor: '#f0f0f0',
      color: '#333',
      textAlign: 'left',
    },
    td: {
      border: '1px solid #ccc',
      padding: '8px',
      color: '#333',
    },
    buttonPrimary: {
      backgroundColor: '#0070f3',
      color: 'white',
      padding: '0.3rem 0.6rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '0.5rem',
    },
    buttonDanger: {
      backgroundColor: '#e00',
      color: 'white',
      padding: '0.3rem 0.6rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
    },
  }

  return (
    open && (
      <>
        <div
          onClick={onClose}
          style={styles.modalOverlay}
        />

        <div role="dialog" aria-modal="true" style={styles.modalContainer}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
            Gestión de Categorías
          </h2>

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
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map(cat => (
                  <tr key={cat.id}>
                    <td style={styles.td}>{cat.name}</td>
                    <td style={styles.td}>{cat.description || '-'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.buttonPrimary}
                        onClick={() => setEditCategoria(cat)}
                      >
                        Editar
                      </button>
                      <button
                        style={styles.buttonDanger}
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

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#e00',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </>
    )
  )
<<<<<<< HEAD:frontend/src/app/categorias/Modal.js
}
=======
}
>>>>>>> b88896e4b1d9a26072ddd5e0cfa18a8fdf50f4b4:frontend/src/app/(admin)/admin/categorias/Modal.js
