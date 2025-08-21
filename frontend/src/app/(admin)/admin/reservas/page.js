'use client'

import { useState, useEffect } from 'react'
import ReservaForm from './ReservaForm'

export default function Page() {
  const [reservas, setReservas] = useState([])
  const [editReserva, setEditReserva] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchReservas = async () => {
    setLoading(true)
    try {
      // Obtener token de localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No estás autenticado.')
        setLoading(false)
        return
      }

      // ✅ CORREGIDO: Usar variable de entorno en lugar de localhost hardcodeado
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (res.status === 403) {
        alert('Acceso denegado. No tienes permisos para ver reservas.')
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error('Error al cargar reservas')
      const data = await res.json()
      setReservas(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  const onFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No estás autenticado.')
        return
      }

      const data = {
        user_id: formData.userId, // Mantener como string UUID
        restaurant_id: Number(formData.restaurantId),
        reservation_date: formData.reservationDate,
        reservation_time: formData.reservationTime,
        party_size: Number(formData.partySize),
        status: formData.status,
        special_requests: formData.specialRequests,
      }

      console.log('✅ Datos preparados para enviar:', data)
      console.log('user_id type:', typeof data.user_id, 'value:', data.user_id)
      console.log('user_id length:', data.user_id ? data.user_id.length : 'undefined')

      // ✅ CORREGIDO: Usar variable de entorno en lugar de localhost hardcodeado
      const url = editReserva
        ? `${process.env.NEXT_PUBLIC_API_URL}/reservations/${editReserva.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/reservations`

      const res = await fetch(url, {
        method: editReserva ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', res.status)

      if (res.status === 403) {
        alert('Acceso denegado. No tienes permisos para modificar reservas.')
        return
      }

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.message || errorData.error || 'Error al guardar reserva')
      }

      await fetchReservas()
      setEditReserva(null)
      alert(editReserva ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente')
    } catch (error) {
      alert(error.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar esta reserva?')) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('No estás autenticado.')
        return
      }

      // ✅ CORREGIDO: Usar variable de entorno en lugar de localhost hardcodeado
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 403) {
        alert('Acceso denegado. No tienes permisos para eliminar reservas.')
        return
      }

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al eliminar reserva')
      }

      await fetchReservas()
      alert('Reserva eliminada correctamente')
    } catch (error) {
      alert(error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return '#28a745'
      case 'PENDING': return '#ffc107'
      case 'CANCELLED': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '1rem',
  }

  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    textAlign: 'left',
  }

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    color: '#333',
  }

  const buttonStyle = {
    marginRight: '0.5rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: 'white', minHeight: '100vh', color: '#333' }}>
      <h1>Reservas</h1>

      <ReservaForm
        reserva={editReserva}
        onSubmit={onFormSubmit}
        onCancel={() => setEditReserva(null)}
      />

      {loading ? (
        <p>Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Restaurante</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Hora</th>
              <th style={thStyle}>Personas</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Solicitudes Especiales</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td style={tdStyle}>{reserva.id}</td>
                <td style={tdStyle}>{reserva.user_id}</td>
                <td style={tdStyle}>{reserva.restaurant_id}</td>
                <td style={tdStyle}>{formatDate(reserva.reservation_date)}</td>
                <td style={tdStyle}>{reserva.reservation_time}</td>
                <td style={tdStyle}>{reserva.party_size}</td>
                <td style={{
                  ...tdStyle,
                  color: getStatusColor(reserva.status),
                  fontWeight: 'bold'
                }}>
                  {reserva.status}
                </td>
                <td style={tdStyle}>
                  {reserva.special_requests ? 
                    (reserva.special_requests.length > 30 ? 
                      reserva.special_requests.substring(0, 30) + '...' : 
                      reserva.special_requests
                    ) : 
                    '-'
                  }
                </td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
                    onClick={() => setEditReserva(reserva)}
                  >
                    Editar
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
                    onClick={() => onDelete(reserva.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}