const express = require('express')
const router = express.Router()
const prisma = require('../prismaClient')
const upload = require('../multerConfig') // multer configurado
const fs = require('fs')
const path = require('path')

// Listar productos (incluyendo categoría y restaurante)
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      include: {
        category: true,
        restaurant: true,
      },
    })
    res.json(productos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener productos', detalle: error.message })
  }
})

// Crear producto con imagen subida
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible, categoryId, restaurantId } = req.body
    let imagenPath = null

    if (req.file) {
      imagenPath = `/uploads/${req.file.filename}`
    }

    if (!nombre || !categoryId || !restaurantId) {
      return res.status(400).json({ error: 'Nombre, categoryId y restaurantId son obligatorios' })
    }

    const nuevoProducto = await prisma.product.create({
      data: {
        nombre,
        descripcion,
        precio: precio !== undefined ? parseFloat(precio) : 0,
        imagen: imagenPath,
        disponible: disponible === 'true' || disponible === true,
        categoryId: parseInt(categoryId),
        restaurantId: parseInt(restaurantId),
      },
    })

    res.status(201).json(nuevoProducto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear producto', detalle: error.message })
  }
})

// Actualizar producto (permite actualizar o eliminar imagen)
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, disponible, categoryId, restaurantId, eliminarImagen } = req.body

    const productoExistente = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    })
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    let imagenPath = productoExistente.imagen

    // Si sube una nueva imagen
    if (req.file) {
      imagenPath = `/uploads/${req.file.filename}`

      if (productoExistente.imagen) {
        const rutaImagenAnterior = path.join(__dirname, '..', productoExistente.imagen)
        fs.unlink(rutaImagenAnterior, (err) => {
          if (err) console.error('Error eliminando imagen anterior:', err)
        })
      }
    }

    // Si solicita eliminar la imagen
    if (eliminarImagen === 'true') {
      if (productoExistente.imagen) {
        const rutaImagenAnterior = path.join(__dirname, '..', productoExistente.imagen)
        fs.unlink(rutaImagenAnterior, (err) => {
          if (err) console.error('Error eliminando imagen:', err)
        })
      }
      imagenPath = null
    }

    const productoActualizado = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
        precio: precio !== undefined ? parseFloat(precio) : productoExistente.precio,
        imagen: imagenPath,
        disponible: disponible !== undefined ? (disponible === 'true' || disponible === true) : productoExistente.disponible,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : productoExistente.categoryId,
        restaurantId: restaurantId !== undefined ? parseInt(restaurantId) : productoExistente.restaurantId,
      },
    })

    res.json(productoActualizado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message })
  }
})

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const productoExistente = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    })
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Eliminar imagen del servidor (si existe)
    if (productoExistente.imagen) {
      const rutaImagen = path.join(__dirname, '..', productoExistente.imagen)
      fs.unlink(rutaImagen, (err) => {
        if (err) console.error('Error eliminando imagen:', err)
      })
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    })

    res.json({ mensaje: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al eliminar producto', detalle: error.message })
  }
})

module.exports = router
