import '../../globals.css'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export const metadata = {
  title: 'Restaurante Delicioso',
  description: 'Menú digital y pedidos en línea',
}

export default function AdminLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-grow mt-1">{children}</main>
      <Footer />
    </>
  );
}