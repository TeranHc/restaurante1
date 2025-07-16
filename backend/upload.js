const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const prisma = require('./prismaClient')  // Ajusta la ruta si está en otra carpeta

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')  // Carpeta donde guardarás las imágenes
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

// Ruta para subir producto con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, disponible, categoryId, restaurantId } = req.body
    const imagenRuta = req.file ? req.file.filename : null

    if (!nombre || !categoryId || !restaurantId) {
      return res.status(400).json({ error: 'Nombre, categoryId y restaurantId son obligatorios' })
    }

    const nuevoProducto = await prisma.product.create({
      data: {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        imagen: imagenRuta,
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

module.exports = router
