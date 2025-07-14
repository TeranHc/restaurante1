'use client'

import { useEffect, useState } from 'react'

export default function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: '',
  })
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

  // Cargar productos
  const fetchProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('http://localhost:3001/api/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching productos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  // Manejar cambios en el formulario de agregar
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Agregar producto
  const handleAgregar = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:3001/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          disponible: true,
        }),
      })
      if (!res.ok) throw new Error('Error al agregar producto')
      setFormData({ nombre: '', descripcion: '', precio: '', imagen: '', categoria: '' })
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  // Iniciar edición
  const handleEditarInit = (producto) => {
    setEditId(producto.id)
    setEditData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      categoria: producto.categoria,
      disponible: producto.disponible,
    })
  }

  // Manejar cambios en edición
  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Guardar edición
  const handleGuardarEdicion = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          precio: parseFloat(editData.precio),
        }),
      })
      if (!res.ok) throw new Error('Error al actualizar producto')
      setEditId(null)
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setEditId(null)
  }

  // Eliminar producto
  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar producto')
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Menú de Productos</h1>

        {/* Formulario Agregar Producto */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Agregar Producto</h2>
          <div className="space-y-4">
            <div>
              <input 
                name="nombre" 
                placeholder="Nombre del producto" 
                value={formData.nombre} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <textarea 
                name="descripcion" 
                placeholder="Descripción del producto" 
                value={formData.descripcion} 
                onChange={handleChange} 
                required 
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input 
                name="precio" 
                type="number" 
                placeholder="Precio" 
                value={formData.precio} 
                onChange={handleChange} 
                required 
                min="0" 
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input 
                name="imagen" 
                type="url" 
                placeholder="URL de imagen (opcional)" 
                value={formData.imagen} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input 
                name="categoria" 
                placeholder="Categoría" 
                value={formData.categoria} 
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handleAgregar}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Productos Disponibles</h2>
          
          {loading && <p className="text-gray-500">Cargando productos...</p>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded">{error}</p>}

          {productos.length === 0 && !loading ? (
            <p className="text-gray-500">No hay productos disponibles.</p>
          ) : (
            <div className="space-y-4">
              {productos.map((producto) => (
                <div key={producto.id} className="border border-gray-200 rounded-lg p-4">
                  {editId === producto.id ? (
                    <div className="space-y-3">
                      <input 
                        name="nombre" 
                        value={editData.nombre} 
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <textarea 
                        name="descripcion" 
                        value={editData.descripcion} 
                        onChange={handleEditChange} 
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input 
                        name="precio" 
                        type="number" 
                        value={editData.precio} 
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input 
                        name="imagen" 
                        value={editData.imagen} 
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input 
                        name="categoria" 
                        value={editData.categoria} 
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGuardarEdicion(producto.id)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button 
                          onClick={handleCancelarEdicion}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
                      <p className="text-gray-600 mb-2">{producto.descripcion}</p>
                      <p className="text-gray-700"><strong>Precio:</strong> ${producto.precio?.toFixed(2)}</p>
                      <p className="text-gray-700"><strong>Categoría:</strong> {producto.categoria}</p>
                      {producto.imagen && (
                        <img 
                          src={producto.imagen} 
                          alt={producto.nombre} 
                          className="mt-2 w-32 h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => handleEditarInit(producto)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleEliminar(producto.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}