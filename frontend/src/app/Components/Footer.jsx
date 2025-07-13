// src/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4 mt-10 border-t">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} Restaurante Delicioso. Todos los derechos reservados.
      </p>
    </footer>
  )
}
