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
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '1rem',
    fontSize: '1rem',
    color: '#333',
  }

  const buttonStyle = {
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem',color: '#111', }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500' }}>
          Nombre de la categoría
        </label>
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500' }}>
          Descripción (opcional)
        </label>
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
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
            }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
<<<<<<< HEAD:frontend/src/app/categorias/ModalForm.js
}
=======
}
>>>>>>> b88896e4b1d9a26072ddd5e0cfa18a8fdf50f4b4:frontend/src/app/(admin)/admin/categorias/ModalForm.js
