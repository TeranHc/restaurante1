const express = require('express')
const cors = require('cors')
require('dotenv').config();

const app = express()
app.use(cors())
app.use(express.json())

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'))

// Importar rutas
const productosRoutes = require('./routes/productos')
const categoriasRoutes = require('./routes/categorias')
const restaurantesRoutes = require('./routes/restaurantes')
const authRoutes = require('./routes/auth');

// Usar rutas
app.use('/api/productos', productosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/restaurantes', restaurantesRoutes)
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`)
})
