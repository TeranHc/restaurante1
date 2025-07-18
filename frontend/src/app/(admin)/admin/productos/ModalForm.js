'use client'

import { useState, useEffect } from 'react'

export default function ProductoForm({ producto, onSubmit, onCancel, disabled }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    disponible: true,
    categoryId: '',
    restaurantId: '',
  })

  const [imagenFile, setImagenFile] = useState(null)
  const [eliminarImagen, setEliminarImagen] = useState(false)
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
      setEliminarImagen(false)
      setImagenFile(null)
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        disponible: true,
        categoryId: '',
        restaurantId: '',
      })
      setEliminarImagen(false)
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
    setImagenFile(e.target.files[0])
    setEliminarImagen(false)
  }

  const handleEliminarImagen = () => {
    setEliminarImagen(true)
    setImagenFile(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) <= 0) {
      alert('Ingrese un precio válido mayor que cero')
      return
    }

    const data = new FormData()

    Object.keys(formData).forEach(key => {
      data.append(key, formData[key])
    })

    if (imagenFile) {
      data.append('imagen', imagenFile)
    }

    if (eliminarImagen) {
      data.append('eliminarImagen', 'true')
    }

    onSubmit(data)
  }

  const styles = {
    formGroup: {
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '0.3rem',
      fontWeight: '600',
      fontSize: '0.9rem',
    },
    input: {
      padding: '0.6rem 0.8rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    select: {
      padding: '0.6rem 0.8rem',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem',
    },
    checkboxWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    button: {
      padding: '0.6rem 1.2rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '0.5rem',
    },
    primaryButton: {
      backgroundColor: '#0070f3',
      color: 'white',
    },
    dangerButton: {
      backgroundColor: '#e00',
      color: 'white',
      marginLeft: '0.5rem',
    },
    imagePreview: {
      width: '120px',
      height: 'auto',
      borderRadius: '6px',
      display: 'block',
      marginBottom: '0.5rem',
    },
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem',color: '#111', }}>
      {['nombre', 'descripcion'].map((field) => (
        <div key={field} style={styles.formGroup}>
          <label style={styles.label} htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            id={field}
            name={field}
            placeholder={field}
            value={formData[field]}
            onChange={handleChange}
            required={field === 'nombre'}
            disabled={disabled}
            style={styles.input}
          />
        </div>
      ))}

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="precio">Precio ($)</label>
        <input
          id="precio"
          name="precio"
          placeholder="Precio"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.precio}
          onChange={handleChange}
          required
          disabled={disabled}
          style={styles.input}
        />
      </div>

      {/* {producto?.imagen && !eliminarImagen && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Imagen actual</label>
          <img
            src={producto.imagen}
            alt="Imagen actual"
            style={styles.imagePreview}
          />
          <button
            type="button"
            onClick={handleEliminarImagen}
            style={{ ...styles.button, ...styles.dangerButton }}
            disabled={disabled}
          >
            Eliminar Imagen
          </button>
        </div>
      )} */}

      {!eliminarImagen && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Subir nueva imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={disabled}
            style={styles.input}
          />
        </div>
      )}

      <div style={styles.formGroup}>
        <div style={styles.checkboxWrapper}>
          <label htmlFor="disponible" style={styles.label}>Disponible:</label>
          <input
            type="checkbox"
            name="disponible"
            id="disponible"
            checked={formData.disponible}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="categoryId">Categoría</label>
        <select
          name="categoryId"
          id="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
          disabled={disabled}
          style={styles.select}
        >
          <option value="">Seleccione categoría</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label} htmlFor="restaurantId">Restaurante</label>
        <select
          name="restaurantId"
          id="restaurantId"
          value={formData.restaurantId}
          onChange={handleChange}
          required
          disabled={disabled}
          style={styles.select}
        >
          <option value="">Seleccione restaurante</option>
          {restaurantes.map(res => (
            <option key={res.id} value={res.id}>{res.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        style={{ ...styles.button, ...styles.primaryButton }}
        disabled={disabled}
      >
        Guardar
      </button>

      {producto && (
        <button
          type="button"
          onClick={onCancel}
          style={{ ...styles.button, ...styles.dangerButton }}
          disabled={disabled}
        >
          Cancelar
        </button>
      )}
    </form>
  )
}
