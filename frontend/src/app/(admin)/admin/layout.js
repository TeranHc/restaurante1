import '../../globals.css'
import LayoutWithHeader from './LayoutWithHeader'

export const metadata = {
  title: 'Restaurante Delicioso',
  description: 'Menú digital y pedidos en línea',
}

export default function AdminLayout({ children }) {
  return (
    <html lang="es">
        <body className="overflow-x-hidden bg-gray-50 text-gray-900 font-sans flex-col min-h-screen">
          <LayoutWithHeader>
            {children}
          </LayoutWithHeader>
        </body>
    </html>
  );
}