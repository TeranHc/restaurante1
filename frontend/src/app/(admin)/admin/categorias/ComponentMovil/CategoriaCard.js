import { FaEdit, FaTrash } from 'react-icons/fa'

export default function CategoriaCard({ categoria, onEdit, onDelete, responsive = 'md' }) {
  const { id, name, description } = categoria
  {/* Vista de tarjetas para móviles */}
  if (responsive === 'mobile') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 text-base mb-2">{name}</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description || <span className="text-gray-400 italic">Sin descripción</span>}
          </p>
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onEdit(categoria)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaEdit className="text-sm" />
            Editar
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaTrash className="text-sm" />
            Eliminar
          </button>
        </div>
      </div>
    )
  }
  {/* Vista de tarjetas para pantallas medianas */}
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-2">{name}</h4>
          <p className="text-gray-600 leading-relaxed">
            {description || <span className="text-gray-400 italic">Sin descripción</span>}
          </p>
        </div>
        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(categoria)}
            className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl flex items-center justify-center transition-colors"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-colors"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  )
}
