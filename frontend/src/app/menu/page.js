'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Tags, Store, Search, X } from "lucide-react"; 

export default function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
 
  // Hook para navegación
  const router = useRouter();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchProductos = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/productos')
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProductos(data.filter(p => p.disponible))
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categories?.name).filter(Boolean))].sort()

  // Filtrar productos
  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || producto.categories?.name === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header - Sin modificaciones */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            
            {/* Título */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Nuestro Menú
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Descubre nuestros deliciosos productos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            
            {/* Contador de productos y debug info */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {filteredProductos.length} producto{filteredProductos.length !== 1 ? 's' : ''} encontrado{filteredProductos.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-slate-400">
                | {categorias.length} categoría{categorias.length !== 1 ? 's' : ''}
              </span>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-9 py-2 w-64 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro por categoría */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-40 text-gray-900"
              >
                <option value="">Seleccione categoria</option>
                {categorias.length > 0 ? (
                  categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria} 
                    </option>
                  ))
                ) : (
                  <option disabled>No hay categorías disponibles</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Tarjetas mejoradas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 text-lg">Cargando productos...</p>
            </div>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || selectedCategory ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </h3>
            <p className="text-slate-500">
              {searchTerm || selectedCategory 
                ? 'Intenta ajustar tus filtros de búsqueda' 
                : 'Vuelve pronto para ver nuestras últimas ofertas'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProductos.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  {prod.imagen ? (
                    <img
                      src={prod.imagen?.startsWith('http') 
                        ? prod.imagen 
                        : `http://localhost:3001${prod.imagen}`}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Badge de categoría - Siempre visible */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                      {prod.categories?.name || 'Sin categoría'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {prod.nombre}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {prod.descripcion}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-green-600">
                        ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
                      </span>
                      {prod.restaurante && (
                        <span className="text-xs text-slate-500 mt-1">
                          {prod.restaurante}
                        </span>
                      )}
                    </div>
                    
                    {/* redirecciona a la pagina de agregar opciones */}
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/opcionesmenu?productId=${prod.id}&productName=${encodeURIComponent(
                            prod.nombre
                          )}&basePrice=${prod.precio}&productImage=${encodeURIComponent(prod.imagen)}`
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}