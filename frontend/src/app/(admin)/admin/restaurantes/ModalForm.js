'use client'

import { useState, useEffect } from 'react'

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
        is_active: restaurante.is_active !== undefined ? restaurante.is_active : true,
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
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: disabled ? '#99c2ff' : '#0070f3',
    color: 'white',
    transition: 'background-color 0.3s, transform 0.2s',
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
        { name: 'opening_time', label: 'Hora de Apertura', type: 'time' },
        { name: 'closing_time', label: 'Hora de Cierre', type: 'time' },
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
            disabled={disabled}
          />
          {errors[name] && <span style={errorStyle}>{errors[name]}</span>}
        </div>
      ))}

      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', marginTop: '0rem' }}>
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          disabled={disabled}
          style={{ marginRight: '0.5rem' }}
        />
        <label style={{ ...labelStyle, margin: 0 }}>Activo</label>
      </div>

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0rem' }}>
        <button type="submit" style={buttonStyle} disabled={disabled}>
          Guardar
        </button>
        {restaurante && (
          <button
            type="button"
            onClick={onCancel}
            style={{ ...buttonStyle, backgroundColor: '#e00', cursor: disabled ? 'not-allowed' : 'pointer' }}
            disabled={disabled}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
