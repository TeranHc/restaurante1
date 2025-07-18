// src/app/layout.js
import './globals.css'

import LayoutWithHeader from './Components/LayoutWithHeader'

export const metadata = {
  title: 'Restaurante Delicioso',
  description: 'Menú digital y pedidos en línea',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
<<<<<<< HEAD
      <body className="bg-gray-50 text-gray-900 font-sans flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        <main className="flex-grow mt-1">{children}</main>
        <Footer />
=======
      <body className="overflow-x-hidden bg-gray-50 text-gray-900 font-sans flex flex-col min-h-screen">
        <LayoutWithHeader>{children}</LayoutWithHeader>
>>>>>>> b88896e4b1d9a26072ddd5e0cfa18a8fdf50f4b4
      </body>
    </html>
  )
}