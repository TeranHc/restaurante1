'use client'

import { useState, useEffect } from 'react'

export default function RestauranteForm({ restaurante, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    capacity: '',
    openingTime: '',
    closingTime: '',
    isActive: true,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (restaurante) {
      setFormData(restaurante)
    } else {
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        capacity: '',
        openingTime: '',
        closingTime: '',
        isActive: true,
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
        if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) newErrors[name] = 'Debe tener 10 dígitos'
        else delete newErrors[name]
        break
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[name] = 'Email no válido'
        else delete newErrors[name]
        break
      case 'capacity':
        if (isNaN(value) || value <= 0) newErrors[name] = 'Debe ser un número positivo'
        else delete newErrors[name]
        break
      default:
        delete newErrors[name]
    }
    setErrors(newErrors)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const allErrors = {}
    Object.keys(formData).forEach((key) => validateField(key, formData[key]))
    if (Object.keys(allErrors).length === 0) {
      onSubmit(formData)
    } else {
      setErrors(allErrors)
    }
  }

  const inputStyle = {
    margin: '0.5rem 0',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    width: '100%',
    fontSize: '1rem',
    color: '#333',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    '&:focus': {
      borderColor: '#0070f3',
      boxShadow: '0 0 5px rgba(0, 112, 243, 0.5)',
      outline: 'none',
    },
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: '600',
    color: '#444',
  }

  const errorStyle = {
    color: '#e00',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  }

  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s, transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }

  const formContainer = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '1rem 0',
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  }

  return (
    <form onSubmit={handleSubmit} style={formContainer}>
      {[
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'address', label: 'Dirección', type: 'text' },
        { name: 'phone', label: 'Teléfono', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'capacity', label: 'Capacidad', type: 'number', min: '1' },
        { name: 'openingTime', label: 'Hora de Apertura', type: 'time' },
        { name: 'closingTime', label: 'Hora de Cierre', type: 'time' },
      ].map(({ name, label, type, required }) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={labelStyle}>{label}</label>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required={required}
            style={inputStyle}
            placeholder={`Ingrese ${label.toLowerCase()}`}
            min={type === 'number' ? '1' : undefined}
          />
          {errors[name] && <span style={errorStyle}>{errors[name]}</span>}
        </div>
      ))}

      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', marginTop: '0rem' }}>
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          style={{ marginRight: '0.5rem' }}
        />
        <label style={{ ...labelStyle, margin: 0 }}>Activo</label>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0rem' }}>
        <button
          type="submit"
          style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
        >
          Guardar
        </button>
        {restaurante && (
          <button
            type="button"
            onClick={onCancel}
            style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}