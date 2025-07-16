'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit3, Trash2, Save, X, Search, Filter, Image, DollarSign, Tag, FileText, Building2 } from 'lucide-react'

export default function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoryId: '',
    restaurantId: '',
  })
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

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

  const filteredProductos = productos.filter(producto => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAgregar = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:3001/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          categoryId: parseInt(formData.categoryId),
          restaurantId: parseInt(formData.restaurantId),
          disponible: true,
        }),
      })
      if (!res.ok) throw new Error('Error al agregar producto')
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        categoryId: '',
        restaurantId: '',
      })
      setShowAddForm(false)
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditarInit = (producto) => {
    setEditId(producto.id)
    setEditData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      categoryId: producto.categoryId,
      restaurantId: producto.restaurantId,
      disponible: producto.disponible,
    })
  }

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGuardarEdicion = async (id) => {
    try {
      const res = await fetch('http://localhost:3001/api/productos/${id}', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          precio: parseFloat(editData.precio),
          categoryId: parseInt(editData.categoryId),
          restaurantId: parseInt(editData.restaurantId),
        }),
      })
      if (!res.ok) throw new Error('Error al actualizar producto')
      setEditId(null)
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCancelarEdicion = () => {
    setEditId(null)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      const res = await fetch('http://localhost:3001/api/productos/${id}', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar producto')
      fetchProductos()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddForm ? 'Cerrar formulario' : 'Agregar Producto'}
        </button>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                name="nombre"
                placeholder="Nombre del producto"
                value={formData.nombre}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
              <input
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
              <input
                name="precio"
                type="number"
                placeholder="Precio"
                value={formData.precio}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
              <input
                name="imagen"
                placeholder="URL Imagen"
                value={formData.imagen}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
              <input
                name="categoryId"
                type="number"
                placeholder="ID Categoría"
                value={formData.categoryId}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
              <input
                name="restaurantId"
                type="number"
                placeholder="ID Restaurante"
                value={formData.restaurantId}
                onChange={handleChange}
                className="p-3 border rounded-lg"
              />
            </div>

            <button
              onClick={handleAgregar}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              Agregar Producto
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductos.map(producto => (
            <div key={producto.id} className="bg-white p-4 rounded-xl border shadow-sm">
              {editId === producto.id ? (
                <>
                  <input
                    name="nombre"
                    value={editData.nombre}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />
                  <textarea
                    name="descripcion"
                    value={editData.descripcion}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />
                  <input
                    name="precio"
                    type="number"
                    value={editData.precio}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />
                  <input
                    name="imagen"
                    value={editData.imagen}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />
                  <input
                    name="categoryId"
                    type="number"
                    value={editData.categoryId}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />
                  <input
                    name="restaurantId"
                    type="number"
                    value={editData.restaurantId}
                    onChange={handleEditChange}
                    className="p-2 border rounded w-full mb-2"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGuardarEdicion(producto.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                      <Save size={16} className="inline mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelarEdicion}
                      className="flex-1 bg-gray-500 text-white py-2 rounded-lg"
                    >
                      <X size={16} className="inline mr-1" />
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {producto.imagen && (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-bold text-lg">{producto.nombre}</h3>
                  <p className="text-gray-600">{producto.descripcion}</p>
                  <p className="font-bold text-green-600 mt-2">${producto.precio.toFixed(2)}</p>
                  <p className="text-sm mt-1">
                    Categoría: {producto.category?.name || 'Sin categoría'}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditarInit(producto)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                    >
                      <Edit3 size={16} className="inline mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(producto.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}