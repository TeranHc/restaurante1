const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Listar restaurantes
router.get('/', async (req, res) => {
  try {
    const restaurantes = await prisma.restaurant.findMany();
    res.json(restaurantes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener restaurantes', detalle: error.message });
  }
});

// Crear restaurante
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, email, capacity, openingTime, closingTime, isActive } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser un texto' });
    }
    // Puedes añadir más validaciones si quieres (email válido, phone formato, etc.)

    const nuevoRestaurante = await prisma.restaurant.create({
      data: {
        name,
        address,
        phone,
        email,
        capacity: capacity ? parseInt(capacity) : null,
        openingTime,
        closingTime,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(nuevoRestaurante);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear restaurante', detalle: error.message });
  }
});

// Actualizar restaurante
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, capacity, openingTime, closingTime, isActive } = req.body;

    const restauranteExistente = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });
    if (!restauranteExistente) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    const restauranteActualizado = await prisma.restaurant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        address,
        phone,
        email,
        capacity: capacity ? parseInt(capacity) : null,
        openingTime,
        closingTime,
        isActive,
      },
    });

    res.json(restauranteActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar restaurante', detalle: error.message });
  }
});

// Eliminar restaurante
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const restauranteExistente = await prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
    });
    if (!restauranteExistente) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    await prisma.restaurant.delete({
      where: { id: parseInt(id) },
    });
    res.json({ mensaje: 'Restaurante eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar restaurante', detalle: error.message });
  }
});

module.exports = router;
