const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Listar categorías
router.get('/', async (req, res) => {
  try {
    const categorias = await prisma.category.findMany();
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías', detalle: error.message });
  }
});

// Crear categoría
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser un texto' });
    }

    const nuevaCategoria = await prisma.category.create({
      data: { name, description }
    });
    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear categoría', detalle: error.message });
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const categoriaExistente = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });
    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const categoriaActualizada = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, description }
    });

    res.json(categoriaActualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar categoría', detalle: error.message });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaExistente = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });
    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar categoría', detalle: error.message });
  }
});

module.exports = router;
