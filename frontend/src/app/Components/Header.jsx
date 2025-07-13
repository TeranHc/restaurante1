// src/components/Header.jsx

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">🍽️ Restaurante Delicioso</h1>
      <nav className="space-x-4">
        <Link href="/">Inicio</Link>
        <Link href="/menu">Menú</Link>
        <Link href="/carrito">Carrito</Link>
      </nav>
    </header>
  )
}
