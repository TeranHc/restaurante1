import './globals.css'

import LayoutWithHeader from './Components/LayoutWithHeader'

export const metadata = {
  title: 'Restaurante Delicioso',
  description: 'Menú digital y pedidos en línea',
}

export default function RootLayout({ children }) {
  return (
    <html >
      <body className="overflow-x-hidden bg-gray-50 text-gray-900 font-sans flex flex-col min-h-screen">
        <LayoutWithHeader>{children}</LayoutWithHeader>
      </body>
    </html>
  )
}