'use client'

import { useState, useEffect } from 'react'

export default function ProductoForm({ producto, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    disponible: true,
    categoryId: '',
    restaurantId: '',
  })

  const [imagenFile, setImagenFile] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [restaurantes, setRestaurantes] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/categorias')
      .then(res => res.json())
      .then(setCategorias)

    fetch('http://localhost:3001/api/restaurantes')
      .then(res => res.json())
      .then(setRestaurantes)
  }, [])

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio?.toString() || '',
        disponible: producto.disponible ?? true,
        categoryId: producto.categoryId || '',
        restaurantId: producto.restaurantId || '',
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: true,
        categoryId: '',
        restaurantId: '',
      })
      setImagenFile(null)
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    setImagenFile(e.target.files[0])  // Guarda el archivo seleccionado
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()

    // Agregar los campos de texto al FormData
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key])
    })

    // Agregar la imagen solo si fue seleccionada
    if (imagenFile) {
      data.append('imagen', imagenFile)
    }

    onSubmit(data)
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
      {['nombre', 'descripcion', 'precio'].map((field) => (
        <input
          key={field}
          name={field}
          placeholder={field}
          value={formData[field]}
          onChange={handleChange}
          required={field === 'nombre'}
          style={inputStyle}
        />
      ))}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={inputStyle}
      />

      <label style={{ marginLeft: '1rem' }}>
        Disponible:
        <input
          type="checkbox"
          name="disponible"
          checked={formData.disponible}
          onChange={handleChange}
          style={{ marginLeft: '0.5rem' }}
        />
      </label>

      <br />

      <select
        name="categoryId"
        value={formData.categoryId}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Seleccione categoría</option>
        {categorias.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <select
        name="restaurantId"
        value={formData.restaurantId}
        onChange={handleChange}
        required
        style={inputStyle}
      >
        <option value="">Seleccione restaurante</option>
        {restaurantes.map(res => (
          <option key={res.id} value={res.id}>{res.name}</option>
        ))}
      </select>

      <br />

      <button
        type="submit"
        style={{ ...buttonStyle, backgroundColor: '#0070f3', color: 'white', marginTop: '0.5rem' }}
      >
        Guardar
      </button>

      {producto && (
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
