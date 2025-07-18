'use client'

import { useState, useEffect } from 'react'

export default function CategoriaForm({ categoria, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (categoria) {
      setName(categoria.name)
      setDescription(categoria.description)
    } else {
      setName('')
      setDescription('')
    }
  }, [categoria])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    onSubmit({ name, description })
    setName('')
    setDescription('')
  }

  const inputStyle = {
    marginRight: '1rem',
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
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={inputStyle}
      />
      <button
        type="submit"
        style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white' }}
      >
        Guardar
      </button>
      {categoria && (
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
    </form>
  )
}
