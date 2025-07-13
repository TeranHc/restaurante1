'use client'

import { useState } from 'react'

export default function MenuPage() {
  const [productos] = useState([
    {
      id: 1,
      nombre: 'Hamburguesa BBQ',
      descripcion: 'Con cebolla caramelizada, queso cheddar y salsa BBQ',
      precio: 7.5,
      imagen: '/burger.jpg',
    },
    {
      id: 2,
      nombre: 'Pizza Pepperoni',
      descripcion: 'Clásica pizza con pepperoni y mozzarella',
      precio: 9.0,
      imagen: '/pizza.jpg',
    },
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menú</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <div key={producto.id} className="bg-white p-4 shadow rounded">
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <h3 className="text-lg font-semibold">{producto.nombre}</h3>
            <p className="text-gray-600">{producto.descripcion}</p>
            <p className="text-green-700 font-bold">${producto.precio.toFixed(2)}</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded mt-2 hover:bg-green-700">
              Añadir al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
