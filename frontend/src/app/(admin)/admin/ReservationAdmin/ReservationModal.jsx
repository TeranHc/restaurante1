import React, { useState, useEffect } from 'react';
import { X, AlertCircle, User, MapPin, Calendar, Clock, Users } from 'lucide-react';

const ReservationModal = ({ reservation, selectedDate, selectedRestaurant, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    userId: '',
    restaurantId: '',
    reservationDate: '',
    reservationTime: '',
    partySize: '',
    status: 'PENDING',
    specialRequests: ''
  });
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const res = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 403) {
        console.error('Acceso denegado para cargar usuarios');
        setErrors(prev => ({ ...prev, submit: 'Acceso denegado para cargar usuarios' }));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        console.error('Error al cargar usuarios:', res.status);
        setErrors(prev => ({ ...prev, submit: 'Error al cargar usuarios' }));
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setErrors(prev => ({ ...prev, submit: 'Error de conexión al cargar usuarios' }));
    }
  };

  // Cargar restaurantes
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const res = await fetch('http://localhost:3001/api/restaurants', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 403) {
        console.error('Acceso denegado para cargar restaurantes');
        setErrors(prev => ({ ...prev, submit: 'Acceso denegado para cargar restaurantes' }));
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
      } else {
        console.error('Error al cargar restaurantes:', res.status);
        setErrors(prev => ({ ...prev, submit: 'Error al cargar restaurantes' }));
      }
    } catch (error) {
      console.error('Error cargando restaurantes:', error);
      setErrors(prev => ({ ...prev, submit: 'Error de conexión al cargar restaurantes' }));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (reservation) {
      setFormData({
        userId: reservation.user_id?.toString() || '',
        restaurantId: reservation.restaurant_id?.toString() || '',
        reservationDate: reservation.reservation_date || '',
        reservationTime: reservation.reservation_time?.slice(0, 5) || '',
        partySize: reservation.party_size?.toString() || '',
        status: reservation.status || 'PENDING',
        specialRequests: reservation.special_requests || ''
      });
    } else {
      setFormData({
        userId: '',
        restaurantId: selectedRestaurant || '',
        reservationDate: selectedDate || new Date().toISOString().split('T')[0],
        reservationTime: '',
        partySize: '',
        status: 'PENDING',
        specialRequests: ''
      });
    }
  }, [reservation, selectedDate, selectedRestaurant]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'Selecciona un usuario';
    }

    if (!formData.restaurantId) {
      newErrors.restaurantId = 'Selecciona un restaurante';
    }

    if (!formData.reservationDate) {
      newErrors.reservationDate = 'Selecciona una fecha';
    } else {
      const selectedDate = new Date(formData.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.reservationDate = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.reservationTime) {
      newErrors.reservationTime = 'Selecciona una hora';
    }

    const partySize = parseInt(formData.partySize);
    if (!formData.partySize || partySize < 1) {
      newErrors.partySize = 'El número de personas debe ser mayor a 0';
    } else if (partySize > 20) {
      newErrors.partySize = 'El número de personas no puede superar 20';
    }

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(formData.status)) {
      newErrors.status = 'Selecciona un estado válido';
    }

    if (formData.specialRequests && formData.specialRequests.length > 500) {
      newErrors.specialRequests = 'Las solicitudes especiales no pueden superar 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado.');
      }

      const data = {
        user_id: formData.userId, // Mantener como string UUID
        restaurant_id: Number(formData.restaurantId),
        reservation_date: formData.reservationDate,
        reservation_time: formData.reservationTime,
        party_size: Number(formData.partySize),
        status: formData.status,
        special_requests: formData.specialRequests,
      };

      console.log('✅ Datos preparados para enviar:', data);
      console.log('user_id type:', typeof data.user_id, 'value:', data.user_id);
      console.log('user_id length:', data.user_id ? data.user_id.length : 'undefined');

      const url = reservation
        ? `http://localhost:3001/api/reservations/${reservation.id}`
        : 'http://localhost:3001/api/reservations';

      const res = await fetch(url, {
        method: reservation ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', res.status);

      if (res.status === 403) {
        throw new Error('Acceso denegado. No tienes permisos para modificar reservas.');
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Error al guardar reserva');
      }

      // Llamar al callback de éxito
      onSubmit();
      alert(reservation ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente');
      
    } catch (error) {
      console.error('Error guardando reserva:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : '';
  };

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find(r => r.id === parseInt(id));
    return restaurant ? restaurant.name : '';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {reservation ? 'Modifica los detalles de la reserva' : 'Crea una nueva reserva para un cliente'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usuario */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-1" />
                Cliente *
              </label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.userId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar Cliente</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                    {user.email && ` (${user.email})`}
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
              )}
            </div>

            {/* Restaurante */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                Restaurante *
              </label>
              <select
                name="restaurantId"
                value={formData.restaurantId}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.restaurantId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar Restaurante</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                    {restaurant.location && ` - ${restaurant.location}`}
                  </option>
                ))}
              </select>
              {errors.restaurantId && (
                <p className="mt-1 text-sm text-red-600">{errors.restaurantId}</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-1" />
                Fecha de Reserva *
              </label>
              <input
                type="date"
                name="reservationDate"
                value={formData.reservationDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.reservationDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.reservationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.reservationDate}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-1" />
                Hora de Reserva *
              </label>
              <input
                type="time"
                name="reservationTime"
                value={formData.reservationTime}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.reservationTime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.reservationTime && (
                <p className="mt-1 text-sm text-red-600">{errors.reservationTime}</p>
              )}
            </div>

            {/* Número de Personas */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 mr-1" />
                Número de Personas *
              </label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                min="1"
                max="20"
                placeholder="Ej: 4"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.partySize ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.partySize && (
                <p className="mt-1 text-sm text-red-600">{errors.partySize}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Reserva *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.status ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Solicitudes Especiales */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitudes Especiales
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="3"
                maxLength="500"
                placeholder="Ej: Mesa junto a la ventana, silla alta para bebé, alergias alimentarias..."
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  errors.specialRequests ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.specialRequests ? (
                  <p className="text-sm text-red-600">{errors.specialRequests}</p>
                ) : (
                  <p className="text-xs text-gray-500">Opcional. Máximo 500 caracteres.</p>
                )}
                <span className="text-xs text-gray-400">
                  {formData.specialRequests.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Resumen de la Reserva */}
          {formData.userId && formData.restaurantId && formData.reservationDate && formData.reservationTime && formData.partySize && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-900 mb-3">Resumen de la Reserva</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
                <div>
                  <p><strong>Cliente:</strong> {getUserName(formData.userId)}</p>
                  <p><strong>Restaurante:</strong> {getRestaurantName(formData.restaurantId)}</p>
                </div>
                <div>
                  <p><strong>Fecha:</strong> {new Date(formData.reservationDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><strong>Hora:</strong> {formData.reservationTime}</p>
                </div>
                <div>
                  <p><strong>Personas:</strong> {formData.partySize}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(formData.status)}`}>
                      {getStatusText(formData.status)}
                    </span>
                  </p>
                </div>
                {formData.specialRequests && (
                  <div className="md:col-span-2">
                    <p><strong>Solicitudes:</strong> {formData.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {reservation ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>{reservation ? 'Actualizar Reserva' : 'Crear Reserva'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;