import { FaEdit, FaTrash, FaImage } from 'react-icons/fa';

export default function ProductoCard({ prod, saving, onEdit, onDelete, getImageUrl }) {
  {/* Vista de tarjetas para pantallas medianas y pequeñas */}
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getImageUrl(prod) ? (
            <img
              src={getImageUrl(prod)}
              alt={prod.nombre}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <FaImage className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{prod.nombre}</h4>
          <p className="text-lg font-bold text-green-600 mt-1">
            ${!isNaN(Number(prod.precio)) ? Number(prod.precio).toFixed(2) : '0.00'}
          </p>

          <div className="flex flex-wrap gap-1 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
              {prod.categories?.name || 'Sin categoría'}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md ${
                prod.disponible
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {prod.disponible ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            {prod.restaurants?.name || 'Sin restaurante'}
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onEdit(prod)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              disabled={saving}
            >
              <FaEdit className="text-xs" />
              Editar
            </button>
            <button
              onClick={() => onDelete(prod)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              disabled={saving}
            >
              <FaTrash className="text-xs" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
