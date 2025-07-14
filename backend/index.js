const express = require('express')
const cors = require('cors')
require('dotenv').config()

const prisma = require('./prismaClient')

const app = express()
app.use(cors())
app.use(express.json())

// Listar productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany()
    res.json(productos)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' })
  }
})

// Crear producto
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, disponible } = req.body
    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        imagen,
        categoria,
        disponible: disponible ?? true,
      },
    })
    res.status(201).json(nuevoProducto)
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' })
  }
})

// Actualizar producto
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, imagen, categoria, disponible } = req.body
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        imagen,
        categoria,
        disponible,
      },
    })
    res.json(productoActualizado)
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' })
  }
})

// Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.producto.delete({
      where: { id: parseInt(id) },
    })
    res.json({ mensaje: 'Producto eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`)
})
