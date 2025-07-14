// backend/index.js

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const prisma = require('./prismaClient')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/productos', async (req, res) => {
  const productos = await prisma.producto.findMany()
  res.json(productos)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`)
})
