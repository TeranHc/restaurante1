//productos/ModalForm.js

'use client'

import { useState, useEffect } from 'react'
import { FaImage, FaTrash, FaUpload, FaCheck, FaTimes } from 'react-icons/fa'

export default function ProductoForm({ producto, onSubmit, onCancel, disabled }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    disponible: true,
    categoryId: '',
    restaurantId: '',
  })

  const [imagenFile, setImagenFile] = useState(null)
  const [eliminarImagen, setEliminarImagen] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [restaurantes, setRestaurantes] = useState([])
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
  fetch('http://localhost:3001/api/categorias')
    .then(res => res.json())
    .then(setCategorias)
    .catch(err => console.error('Error cargando categorías:', err))

  fetch('http://localhost:3001/api/restaurants')
    .then(res => res.json())
    .then(data => {
      const restaurantesActivos = data
        .map(restaurant => ({
          ...restaurant,
          isActive: restaurant.is_active 
        }))
        .filter(restaurant => restaurant.isActive) 
      
      setRestaurantes(restaurantesActivos)
    })
    .catch(err => console.error('Error cargando restaurantes:', err))
  }, [])

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio?.toString() || '',
        disponible: producto.disponible ?? true,
        categoryId: producto.category_id || '',
        restaurantId: producto.restaurant_id || '',
      })
      setEliminarImagen(false)
      setImagenFile(null)
      setImagePreview(null)
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: true,
        categoryId: '',
        restaurantId: '',
      })
      setEliminarImagen(false)
      setImagenFile(null)
      setImagePreview(null)
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagenFile(file)
      setEliminarImagen(false)
      
      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEliminarImagen = () => {
    setEliminarImagen(true)
    setImagenFile(null)
    setImagePreview(null)
  }

const handleSubmit = (e) => {
  e.preventDefault();

  if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
    alert('Ingrese un precio válido mayor que cero');
    return;
  }

  const data = new FormData();
  Object.keys(formData).forEach(key => {
    data.append(key, formData[key]);
  });

  if (imagenFile) data.append('imagen', imagenFile);
  if (eliminarImagen) data.append('eliminarImagen', 'true');

  const token = localStorage.getItem('token'); 
  onSubmit(data, token); // <-- Llama al padre con FormData y token
};

  const getImageUrl = (producto) => {
    if (!producto?.imagen) return null
    return producto.imagen.startsWith('http') 
      ? producto.imagen 
      : `http://localhost:3001${producto.imagen}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Grid principal - 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda - Información básica */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Primera fila - Nombre y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Ej: Pizza Margherita"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={disabled}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 text-sm text-gray-900"
              />
            </div>
            
            <div>
              <label htmlFor="precio" className="block text-sm font-semibold text-gray-700 mb-1">
                Precio ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                  $
                </span>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  disabled={disabled}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 text-sm text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Segunda fila - Categoría y Restaurante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoryId"
                id="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={disabled}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500 appearance-none bg-white text-sm text-gray-900"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="restaurantId" className="block text-sm font-semibold text-gray-700 mb-1">
                Restaurante *
              </label>
              <select
                name="restaurantId"
                id="restaurantId"
                value={formData.restaurantId}
                onChange={handleChange}
                required
                disabled={disabled}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500 appearance-none bg-white text-sm text-gray-900"
              >
                <option value="">Seleccione un restaurante</option>
                {restaurantes.map(res => (
                  <option key={res.id} value={res.id}>{res.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tercera fila - Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={2}
              placeholder="Describe los ingredientes, características especiales..."
              value={formData.descripcion}
              onChange={handleChange}
              disabled={disabled}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 resize-none text-sm text-gray-900"
            />
          </div>

          {/* Cuarta fila - Estado de disponibilidad compacto */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600 text-xs" />
              </div>
              <div>
                <label htmlFor="disponible" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Producto Disponible
                </label>
                <p className="text-xs text-gray-500">
                  Los clientes podrán ordenar este producto
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="disponible"
                id="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Columna derecha - Gestión de imagen */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FaImage className="text-orange-500" />
            Imagen del Producto
          </h4>
          
          {/* Imagen actual */}
          {producto?.imagen && !eliminarImagen && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Imagen Actual
              </label>
              <div className="relative group">
                <img
                  src={getImageUrl(producto)}
                  alt="Imagen actual"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleEliminarImagen}
                    disabled={disabled}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1 disabled:opacity-50 text-sm"
                  >
                    <FaTrash className="text-xs" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview de nueva imagen */}
          {imagePreview && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                Nueva Imagen
              </label>
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border-2 border-orange-200 shadow-sm"
                />
                <div className="absolute top-2 right-2">
                  <div className="bg-green-600 text-white p-1.5 rounded-full shadow-lg">
                    <FaCheck className="text-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload de imagen */}
          {!eliminarImagen && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">
                {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={disabled}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaUpload className="text-orange-600 text-sm" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700">
                      Arrastra o haz clic
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG hasta 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
        <button
          type="submit"
          disabled={disabled}
          className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed text-sm"
        >
          {disabled ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Guardando...
            </>
          ) : (
            <>
              <FaCheck className="text-sm" />
              {producto ? 'Actualizar Producto' : 'Crear Producto'}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:cursor-not-allowed text-sm"
        >
          <FaTimes className="text-sm" />
          Cancelar
        </button>
      </div>
    </form>
  )
}