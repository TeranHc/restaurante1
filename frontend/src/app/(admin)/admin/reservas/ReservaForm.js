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
  const [users, setUsers] = useState([])
  const [restaurants, setRestaurants] = useState([])

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const res = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.status === 403) {
        console.error('Acceso denegado para cargar usuarios')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        console.error('Error al cargar usuarios:', res.status)
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    }
  }

  // Cargar restaurantes
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const res = await fetch('http://localhost:3001/api/restaurants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.status === 403) {
        console.error('Acceso denegado para cargar restaurantes')
        return
      }

      if (res.ok) {
        const data = await res.json()
        setRestaurants(data)
      } else {
        console.error('Error al cargar restaurantes:', res.status)
      }
    } catch (error) {
      console.error('Error cargando restaurantes:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRestaurants()
  }, [])

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

    // Validar que userId no esté vacío
    if (!formData.userId) {
      alert('Por favor selecciona un usuario')
      return
    }

    if (!formData.restaurantId) {
      alert('Por favor selecciona un restaurante')
      return
    }

    const formattedData = {
      ...formData,
      userId: formData.userId, // Mantener como string UUID
      restaurantId: parseInt(formData.restaurantId) || 0,
      partySize: parseInt(formData.partySize) || 0,
    }

    console.log('FormData antes de enviar:', formattedData)
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
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            style={selectStyle}
          >
            <option value="">Seleccionar Usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} 
              </option>
            ))}
          </select>
          
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