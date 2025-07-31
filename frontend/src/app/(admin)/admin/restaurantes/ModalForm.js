'use client'

import { useState, useEffect } from 'react'
import { FaCheck, FaTimes, FaBuilding, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUsers } from 'react-icons/fa'

export default function RestauranteForm({ restaurante, onSubmit, onCancel, disabled }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
    opening_time: '',
    closing_time: '',
    is_active: true,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (restaurante) {
      setFormData({
        name: restaurante.name || '',
        address: restaurante.address || '',
        phone: restaurante.phone || '',
        email: restaurante.email || '',
        capacity: restaurante.capacity !== undefined ? String(restaurante.capacity) : '',
        opening_time: restaurante.opening_time || '',
        closing_time: restaurante.closing_time || '',
        is_active: restaurante.is_active ?? true,
      })
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        capacity: '',
        opening_time: '',
        closing_time: '',
        is_active: true,
      })
    }
    setErrors({})
  }, [restaurante])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
    validateField(name, newValue)
  }

  const validateField = (name, value) => {
    let newErrors = { ...errors }
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors[name] = 'El nombre es obligatorio'
        else delete newErrors[name]
        break
      case 'phone':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) newErrors[name] = 'Debe tener 10 dígitos'
        else delete newErrors[name]
        break
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[name] = 'Email no válido'
        else delete newErrors[name]
        break
      case 'capacity':
        if (value === '' || isNaN(value) || Number(value) <= 0) newErrors[name] = 'Debe ser un número positivo'
        else delete newErrors[name]
        break
      default:
        delete newErrors[name]
    }
    setErrors(newErrors)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    let allErrors = {}

    if (!formData.name.trim()) allErrors.name = 'El nombre es obligatorio'
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) allErrors.phone = 'Debe tener 10 dígitos'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) allErrors.email = 'Email no válido'
    if (formData.capacity === '' || isNaN(formData.capacity) || Number(formData.capacity) <= 0) allErrors.capacity = 'Debe ser un número positivo'

    setErrors(allErrors)

    if (Object.keys(allErrors).length === 0) {
      onSubmit({ ...formData, capacity: Number(formData.capacity) })
    }
  }

  const renderInput = (name, label, type, required, icon) => {
    return (
      <div className="space-y-1">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
          {icon}
          {label} {required && '*'}
        </label>
        <div className="relative">
          <input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            required={required}
            disabled={disabled}
            min={type === 'number' ? '1' : undefined}
            placeholder={`Ej: ${label}`}
            className={`w-full px-3 py-2.5 border ${
              errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
            } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500 text-sm text-gray-900`}
          />
        </div>
        {errors[name] && (
          <p className="text-red-600 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grid principal - 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna izquierda - Información básica */}
        <div className="lg:col-span-2 space-y-5 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
            <FaBuilding className="text-orange-500" />
            Información del Restaurante
          </h3>
          
          {/* Primera fila - Nombre y Capacidad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              {renderInput('name', 'Nombre del Restaurante', 'text', true, 
                <FaBuilding className="text-orange-500 text-sm" />
              )}
            </div>
            
            <div>
              {renderInput('capacity', 'Capacidad', 'number', true,
                <FaUsers className="text-orange-500 text-sm" />
              )}
            </div>
          </div>

          {/* Segunda fila - Dirección */}
          <div>
            {renderInput('address', 'Dirección', 'text', false,
              <FaMapMarkerAlt className="text-orange-500 text-sm" />
            )}
          </div>

          {/* Tercera fila - Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {renderInput('phone', 'Teléfono', 'tel', false,
                <FaPhone className="text-orange-500 text-sm" />
              )}
            </div>
            <div>
              {renderInput('email', 'Email', 'email', false,
                <FaEnvelope className="text-orange-500 text-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Horarios y estado */}
        <div className="space-y-5">
          {/* Horarios */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
              <FaClock className="text-orange-500" />
              Horario de Atención
            </h3>
            
            <div className="space-y-3">
              {renderInput('opening_time', 'Hora de Apertura', 'time', false,
                <FaClock className="text-orange-500 text-sm" />
              )}
              
              {renderInput('closing_time', 'Hora de Cierre', 'time', false,
                <FaClock className="text-orange-500 text-sm" />
              )}
            </div>
          </div>
          
          {/* Estado */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${formData.is_active ? 'bg-green-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                  <FaCheck className={`${formData.is_active ? 'text-green-600' : 'text-gray-400'} text-xs`} />
                </div>
                <div>
                  <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    Restaurante Activo
                  </label>
                  <p className="text-xs text-gray-500">
                    Los clientes podrán ver y ordenar de este restaurante
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="relative w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
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
              {restaurante ? 'Actualizar Restaurante' : 'Crear Restaurante'}
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