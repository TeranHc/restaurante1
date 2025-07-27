import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';

const SlotModal = ({ slot, restaurants, selectedDate, selectedRestaurant, onSubmit, onClose, onDelete }) => {
  const [formData, setFormData] = useState({
    restaurantId: '',
    date: '',
    isAvailable: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (slot) {
      setFormData({
        restaurantId: slot.restaurant_id?.toString() || '',
        date: slot.date || '',
        isAvailable: slot.is_available ?? true
      });
    } else {
      setFormData({
        restaurantId: selectedRestaurant || '',
        date: selectedDate || new Date().toISOString().split('T')[0],
        isAvailable: true
      });
    }
  }, [slot, selectedDate, selectedRestaurant]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Selecciona un restaurante';
    }

    if (!formData.date) {
      newErrors.date = 'Selecciona una fecha';
    } else {
      // Comparar solo las fechas, sin horas
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      if (selectedDate < todayDate) {
        newErrors.date = 'La fecha no puede ser anterior a hoy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        restaurant_id: Number(formData.restaurantId),
        date: formData.date,
        is_available: formData.isAvailable
      };

      const url = slot
        ? `http://localhost:3001/api/available-slots/${slot.id}`
        : 'http://localhost:3001/api/available-slots';

      const response = await fetch(url, {
        method: slot ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar el slot');
      }

      onSubmit();
    } catch (error) {
      console.error('Error guardando slot:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!slot) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3001/api/available-slots/${slot.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al eliminar el slot');
      }

      if (onDelete) {
        onDelete(slot.id);
      }
      onClose();
      
      // Recargar la página para actualizar el calendario
      window.location.reload();
    } catch (error) {
      console.error('Error eliminando slot:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find(r => r.id === parseInt(id));
    return restaurant ? restaurant.name : '';
  };

  // Confirmation Dialog Component
  const DeleteConfirmDialog = () => (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Eliminar Disponibilidad
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            ¿Estás seguro de que deseas eliminar esta disponibilidad? Esta acción no se puede deshacer.
          </p>
          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">
            <p><strong>Restaurante:</strong> {getRestaurantName(formData.restaurantId)}</p>
            <p><strong>Fecha:</strong> {new Date(formData.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {slot ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {slot ? 'Modifica la disponibilidad del restaurante' : 'Configura la disponibilidad del restaurante para una fecha'}
              </p>
            </div>
              <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Restaurante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurante *
                </label>
                <select
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.restaurantId ? 'border-red-300' : 'border-gray-300'
                  } text-black`}
                >
                  <option value="">Seleccionar Restaurante</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                {errors.restaurantId && (
                  <p className="mt-1 text-sm text-red-600">{errors.restaurantId}</p>
                )}
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  } text-black`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              {/* Estado de Disponibilidad */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Restaurante disponible para reservas
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-7">
                  Si está deshabilitado, los clientes no podrán hacer reservas en esta fecha
                </p>
              </div>
            </div>

            {/* Resumen */}
            {formData.restaurantId && formData.date && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen de Disponibilidad</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Restaurante:</strong> {getRestaurantName(formData.restaurantId)}</p>
                  <p><strong>Fecha:</strong> {new Date(formData.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      formData.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {formData.isAvailable ? 'Disponible' : 'No Disponible'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
              </div>
              
              <div className="flex space-x-3">
                {slot && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting || isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {slot ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>{slot ? 'Actualizar Disponibilidad' : 'Crear Disponibilidad'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && <DeleteConfirmDialog />}
    </>
  );
};

export default SlotModal;