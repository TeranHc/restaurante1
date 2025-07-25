'use client'

import React from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaEdit, FaTrash } from 'react-icons/fa'

export default function RestauranteCard({ rest, onEdit, onDelete, saving }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-2">{rest.name}</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{rest.address}</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="mr-2 text-gray-400 flex-shrink-0" />
              <span>{rest.phone}</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{rest.email}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="mr-2 text-gray-400 flex-shrink-0" />
              <span>{rest.opening_time} - {rest.closing_time}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              rest.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {rest.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-md">
            {rest.capacity} personas
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(rest)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          disabled={saving}
        >
          <FaEdit className="text-xs" />
          Editar
        </button>

        <button
          onClick={() => onDelete(rest)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          disabled={saving}
        >
          <FaTrash className="text-xs" />
          Eliminar
        </button>
      </div>
    </div>
  )
}
