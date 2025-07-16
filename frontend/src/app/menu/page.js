'use client'

import { useState, useEffect } from 'react'

export default function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data.filter(p => p.disponible))  // Mostrar solo disponibles
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  return (
    <div style={{ padding: '1rem', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>Menú</h1>

      {loading ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {productos.map(prod => (
            <div
              key={prod.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                width: '200px',
                padding: '0.5rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              {prod.imagen ? (
                <img
                  src={prod.imagen}
                  alt={prod.nombre}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: '#eee',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '6px',
                    color: '#888',
                  }}
                >
                  Sin imagen
                </div>
              )}
              <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0 0.2rem 0' }}>{prod.nombre}</h3>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>{prod.descripcion}</p>
              <p style={{ fontWeight: 'bold', marginTop: '0.3rem' }}>
                ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
