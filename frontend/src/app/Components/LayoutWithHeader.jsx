// src/app/Components/LayoutWithHeader.jsx
'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export default function LayoutWithHeader({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdmin && <Footer />}
    </>
  )
}
