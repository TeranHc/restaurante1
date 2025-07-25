'use client'

import { useState, useEffect } from 'react'
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaBoxOpen, FaImage } from 'react-icons/fa'
import ProductoForm from './ModalForm'

export default function ModalProductos({ open, onClose }) {
  const [productos, setProductos] = useState([])
  const [editProducto, setEditProducto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [filterRestaurante, setFilterRestaurante] = useState('')
  const [filterDisponible, setFilterDisponible] = useState('')

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
      setShowForm(false)
      setEditProducto(null)
    }
  }, [open])

  const closeModal = () => {
    setEditProducto(null)
    setShowForm(false)
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
      setShowForm(false)
    } catch (error) {
      console.error(error)
      alert('Error guardando producto')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (producto) => {
    setEditProducto(producto)
    setShowForm(true)
  }

  const handleNewProducto = () => {
    setEditProducto(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditProducto(null)
    setShowForm(false)
  }

  const handleDelete = async (producto) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/productos/${producto.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar producto')
      await fetchProductos()
    } catch (error) {
      console.error(error)
      alert('Error eliminando producto')
    }
  }

  // Ordenar columnas
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  // Filtrar y ordenar productos
  const filteredAndSortedProductos = [...productos]
    .filter(prod => {
      const matchesSearch = 
        prod.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (prod.descripcion || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesCategoria = !filterCategoria || prod.categories?.name === filterCategoria
      const matchesRestaurante = !filterRestaurante || prod.restaurants?.name === filterRestaurante
      const matchesDisponible = filterDisponible === '' || 
        (filterDisponible === 'true' ? prod.disponible : !prod.disponible)

      return matchesSearch && matchesCategoria && matchesRestaurante && matchesDisponible
    })
    .sort((a, b) => {
      if (!sortColumn) return 0
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]
      
      // Manejar casos especiales
      if (sortColumn === 'categories') {
        aVal = a.categories?.name || ''
        bVal = b.categories?.name || ''
      } else if (sortColumn === 'restaurants') {
        aVal = a.restaurants?.name || ''
        bVal = b.restaurants?.name || ''
      } else if (sortColumn === 'precio') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      }
      
      aVal = aVal || ''
      bVal = bVal || ''
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const renderSortIcon = (column) => {
    if (sortColumn !== column) return <FaSort className="inline ml-1 text-gray-400" />
    return sortOrder === 'asc'
      ? <FaSortUp className="inline ml-1 text-blue-600" />
      : <FaSortDown className="inline ml-1 text-blue-600" />
  }

  const getImageUrl = (producto) => {
    if (!producto.imagen) return null
    return producto.imagen.startsWith('http') 
      ? producto.imagen 
      : `http://localhost:3001${producto.imagen}`
  }

  // Obtener opciones únicas para filtros
  const categorias = [...new Set(productos.map(p => p.categories?.name).filter(Boolean))]
  const restaurantes = [...new Set(productos.map(p => p.restaurants?.name).filter(Boolean))]

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={closeModal} 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
      />

      {/* Modal */}
      <div 
        role="dialog" 
        aria-modal="true" 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 w-[95vw] max-w-7xl shadow-2xl border border-gray-200"
        style={{ height: 'min(92vh, 900px)' }}
      >
        <div className="h-full flex flex-col">
          {/* Header del modal */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                  <FaBoxOpen className="text-white text-sm" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gestión de Productos
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra el catálogo de productos de tu sistema
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center transition-colors group"
              >
                <FaTimes className="text-gray-500 group-hover:text-gray-700" />
              </button>
            </div>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editProducto ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                  <button
                    onClick={handleCancelForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                <ProductoForm
                  key={editProducto ? editProducto.id : 'new'}
                  producto={editProducto}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelForm}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Productos
                </h3>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                  {filteredAndSortedProductos.length} encontrados
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-10">
                {/* Filtros */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterRestaurante}
                    onChange={(e) => setFilterRestaurante(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="">Todos los restaurantes</option>
                    {restaurantes.map(rest => (
                      <option key={rest} value={rest}>{rest}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filterDisponible}
                    onChange={(e) => setFilterDisponible(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    <option value="">Todos</option>
                    <option value="true">Disponibles</option>
                    <option value="false">No disponibles</option>
                  </select>
                </div>

                {/* Buscador */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="pl-10 pr-4 py-2.5 w-64 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all text-gray-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
                
                {/* Botón nuevo producto */}
                <button
                  onClick={handleNewProducto}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Nuevo Producto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Cargando productos...</p>
                </div>
              ) : filteredAndSortedProductos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaBoxOpen className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {search || filterCategoria || filterRestaurante || filterDisponible !== '' ? 'Sin resultados' : 'No hay productos'}
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {search || filterCategoria || filterRestaurante || filterDisponible !== ''
                      ? 'No se encontraron productos que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.' 
                      : 'Comienza creando tu primer producto para mostrar en tu catálogo.'
                    }
                  </p>
                  {!search && !filterCategoria && !filterRestaurante && filterDisponible === '' && (
                    <button
                      onClick={handleNewProducto}
                      className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Crear primer producto
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-6 py-4">
                  {/* Vista de tabla para pantallas grandes */}
                  <div className="hidden xl:block">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-20">
                              Imagen
                            </th>
                            <th
                              onClick={() => handleSort('nombre')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Nombre {renderSortIcon('nombre')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('precio')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Precio {renderSortIcon('precio')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('categories')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Categoría {renderSortIcon('categories')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('restaurants')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Restaurante {renderSortIcon('restaurants')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('disponible')}
                              className="px-6 py-4 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center justify-center">
                                Estado {renderSortIcon('disponible')}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-32">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredAndSortedProductos.map((prod, index) => (
                            <tr key={prod.id} className="hover:bg-orange-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                {getImageUrl(prod) ? (
                                  <img
                                    src={getImageUrl(prod)}
                                    alt={prod.nombre}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                    <FaImage className="text-gray-400 text-sm" />
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{prod.nombre}</div>
                                {prod.descripcion && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {prod.descripcion}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-green-600">
                                  ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                  {prod.categories?.name || 'Sin categoría'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-gray-600">
                                  {prod.restaurants?.name || 'Sin restaurante'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  prod.disponible 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {prod.disponible ? 'Disponible' : 'No disponible'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(prod)}
                                    className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                    title="Editar"
                                    disabled={saving}
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(prod)}
                                    className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                                    title="Eliminar"
                                    disabled={saving}
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Vista de tarjetas para pantallas medianas y pequeñas */}
                  <div className="xl:hidden">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredAndSortedProductos.map(prod => (
                        <div key={prod.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              {getImageUrl(prod) ? (
                                <img
                                  src={getImageUrl(prod)}
                                  alt={prod.nombre}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <FaImage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {prod.nombre}
                              </h4>
                              <p className="text-lg font-bold text-green-600 mt-1">
                                ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                  {prod.categories?.name || 'Sin categoría'}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                  prod.disponible 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {prod.disponible ? 'Disponible' : 'No disponible'}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-500 mt-1">
                                {prod.restaurants?.name || 'Sin restaurante'}
                              </p>
                              
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleEdit(prod)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                  disabled={saving}
                                >
                                  <FaEdit className="text-xs" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(prod)}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                  disabled={saving}
                                >
                                  <FaTrash className="text-xs" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {productos.length} productos
                {(search || filterCategoria || filterRestaurante || filterDisponible !== '') && 
                  ` • ${filteredAndSortedProductos.length} encontrados`
                }
              </div>
              <button
                onClick={closeModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}