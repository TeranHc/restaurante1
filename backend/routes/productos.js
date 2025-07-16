const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Listar productos (incluyendo categoría y restaurante)
router.get('/', async (req, res) => {
  try {
    const productos = await prisma.product.findMany({
      include: {
        category: true,
        restaurant: true,
      },
    });
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos', detalle: error.message });
  }
});

// Crear producto (requiere categoryId y restaurantId)
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, disponible, categoryId, restaurantId } = req.body;

    if (!nombre || !categoryId || !restaurantId) {
      return res.status(400).json({ error: 'Nombre, categoryId y restaurantId son obligatorios' });
    }

    const nuevoProducto = await prisma.product.create({
      data: {
        nombre,
        descripcion,
        precio: precio !== undefined ? parseFloat(precio) : 0,
        imagen,
        disponible: disponible !== undefined ? disponible : true,
        categoryId: parseInt(categoryId),
        restaurantId: parseInt(restaurantId),
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto', detalle: error.message });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen, disponible, categoryId, restaurantId } = req.body;

    // Verificar si el producto existe
    const productoExistente = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActualizado = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        descripcion,
        precio: precio !== undefined ? parseFloat(precio) : productoExistente.precio,
        imagen,
        disponible,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : productoExistente.categoryId,
        restaurantId: restaurantId !== undefined ? parseInt(restaurantId) : productoExistente.restaurantId,
      },
    });

    res.json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto', detalle: error.message });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const productoExistente = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto', detalle: error.message });
  }
});

module.exports = router;
