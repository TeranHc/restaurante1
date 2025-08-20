'use client'

import { useState, useEffect } from 'react'

export default function DisponibilidadForm({ slot, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    restaurantId: '',
    date: '',
    time: '',
    maxCapacity: '',
    currentReservations: '',
    isAvailable: true,
  })
  const [restaurants, setRestaurants] = useState([])

  // Cargar restaurantes
  const fetchRestaurants = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/restaurants')
      if (res.ok) {
        const data = await res.json()
        setRestaurants(data)
      }
    } catch (error) {
      console.error('Error cargando restaurantes:', error)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (slot) {
      setFormData({
        restaurantId: slot.restaurant_id?.toString() || '',
        date: slot.date || '',
        time: slot.time?.slice(0, 5) || '',
        maxCapacity: slot.max_capacity?.toString() || '',
        currentReservations: slot.current_reservations?.toString() || '',
        isAvailable: slot.is_available ?? true,
      })
    } else {
      setFormData({
        restaurantId: '',
        date: '',
        time: '',
        maxCapacity: '',
        currentReservations: '',
        isAvailable: true,
      })
    }
  }, [slot])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validación: current_reservations no puede ser mayor que max_capacity
    const currentReservations = parseInt(formData.currentReservations) || 0
    const maxCapacity = parseInt(formData.maxCapacity) || 0
    
    if (currentReservations > maxCapacity) {
      alert('Las reservas actuales no pueden ser mayores que la capacidad máxima')
      return
    }

    const formattedData = {
      ...formData,
      restaurantId: parseInt(formData.restaurantId) || 0,
      maxCapacity: maxCapacity,
      currentReservations: currentReservations,
      isAvailable: !!formData.isAvailable,
    }

    onSubmit(formattedData)
  }

  const inputStyle = {
    margin: '0.3rem',
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #666',
    width: '200px',
    color: '#333',
  }

  const selectStyle = {
    ...inputStyle,
    backgroundColor: 'white',
  }

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  }

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h3 style={{ marginTop: '0', color: '#333' }}>
        {slot ? 'Editar Horario Disponible' : 'Nuevo Horario Disponible'}
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        <select
          name="restaurantId"
          value={formData.restaurantId}
          onChange={handleChange}
          required
          style={selectStyle}
        >
          <option value="">Seleccionar Restaurante</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={inputStyle}
          min={today}
        />
        
        <input
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        
        <input
          name="maxCapacity"
          type="number"
          placeholder="Capacidad máxima"
          value={formData.maxCapacity}
          onChange={handleChange}
          required
          style={inputStyle}
          min="1"
          max="100"
        />
        
        <input
          name="currentReservations"
          type="number"
          placeholder="Reservas actuales"
          value={formData.currentReservations}
          onChange={handleChange}
          required
          style={inputStyle}
          min="0"
        />
        
        <label style={{ 
          marginLeft: '1rem', 
          display: 'flex', 
          alignItems: 'center',
          color: '#333',
          fontSize: '0.9rem'
        }}>
          <input
            type="checkbox"
            name="isAvailable"
            checked={!!formData.isAvailable}
            onChange={handleChange}
            style={{ marginRight: '0.5rem' }}
          />
          Disponible
        </label>
      </div>

      {/* Información adicional */}
      <div style={{ 
        marginTop: '0.5rem', 
        padding: '0.5rem', 
        backgroundColor: '#e9ecef', 
        borderRadius: '4px',
        fontSize: '0.8rem',
        color: '#6c757d'
      }}>
        <p style={{ margin: '0' }}>
          💡 <strong>Tip:</strong> Las reservas actuales no pueden superar la capacidad máxima. 
          Desmarcar &apos;Disponible&apos; bloquea este horario para nuevas reservas.
        </p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="submit"
          style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
        >
          {slot ? 'Actualizar' : 'Crear'} Horario
        </button>

        {slot && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...buttonStyle,
              backgroundColor: '#e00',
              color: 'white',
              marginLeft: '0.5rem',
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}