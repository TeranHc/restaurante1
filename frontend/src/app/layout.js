// src/app/layout.js

import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Restaurante Delicioso',
  description: 'Menú digital y pedidos en línea',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 font-sans">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🍽️ Restaurante Delicioso</h1>
          <nav className="space-x-4">
            <Link href="/">Inicio</Link>
            <Link href="/menu">Menú</Link>
            <Link href="/carrito">Carrito</Link>
          </nav>
        </header>
        <main className="p-4 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  )
}
