'use client'

import { useState, useEffect } from 'react'
import DisponibilidadForm from './DisponibilidadForm'

export default function Page() {
  const [slots, setSlots] = useState([])
  const [editSlot, setEditSlot] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/available-slots')
      if (!res.ok) throw new Error('Error al cargar horarios disponibles')
      const data = await res.json()
      setSlots(data)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const onFormSubmit = async (formData) => {
    try {
      const data = {
        restaurant_id: Number(formData.restaurantId),
        date: formData.date,
        time: formData.time,
        max_capacity: Number(formData.maxCapacity),
        current_reservations: Number(formData.currentReservations),
        is_available: formData.isAvailable,
      }

      console.log('✅ Datos preparados para enviar:', data)

      const url = editSlot
        ? `http://localhost:3001/api/available-slots/${editSlot.id}`
        : 'http://localhost:3001/api/available-slots'

      const res = await fetch(url, {
        method: editSlot ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar horario disponible')

      await fetchSlots()
      setEditSlot(null)
    } catch (error) {
      alert(error.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este horario disponible?')) return
    try {
      const res = await fetch(`http://localhost:3001/api/available-slots/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Error al eliminar horario disponible')
      await fetchSlots()
    } catch (error) {
      alert(error.message)
    }
  }

  const getAvailabilityColor = (slot) => {
    if (!slot.is_available) return '#dc3545' // Rojo - No disponible
    if (slot.current_reservations >= slot.max_capacity) return '#ffc107' // Amarillo - Lleno
    return '#28a745' // Verde - Disponible
  }

  const getAvailabilityText = (slot) => {
    if (!slot.is_available) return 'No Disponible'
    if (slot.current_reservations >= slot.max_capacity) return 'Lleno'
    return 'Disponible'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getCapacityText = (slot) => {
    return `${slot.current_reservations}/${slot.max_capacity}`
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
      <h1>Horarios Disponibles</h1>

      <DisponibilidadForm
        slot={editSlot}
        onSubmit={onFormSubmit}
        onCancel={() => setEditSlot(null)}
      />

      {loading ? (
        <p>Cargando horarios disponibles...</p>
      ) : slots.length === 0 ? (
        <p>No hay horarios disponibles registrados.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Restaurante</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Hora</th>
              <th style={thStyle}>Capacidad</th>
              <th style={thStyle}>Disponibilidad</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.id}>
                <td style={tdStyle}>{slot.id}</td>
                <td style={tdStyle}>{slot.restaurant_id}</td>
                <td style={tdStyle}>{formatDate(slot.date)}</td>
                <td style={tdStyle}>{slot.time}</td>
                <td style={tdStyle}>{getCapacityText(slot)}</td>
                <td style={{
                  ...tdStyle,
                  color: getAvailabilityColor(slot),
                  fontWeight: 'bold'
                }}>
                  {getAvailabilityText(slot)}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: slot.is_available ? '#d4edda' : '#f8d7da',
                    color: slot.is_available ? '#155724' : '#721c24',
                    fontSize: '0.8rem'
                  }}>
                    {slot.is_available ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
                    onClick={() => setEditSlot(slot)}
                  >
                    Editar
                  </button>
                  <button
                    style={{ ...buttonStyle, backgroundColor: '#e00', color: 'white' }}
                    onClick={() => onDelete(slot.id)}
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