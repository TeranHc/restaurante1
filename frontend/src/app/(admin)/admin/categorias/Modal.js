import { useState, useEffect } from 'react'
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaTimes, FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa'
import CategoriaForm from './ModalForm'
import CategoriaCard from './ComponentMovil/CategoriaCard'

export default function ModalCategorias({ open, onClose }) {
  const [categorias, setCategorias] = useState([])
  const [editCategoria, setEditCategoria] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState(null)
  const [sortOrder, setSortOrder] = useState('asc')

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
      setShowForm(false)
      setEditCategoria(null)
    }
  }, [open])

  const closeModal = () => {
    setEditCategoria(null)
    setShowForm(false)
    onClose()
  }

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
      setShowForm(false)
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

  const handleEdit = (categoria) => {
    setEditCategoria(categoria)
    setShowForm(true)
  }

  const handleNewCategoria = () => {
    setEditCategoria(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditCategoria(null)
    setShowForm(false)
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

  const sortedCategorias = [...categorias]
    .filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortColumn) return 0
      const aVal = a[sortColumn] || ''
      const bVal = b[sortColumn] || ''
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
          {/* Header del modal - Siempre fijo */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FaTags className="text-white text-sm" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gestión de Categorías
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra las categorías de tu sistema
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

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto">
            {/* Form Section */}
            {showForm && (
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h3>
                    <button
                      onClick={handleCancelForm}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <CategoriaForm
                    categoria={editCategoria}
                    onSubmit={onFormSubmit}
                    onCancel={handleCancelForm}
                  />
                </div>
              </div>
            )}

            {/* Controls Section - Sticky */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Categorías
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {sortedCategorias.length} encontradas
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Buscador */}
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Buscar categorías..."
                      className="pl-10 pr-4 py-2.5 w-64 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all text-gray-900"
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
                  
                  {/* Botón nueva categoría */}
                  <button
                    onClick={handleNewCategoria}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    <FaPlus className="text-sm" />
                    <span className="hidden sm:inline">Nueva Categoría</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Cargando categorías...</p>
                </div>
              ) : sortedCategorias.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaTags className="text-gray-400 text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {search ? 'Sin resultados' : 'No hay categorías'}
                  </h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {search 
                      ? 'No se encontraron categorías que coincidan con tu búsqueda. Intenta con otros términos.' 
                      : 'Comienza creando tu primera categoría para organizar mejor tu contenido.'
                    }
                  </p>
                  {!search && (
                    <button
                      onClick={handleNewCategoria}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Crear primera categoría
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  {/* Vista de tabla para pantallas grandes */}
                  <div className="hidden lg:block">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th
                                onClick={() => handleSort('name')}
                                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none w-[250px]"
                              >
                                <div className="flex items-center">
                                  Nombre {renderSortIcon('name')}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSort('description')}
                                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors select-none w-[400px]"
                              >
                                <div className="flex items-center">
                                  Descripción {renderSortIcon('description')}
                                </div>
                              </th>
                              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-[100px]">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sortedCategorias.map((cat, index) => (
                              <tr key={cat.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="px-4 py-4">
                                  <div className="font-medium text-gray-900 truncate" title={cat.name}>
                                    {cat.name}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="text-gray-600 truncate" title={cat.description || 'Sin descripción'}>
                                    {cat.description || (
                                      <span className="text-gray-400 italic">Sin descripción</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleEdit(cat)}
                                      className="w-7 h-7 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
                                      title="Editar"
                                    >
                                      <FaEdit className="text-xs" />
                                    </button>
                                    <button
                                      onClick={() => onDelete(cat.id)}
                                      className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
                                      title="Eliminar"
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
                  </div>

                  {/* Vista de tarjetas para pantallas medianas */}
                  <div className="hidden md:block lg:hidden">
                    <div className="grid gap-4">
                      {sortedCategorias.map(cat => (
                        <CategoriaCard
                          key={cat.id}
                          categoria={cat}
                          onEdit={handleEdit}
                          onDelete={onDelete}
                          responsive="md"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Vista de tarjetas para móviles */}
                  <div className="md:hidden space-y-4">
                    {sortedCategorias.map(cat => (
                      <CategoriaCard
                        key={cat.id}
                        categoria={cat}
                        onEdit={handleEdit}
                        onDelete={onDelete}  
                        responsive="mobile"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Siempre fijo */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {categorias.length} categorías
                {search && ` • ${sortedCategorias.length} encontradas`}
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