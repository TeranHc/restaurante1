'use client'

import { useState, useEffect } from 'react'
import ModalProductos from '../productos/Modal'  // Ajusta la ruta si es necesario

export default function MenuPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)  // Estado para el modal

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900 text-center">
            Nuestro Menú
          </h1>
          <p className="text-slate-600 text-center mt-2">
            Descubre nuestros deliciosos productos
          </p>

          {/* Botón para abrir el modal */}
          <div className="text-center mt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-200"
            >
              Gestionar Productos
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* PASAMOS onClose para que el modal pueda cerrarse */}
              <ModalProductos open={modalOpen} onClose={() => setModalOpen(false)} />
              <div className="mt-4 text-right">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-slate-600 text-lg">Cargando productos...</p>
            </div>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-slate-500">
              Vuelve pronto para ver nuestras últimas ofertas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-slate-200 hover:border-slate-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  {prod.imagen ? (
                    <img
                      src={`http://localhost:3001${prod.imagen}`}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-slate-400 text-sm">Sin imagen</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {prod.nombre}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {prod.descripcion}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">
                      ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Agregar
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
