'use client'

import { useState, useEffect } from 'react'
import ProductoForm from './ModalForm'

export default function ModalProductos({ open, onClose }) {
  const [productos, setProductos] = useState([])
  const [editProducto, setEditProducto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data)
    } catch (error) {
      console.error(error)
      alert('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchProductos()
    }
  }, [open])

  const closeModal = () => {
    setEditProducto(null)
    onClose()
  }

  const handleFormSubmit = async (formData) => {
    setSaving(true)
    try {
      let res
      if (editProducto) {
        res = await fetch(`http://localhost:3001/api/productos/${editProducto.id}`, {
          method: 'PUT',
          body: formData,
        })
      } else {
        res = await fetch('http://localhost:3001/api/productos', {
          method: 'POST',
          body: formData,
        })
      }
      if (!res.ok) throw new Error('Error guardando producto')
      await fetchProductos()
      setEditProducto(null)
    } catch (error) {
      console.error(error)
      alert('Error guardando producto')
    } finally {
      setSaving(false)
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
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex',
      gap: '2rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formWrapper: {
      flex: '1 1 350px',
      borderRight: '1px solid #eee',
      paddingRight: '1.5rem',
    },
    tableWrapper: {
      flex: '2 1 700px',
      overflowY: 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
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
    },
    td: {
      borderBottom: '1px solid #eee',
      padding: '10px',
      verticalAlign: 'middle',
      color: '#222',
    },
    buttonPrimary: {
      backgroundColor: '#0070f3',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.25s ease',
    },
    buttonPrimaryHover: {
      backgroundColor: '#005bb5',
    },
    buttonDanger: {
      backgroundColor: '#e00',
      color: 'white',
      padding: '0.4rem 0.9rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.25s ease',
    },
    buttonDangerHover: {
      backgroundColor: '#a00',
    },
  }

  return (
    open && (
      <>
        <div
          onClick={closeModal}
          style={styles.modalOverlay}
        />

        <div role="dialog" aria-modal="true" style={styles.modalContainer}>
          <div style={styles.formWrapper}>
            <ProductoForm
              key={editProducto ? editProducto.id : 'new'}
              producto={editProducto}
              onSubmit={async (formData) => {
                await handleFormSubmit(formData)
                setEditProducto(null)
              }}
              onCancel={() => setEditProducto(null)}
              disabled={saving}
            />
          </div>

          <div style={styles.tableWrapper}>

            {loading ? (
              <p>Cargando productos...</p>
            ) : productos.length === 0 ? (
              <p>No hay productos registrados.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Imagen</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Restaurante</th>
                    <th style={styles.th}>Disponible</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => {
                    const imagenUrl = prod.imagen?.startsWith('http')
                      ? prod.imagen
                      : `http://localhost:3001${prod.imagen}`
                    return (
                      <tr key={prod.id}>
                        <td style={styles.td}>
                          {prod.imagen ? (
                            <img
                              src={imagenUrl}
                              alt={prod.nombre}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ) : (
                            <span>Sin imagen</span>
                          )}
                        </td>
                        <td style={styles.td}>{prod.nombre}</td>
                        <td style={styles.td}>
                          ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
                        </td>
                        <td style={styles.td}>{prod.category?.name}</td>
                        <td style={styles.td}>{prod.restaurant?.name}</td>
                        <td style={styles.td}>{prod.disponible ? 'Sí' : 'No'}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => setEditProducto(prod)}
                            style={styles.buttonPrimary}
                            disabled={saving}
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('¿Seguro que deseas eliminar este producto?')) return
                              try {
                                const res = await fetch(`http://localhost:3001/api/productos/${prod.id}`, {
                                  method: 'DELETE',
                                })
                                if (!res.ok) throw new Error('Error al eliminar producto')
                                await fetchProductos()
                              } catch (error) {
                                console.error(error)
                                alert('Error eliminando producto')
                              }
                            }}
                            style={{ ...styles.buttonDanger, marginLeft: '0.5rem' }}
                            disabled={saving}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    )
  )
}
