'use client'

import { useState, useEffect } from 'react'
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaUtensils, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import RestauranteForm from './ModalForm'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

export default function ModalRestaurantes({ open, onClose }) {
  const [restaurantes, setRestaurantes] = useState([])
  const [editRestaurante, setEditRestaurante] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')
  const [filterActivo, setFilterActivo] = useState('')

  const fetchRestaurantes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants`)
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
      setShowForm(false)
      setEditRestaurante(null)
      setError(null)
    }
  }, [open])

  const closeModal = () => {
    setEditRestaurante(null)
    setError(null)
    setShowForm(false)
    onClose()
  }

  const handleFormSubmit = async (formData) => {
    console.log('Enviando al backend:', formData)
    setSaving(true)
    setError(null)
    try {
      const url = editRestaurante
        ? `${API_BASE_URL}/restaurants/${editRestaurante.id}`
        : `${API_BASE_URL}/restaurants`
      const method = editRestaurante ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error guardando restaurante')
      }
      await fetchRestaurantes()
      setEditRestaurante(null)
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (restaurante) => {
    setEditRestaurante(restaurante)
    setShowForm(true)
    setError(null)
  }

  const handleNewRestaurante = () => {
    setEditRestaurante(null)
    setShowForm(true)
    setError(null)
  }

  const handleCancelForm = () => {
    setEditRestaurante(null)
    setShowForm(false)
    setError(null)
  }

  const handleDelete = async (restaurante) => {
    if (!confirm('¿Seguro que deseas eliminar este restaurante?')) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/restaurants/${restaurante.id}`, {
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

  // Ordenar columnas
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  // Filtrar y ordenar restaurantes
  const filteredAndSortedRestaurantes = [...restaurantes]
    .filter(rest => {
      const matchesSearch = 
        rest.name.toLowerCase().includes(search.toLowerCase()) ||
        (rest.address || '').toLowerCase().includes(search.toLowerCase()) ||
        (rest.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (rest.phone || '').toLowerCase().includes(search.toLowerCase())
      
      const matchesActivo = filterActivo === '' || 
        (filterActivo === 'true' ? rest.isActive : !rest.isActive)

      return matchesSearch && matchesActivo
    })
    .sort((a, b) => {
      if (!sortColumn) return 0
      let aVal = a[sortColumn]
      let bVal = b[sortColumn]
      
      // Manejar casos especiales
      if (sortColumn === 'capacity') {
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
      ? <FaSortUp className="inline ml-1 text-purple-600" />
      : <FaSortDown className="inline ml-1 text-purple-600" />
  }

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
        aria-labelledby="modal-title"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 w-[95vw] max-w-7xl shadow-2xl border border-gray-200"
        style={{ height: 'min(92vh, 900px)' }}
      >
        <div className="h-full flex flex-col">
          {/* Header del modal */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <FaUtensils className="text-white text-sm" />
                </div>
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                    Gestión de Restaurantes
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra la red de restaurantes de tu sistema
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

          {/* Error Message */}
          {error && (
            <div className="flex-shrink-0 px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <FaTimes className="text-sm" />
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editRestaurante ? 'Editar Restaurante' : 'Nuevo Restaurante'}
                  </h3>
                  <button
                    onClick={handleCancelForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                <RestauranteForm
                  key={editRestaurante ? editRestaurante.id : 'new'}
                  restaurante={editRestaurante}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelForm}
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* Controls Section */}
          <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Restaurantes
                </h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  {filteredAndSortedRestaurantes.length} encontrados
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Filtros */}
                <div className="flex gap-2">
                  <select
                    value={filterActivo}
                    onChange={(e) => setFilterActivo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                </div>

                {/* Buscador */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Buscar restaurantes..."
                    className="pl-10 pr-4 py-2.5 w-64 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
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
                
                {/* Botón nuevo restaurante */}
                <button
                  onClick={handleNewRestaurante}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Nuevo Restaurante</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Cargando restaurantes...</p>
                </div>
              ) : filteredAndSortedRestaurantes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaUtensils className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {search || filterActivo !== '' ? 'Sin resultados' : 'No hay restaurantes'}
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {search || filterActivo !== ''
                      ? 'No se encontraron restaurantes que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.' 
                      : 'Comienza creando tu primer restaurante para gestionar tu red de establecimientos.'
                    }
                  </p>
                  {!search && filterActivo === '' && (
                    <button
                      onClick={handleNewRestaurante}
                      className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Crear primer restaurante
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
                            <th
                              onClick={() => handleSort('name')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Nombre {renderSortIcon('name')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('address')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Dirección {renderSortIcon('address')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('phone')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Teléfono {renderSortIcon('phone')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('email')}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center">
                                Email {renderSortIcon('email')}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSort('capacity')}
                              className="px-6 py-4 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center justify-center">
                                Capacidad {renderSortIcon('capacity')}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                              Horario
                            </th>
                            <th
                              onClick={() => handleSort('isActive')}
                              className="px-6 py-4 text-center text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                            >
                              <div className="flex items-center justify-center">
                                Estado {renderSortIcon('isActive')}
                              </div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-32">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredAndSortedRestaurantes.map((rest, index) => (
                            <tr key={rest.id} className="hover:bg-purple-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{rest.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-600 max-w-xs truncate" title={rest.address}>
                                  <FaMapMarkerAlt className="inline mr-1 text-gray-400" />
                                  {rest.address}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-600">
                                  <FaPhone className="inline mr-1 text-gray-400" />
                                  {rest.phone}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-600 max-w-xs truncate" title={rest.email}>
                                  <FaEnvelope className="inline mr-1 text-gray-400" />
                                  {rest.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                                  {rest.capacity} personas
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-sm text-gray-600">
                                  <FaClock className="inline mr-1 text-gray-400" />
                                  {rest.opening_time} - {rest.closing_time}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  rest.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {rest.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleEdit(rest)}
                                    className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                    title="Editar"
                                    disabled={saving}
                                  >
                                    <FaEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(rest)}
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredAndSortedRestaurantes.map(rest => (
                        <div key={rest.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                                {rest.name}
                              </h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{rest.address}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaPhone className="mr-2 text-gray-400 flex-shrink-0" />
                                  <span>{rest.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaEnvelope className="mr-2 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{rest.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaClock className="mr-2 text-gray-400 flex-shrink-0" />
                                  <span>{rest.opening_time} - {rest.closing_time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                rest.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {rest.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
                                {rest.capacity} personas
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleEdit(rest)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                              disabled={saving}
                            >
                              <FaEdit className="text-xs" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(rest)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                              disabled={saving}
                            >
                              <FaTrash className="text-xs" />
                              Eliminar
                            </button>
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
                Total: {restaurantes.length} restaurantes
                {(search || filterActivo !== '') && 
                  ` • ${filteredAndSortedRestaurantes.length} encontrados`
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