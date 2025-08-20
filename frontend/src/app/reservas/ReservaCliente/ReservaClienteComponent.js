// Create a new file: app/reservas/ReservaCliente/ReservaClienteComponent.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Users, MapPin, MessageSquare, ArrowRight, Check } from 'lucide-react';

export default function ReservaClienteComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener parámetros de la URL
  const dateParam = searchParams.get('date');
  const restaurantParam = searchParams.get('restaurant');
  const timeParam = searchParams.get('time');
  const slotIdParam = searchParams.get('slot_id');

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dateParam || '');
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Obtener información del usuario logueado
      const token = localStorage.getItem('token');
      if (token) {
        const userRes = await fetch('http://localhost:3001/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      }

      // Si hay restaurante preseleccionado, obtener su información
      if (restaurantParam) {
        const restaurantRes = await fetch(`http://localhost:3001/api/restaurants/${restaurantParam}`);
        if (restaurantRes.ok) {
          const restaurantData = await restaurantRes.json();
          setSelectedRestaurant(restaurantData);
          generateAvailableHours(restaurantData);
        }
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener slots disponibles del API
  const fetchAvailableSlots = async (date, restaurantId) => {
    try {
      const url = restaurantId 
        ? `http://localhost:3001/api/available-slots?date=${date}&restaurant_id=${restaurantId}`
        : `http://localhost:3001/api/available-slots?date=${date}`;
      
      console.log('Fetching slots from:', url);
      
      const response = await fetch(url);
      if (response.ok) {
        const slots = await response.json();
        console.log('Slots received:', slots);
        
        // Filtrar solo slots disponibles
        const availableSlots = slots.filter(slot => slot.is_available);
        setAvailableSlots(availableSlots);
        
        // Si hay slots disponibles y viene un tiempo preseleccionado, verificar si está disponible
        if (timeParam && availableSlots.some(slot => slot.time === timeParam)) {
          setSelectedTime(timeParam);
        }
      } else {
        console.error('Error response:', response.status, response.statusText);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error cargando slots:', error);
      setAvailableSlots([]);
    }
  };

  // Manejar cambio de fecha
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedTime(''); // Limpiar hora seleccionada
    setAvailableSlots([]); // Limpiar slots anteriores
    if (selectedRestaurant) {
      fetchAvailableSlots(newDate, selectedRestaurant.id);
    }
  };

  // Generar horarios disponibles basado en el horario del restaurante
  const generateAvailableHours = (restaurant) => {
    if (!restaurant.opening_time || !restaurant.closing_time) return;

    const openingTime = restaurant.opening_time;
    const closingTime = restaurant.closing_time;
    
    // Convertir horas a minutos para facilitar el cálculo
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(openingTime);
    const endMinutes = timeToMinutes(closingTime);
    
    const hours = [];
    // Generar horarios cada 30 minutos
    for (let minutes = startMinutes; minutes <= endMinutes - 60; minutes += 30) {
      hours.push(minutesToTime(minutes));
    }
    
    return hours;
  };

  // Función para seleccionar el horario completo del restaurante
  const handleSelectFullSchedule = () => {
    if (selectedRestaurant?.opening_time && selectedRestaurant?.closing_time) {
      setSelectedTime(`${selectedRestaurant.opening_time} - ${selectedRestaurant.closing_time}`);
    }
  };

  // Obtener el slot específico seleccionado
  const getSelectedSlot = () => {
    return availableSlots.find(slot => 
      slot.time === selectedTime && 
      slot.restaurant_id === selectedRestaurant?.id
    );
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!selectedDate) {
      newErrors.date = 'Selecciona una fecha';
    }

    if (!selectedTime || selectedTime === '') {
      newErrors.time = 'Selecciona una hora';
    }

    if (!partySize || partySize < 1) {
      newErrors.partySize = 'Selecciona el número de personas';
    }

    if (!user) {
      newErrors.user = 'Debes iniciar sesión para hacer una reserva';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar reserva
  const handleSubmitReservation = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedSlot = getSelectedSlot();
      
      const reservationData = {
        user_id: user.id,
        restaurant_id: selectedRestaurant.id,
        slot_id: selectedSlot?.id, // ID del slot específico
        reservation_date: selectedDate,
        reservation_time: selectedTime,
        party_size: parseInt(partySize),
        status: 'PENDING',
        special_requests: specialRequests || null,
        // Campos adicionales para mostrar (no se guardan en BD pero se pueden usar para display)
        user_first_name: user.firstName,
        user_last_name: user.lastName
      };

      console.log('Sending reservation data:', reservationData);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/reservations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la reserva');
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Error creando reserva:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Volver al calendario
  const handleBackToCalendar = () => {
    router.push('/reservas');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  // Modal de confirmación
  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Reserva Confirmada!</h3>
        <p className="text-gray-600 mb-6">
          Tu reserva ha sido confirmada exitosamente.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h4 className="font-semibold mb-2">Detalles de tu reserva:</h4>
          <p className="text-sm text-gray-600">
            <strong>Restaurante:</strong> {selectedRestaurant?.name}<br/>
            <strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-ES')}<br/>
            <strong>Hora:</strong> {selectedTime}<br/>
            <strong>Personas:</strong> {partySize}<br/>
            <strong>Cliente:</strong> {user?.firstName} {user?.lastName}
            {specialRequests && (
              <>
                <br/><strong>Solicitudes:</strong> {specialRequests}
              </>
            )}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/reservas')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Volver al calendario
          </button>
          <button
            onClick={() => {
              setShowConfirmation(false);
              router.push('/reservas');
            }}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Hacer otra reserva
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 text-green-600 mr-3 text-2xl">🍴</div>
              <h1 className="text-2xl font-bold text-gray-900">ReservaFácil</h1>
            </div>
            
            {/* Información del usuario */}
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Bienvenido,</p>
                <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Fecha y Hora</h2>
          <p className="text-gray-600">Reserva en {selectedRestaurant?.name || 'Cargando...'}</p>
          
          {selectedRestaurant?.opening_time && selectedRestaurant?.closing_time && (
            <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Horario: {selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}</span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de fecha */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Selección de personas */}
            <div>
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Personas
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg ${
                  errors.partySize ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? 'persona' : 'personas'}
                  </option>
                ))}
              </select>
              {errors.partySize && (
                <p className="mt-1 text-sm text-red-600">{errors.partySize}</p>
              )}
            </div>
          </div>

          {/* Selección de hora */}
          {selectedDate && (
            <div className="mt-6">
              <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Horarios disponibles
              </label>
              
              {selectedRestaurant ? (
                <div className="space-y-3">
                  {/* Información del restaurante */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="font-medium text-blue-900">{selectedRestaurant.name}</span>
                      </div>
                      {selectedRestaurant?.opening_time && selectedRestaurant?.closing_time && (
                        <div className="flex items-center text-blue-700">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="space-y-3">
                      {/* Botones de horarios específicos si están disponibles */}
                      {[...new Set(availableSlots.map(slot => slot.time))]
                        .filter(Boolean).length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {[...new Set(availableSlots.map(slot => slot.time))]
                            .filter(Boolean)
                            .sort()
                            .map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedTime(time)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedTime === time
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                                }`}
                              >
                                {time}
                              </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    /* Campo de entrada manual de hora si no hay slots */
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ingresa una hora específica
                      </label>
                      <input
                        type="time"
                        value={selectedTime.includes(' - ') ? '' : selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg ${
                          errors.time ? 'border-red-300' : 'border-gray-300'
                        }`}
                        min={selectedRestaurant?.opening_time}
                        max={selectedRestaurant?.closing_time}
                      />
                      {selectedRestaurant?.opening_time && selectedRestaurant?.closing_time && (
                        <p className="text-xs text-gray-500 mt-1">
                          Horario permitido: {selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mensaje cuando no hay restaurante seleccionado */
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium">Selecciona un restaurante primero</p>
                  <p className="text-sm mt-1">
                    Necesitas seleccionar un restaurante para ver los horarios disponibles
                  </p>
                </div>
              )}
              
              {errors.time && (
                <p className="mt-2 text-sm text-red-600">{errors.time}</p>
              )}
            </div>
          )}

          {/* Solicitudes Especiales */}
          <div className="mt-6">
            <label className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
              Solicitudes Especiales (opcional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows="3"
              maxLength="500"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Alergias, ocasión especial, preferencias de mesa, etc..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">
                {specialRequests.length}/500
              </span>
            </div>
          </div>

          {/* Resumen de la reserva */}
          {user && selectedRestaurant && selectedDate && selectedTime && (
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-900 mb-3">Resumen de tu reserva</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <p><strong>Cliente:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Restaurante:</strong> {selectedRestaurant.name}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p><strong>Hora:</strong> {selectedTime}</p>
                  <p><strong>Personas:</strong> {partySize}</p>
                </div>
              </div>
              
              {specialRequests && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Solicitudes especiales:</strong> {specialRequests}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBackToCalendar}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Volver
            </button>
            <button
              onClick={handleSubmitReservation}
              disabled={isSubmitting || !selectedDate || !selectedTime || !user}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmando...
                </>
              ) : (
                <>
                  Confirmar Reserva
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmation && <ConfirmationModal />}
    </div>
  );
}