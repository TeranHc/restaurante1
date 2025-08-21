'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import { CartProvider } from '../../Carrito/CartContext' // <-- CORREGIDO

export default function LayoutWithHeader({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <CartProvider>
      {isAdmin && <Header />}
      <main className="flex-grow">{children}</main>
      {isAdmin && <Footer />}
    </CartProvider>
  )
}
