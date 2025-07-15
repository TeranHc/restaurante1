// src/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-gray-300 py-10 mt-16 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-600/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Columna 1: Nombre y eslogan */}
          <div>
            <h2 className="text-xl font-semibold text-amber-400">Bella Vista</h2>
            <p className="text-sm mt-2 text-amber-200">Cocina Gourmet • Experiencia Única</p>
          </div>

          {/* Columna 2: Enlaces útiles */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-200">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/menu" className="hover:text-amber-400 transition">Carta</a></li>
              <li><a href="/reservas" className="hover:text-amber-400 transition">Reservas</a></li>
              <li><a href="/eventos" className="hover:text-amber-400 transition">Eventos</a></li>
              <li><a href="/contacto" className="hover:text-amber-400 transition">Contacto</a></li>
            </ul>
          </div>

          {/* Columna 3: Información legal o redes */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-200">Contacto</h3>
            <p className="text-sm">Quito, Ecuador</p>
            <p className="text-sm">+593 987 654 321</p>
            <p className="text-sm">info@bellavista.com</p>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Bella Vista. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
