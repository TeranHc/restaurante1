// src/app/menu/page.js

async function getProductos() {
  const res = await fetch('http://localhost:3001/api/productos', {
    // Importante para que no se cachee en desarrollo
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error('Error al cargar productos')
  }
  return res.json()
}

export default async function MenuPage() {
  const productos = await getProductos()

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Menú de Productos</h1>
      {productos.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {productos.map((producto) => (
            <li key={producto.id} style={{ marginBottom: '1.5rem' }}>
              <h3>{producto.nombre}</h3>
              <p>{producto.descripcion}</p>
              <p>Precio: ${producto.precio.toFixed(2)}</p>
              {producto.imagen && (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  style={{ width: '150px', height: 'auto' }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
