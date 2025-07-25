'use client'

import { useState, useEffect } from 'react'

export default function ReservaForm({ reserva, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    userId: '',
    restaurantId: '',
    reservationDate: '',
    reservationTime: '',
    partySize: '',
    status: 'PENDING',
    specialRequests: '',
  })

  useEffect(() => {
    if (reserva) {
      setFormData({
        userId: reserva.user_id?.toString() || '',
        restaurantId: reserva.restaurant_id?.toString() || '',
        reservationDate: reserva.reservation_date || '',
        reservationTime: reserva.reservation_time?.slice(0, 5) || '',
        partySize: reserva.party_size?.toString() || '',
        status: reserva.status || 'PENDING',
        specialRequests: reserva.special_requests || '',
      })
    } else {
      setFormData({
        userId: '',
        restaurantId: '',
        reservationDate: '',
        reservationTime: '',
        partySize: '',
        status: 'PENDING',
        specialRequests: '',
      })
    }
  }, [reserva])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formattedData = {
      ...formData,
      userId: parseInt(formData.userId) || 0,
      restaurantId: parseInt(formData.restaurantId) || 0,
      partySize: parseInt(formData.partySize) || 0,
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

  const textareaStyle = {
    ...inputStyle,
    width: '400px',
    height: '80px',
    resize: 'vertical',
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
        {reserva ? 'Editar Reserva' : 'Nueva Reserva'}
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <input
            name="userId"
            type="number"
            placeholder="ID Usuario"
            value={formData.userId}
            onChange={handleChange}
            required
            style={inputStyle}
            min="1"
          />
          
          <input
            name="restaurantId"
            type="number"
            placeholder="ID Restaurante"
            value={formData.restaurantId}
            onChange={handleChange}
            required
            style={inputStyle}
            min="1"
          />
          
          <input
            name="reservationDate"
            type="date"
            value={formData.reservationDate}
            onChange={handleChange}
            required
            style={inputStyle}
            min={today}
          />
          
          <input
            name="reservationTime"
            type="time"
            value={formData.reservationTime}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        
        <div>
          <input
            name="partySize"
            type="number"
            placeholder="Número de personas"
            value={formData.partySize}
            onChange={handleChange}
            required
            style={inputStyle}
            min="1"
            max="20"
          />
          
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
      </div>
      
      <div style={{ marginTop: '0.5rem' }}>
        <textarea
          name="specialRequests"
          placeholder="Solicitudes especiales (opcional)"
          value={formData.specialRequests}
          onChange={handleChange}
          style={textareaStyle}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="submit"
          style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
        >
          {reserva ? 'Actualizar' : 'Crear'} Reserva
        </button>

        {reserva && (
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