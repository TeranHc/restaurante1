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
  }, [restaurante])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const inputStyle = {
    margin: '0.3rem',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #666',
    width: '200px',
    color: '#333',
  }

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      {['name', 'address', 'phone', 'email', 'capacity', 'openingTime', 'closingTime'].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          required={field === 'name'}
          style={inputStyle}
        />
      ))}

      <label style={{ marginLeft: '1rem' }}>
        Activo:
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          style={{ marginLeft: '0.5rem' }}
        />
      </label>

      <br />

      <button
        type="submit"
        style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white', marginTop: '0.5rem' }}
      >
        Guardar
      </button>

      {restaurante && (
        <button
          type="button"
          onClick={onCancel}
          style={{
            ...buttonStyle,
            backgroundColor: '#e00',
            color: 'white',
            marginLeft: '0.5rem',
            marginTop: '0.5rem',
          }}
        >
          Cancelar
        </button>
      )}
    </form>
  )
}
