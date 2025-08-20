'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, ArrowRight, Info, XCircle } from 'lucide-react';

// 🔥 FUNCIÓN CORREGIDA PARA OBTENER TOKEN - Misma que en ReservationAdmin
const getAuthToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('adminToken');
};

// ✅ CORREGIDO: FUNCIÓN PARA HACER PETICIONES AUTENTICADAS - Usando variable de entorno
const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    throw new Error('No estás autenticado. Por favor inicia sesión.');
  }
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  };
  
  console.log('🔐 Haciendo petición autenticada a:', url);
  console.log('🔐 Con token:', token ? token.substring(0, 20) + '...' : 'NO');
  
  const response = await fetch(url, config);
  
  // Si el token es inválido, limpiar localStorage y mostrar error
  if (response.status === 401) {
    console.error('❌ Token inválido o expirado');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }
  
  return response;
};

const ClientCalendarView = ({ 
  slots, 
  restaurants, 
  selectedRestaurant,
  selectedTimeSlot,
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [internalSelectedDate, setInternalSelectedDate] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [authError, setAuthError] = useState(null); // 🔥 NUEVO: Estado para errores de autenticación

  // 🔥 FUNCIÓN PARA VERIFICAR AUTENTICACIÓN
  const checkAuthStatus = () => {
    const token = getAuthToken();
    if (!token) {
      const errorMsg = 'No se encontró token de autenticación. Por favor inicia sesión.';
      console.warn('⚠️', errorMsg);
      setAuthError(errorMsg);
      return false;
    } else {
      console.log('✅ Token de autenticación encontrado en calendario');
      setAuthError(null);
      return true;
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Sincronizar currentDate con internalSelectedDate
  useEffect(() => {
    if (internalSelectedDate) {
      const filterDate = new Date(internalSelectedDate);
      if (filterDate.getMonth() !== currentDate.getMonth() || 
          filterDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1));
      }
    }
  }, [internalSelectedDate]);

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest('.tooltip-container') && !event.target.closest('.calendar-day')) {
        closeTooltip();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTooltip]);

  // 🔥 COMPONENTE PARA MOSTRAR ERROR DE AUTENTICACIÓN
  const AuthErrorMessage = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <XCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
        Error de Autenticación en Calendario
      </h3>
      <p className="text-sm text-gray-600 text-center mb-4">
        {authError}
      </p>
      <div className="flex space-x-3">
        <button
          onClick={() => {
            setAuthError(null);
            checkAuthStatus();
          }}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
        <button
          onClick={() => {
            window.location.href = '/login';
          }}
          className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Ir a Login
        </button>
      </div>
    </div>
  );

  // 🔥 MOSTRAR ERROR DE AUTENTICACIÓN SI EXISTE
  if (authError) {
    return <AuthErrorMessage />;
  }

  const getMonthBounds = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  const generateCalendarDays = () => {
    const { firstDay, lastDay } = getMonthBounds(currentDate);
    const firstDayOfWeek = firstDay.getDay();
    
    const prevMonthDays = [];
    const prevMonth = new Date(firstDay);
    prevMonth.setDate(0);
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(prevMonth);
      day.setDate(prevMonth.getDate() - i);
      prevMonthDays.push({ date: day, isCurrentMonth: false });
    }

    const currentMonthDays = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
      currentMonthDays.push({ date, isCurrentMonth: true });
    }

    const nextMonthDays = [];
    const totalCells = 42;
    const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
    
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(lastDay.getFullYear(), lastDay.getMonth() + 1, day);
      nextMonthDays.push({ date, isCurrentMonth: false });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getAllSlotsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    let dateSlots = slots.filter(slot => slot.date === dateString);

    // Filtrar por restaurante
    if (selectedRestaurant !== '') {
      dateSlots = dateSlots.filter(slot => slot.restaurant_id.toString() === selectedRestaurant);
    }

    // Filtrar por horario
    if (selectedTimeSlot !== '' && selectedTimeSlot !== 'all') {
      dateSlots = dateSlots.filter(slot => slot.time === selectedTimeSlot);
    }

    return dateSlots.map(slot => ({
      ...slot,
      isPastDate: slotDate < today,
      is_available: slotDate < today ? false : slot.is_available
    }));
  };

  const isDayHighlighted = (date) => {
    if (!internalSelectedDate) return false;
    const dateString = date.toISOString().split('T')[0];
    return dateString === internalSelectedDate;
  };

  const shouldShowDay = (date) => {
    if (!internalSelectedDate) return true;
    const dateString = date.toISOString().split('T')[0];
    return dateString === internalSelectedDate;
  };

  const getRestaurantInfo = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant : { 
      name: `Restaurante ${id}`, 
      opening_time: null, 
      closing_time: null,
      capacity: null,
      address: null
    };
  };

  // FUNCIÓN ACTUALIZADA para mostrar horario del restaurante
  const formatRestaurantSchedule = (slot) => {
    const restaurant = getRestaurantInfo(slot.restaurant_id);
    
    if (restaurant.opening_time && restaurant.closing_time) {
      return `${restaurant.opening_time} - ${restaurant.closing_time}`;
    }
    
    // Si hay time específico en el slot, mostrarlo
    if (slot.time) {
      return slot.time;
    }
    
    return 'Horario no especificado';
  };

  const getDayStyle = (dayInfo) => {
    const { date, isCurrentMonth } = dayInfo;
    const allSlots = getAllSlotsForDate(date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const isHighlighted = isDayHighlighted(date);
    const shouldShow = shouldShowDay(date);

    let baseClasses = "relative h-16 border border-gray-200 transition-all duration-200 cursor-pointer hover:border-blue-300";
    
    if (internalSelectedDate && !shouldShow) {
      baseClasses += " opacity-30 pointer-events-none";
    }
    
    if (!isCurrentMonth) {
      baseClasses += " bg-gray-100 text-gray-400";
    } else if (isPast) {
      baseClasses += " bg-gray-200 text-gray-500 cursor-not-allowed";
    } else if (isToday) {
      baseClasses += " bg-yellow-50 border-yellow-300";
    } else if (isHighlighted) {
      baseClasses += " bg-blue-100 border-blue-400 ring-2 ring-blue-300";
    } else {
      baseClasses += " hover:bg-blue-50";
    }

    if (allSlots.length > 0 && shouldShow) {
      const availableSlots = allSlots.filter(slot => slot.is_available && !slot.isPastDate);
      const expiredSlots = allSlots.filter(slot => slot.isPastDate);
      const unavailableSlots = allSlots.filter(slot => !slot.is_available && !slot.isPastDate);

      if (availableSlots.length > 0) {
        baseClasses += " border-l-4 border-l-green-500 hover:border-l-green-600";
      } else if (expiredSlots.length > 0 && unavailableSlots.length === 0) {
        baseClasses += " border-l-4 border-l-gray-400";
      } else {
        baseClasses += " border-l-4 border-l-red-500";
      }
    }

    return baseClasses;
  };

  const clearDateFilter = () => {
    setInternalSelectedDate('');
  };

  // 🔥 FUNCIÓN handleDayClick MEJORADA con verificación de auth
  const handleDayClick = (event, date, allSlots) => {
    // Verificar autenticación antes de proceder
    if (!checkAuthStatus()) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);

    // No permitir clicks en fechas pasadas
    if (slotDate < today) return;

    const selectedDateString = date.toISOString().split('T')[0];
    const availableSlots = allSlots.filter(slot => slot.is_available && !slot.isPastDate);

    // Si no hay slots disponibles, mostrar mensaje
    if (availableSlots.length === 0) {
      const formattedDate = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      setAlertMessage(`No hay horarios disponibles para ${formattedDate}`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    // SIEMPRE mostrar tooltip para que el usuario vea la información del restaurante
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setClickedDate(date);
    setShowTooltip(true);
  };

  const closeTooltip = () => {
    setShowTooltip(false);
    setClickedDate(null);
  };

  // 🔥 FUNCIÓN handleSlotSelection MEJORADA con verificación de auth
  const handleSlotSelection = (slot) => {
    // Verificar autenticación antes de proceder
    if (!checkAuthStatus()) {
      return;
    }

    const selectedDateString = clickedDate.toISOString().split('T')[0];
    closeTooltip();
    
    // Llamar la función onDateClick pasada como prop
    if (onDateClick) {
      onDateClick(selectedDateString, slot);
    }
  };

  const getDayStatusSummary = (allSlots) => {
    if (allSlots.length === 0) return null;

    const available = allSlots.filter(slot => slot.is_available && !slot.isPastDate).length;
    const expired = allSlots.filter(slot => slot.isPastDate).length;
    const unavailable = allSlots.filter(slot => !slot.is_available && !slot.isPastDate).length;

    if (allSlots.length === 1) {
      const slot = allSlots[0];
      return slot.is_available && !slot.isPastDate
        ? 'Disponible'
        : slot.isPastDate
        ? 'Expirado'
        : 'No Disponible';
    }

    if (available > 0) {
      return `${available}/${allSlots.length} Disponible`;
    } else if (expired === allSlots.length) {
      return 'Todos Expirados';
    } else {
      return 'No Disponible';
    }
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtro de fecha interno */}
      <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <label className="text-sm font-medium text-blue-900">Filtrar por fecha:</label>
            <input
              type="date"
              value={internalSelectedDate}
              onChange={(e) => setInternalSelectedDate(e.target.value)}
              className="border border-blue-300 rounded-lg px-3 py-1 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {internalSelectedDate && (
              <button
                onClick={clearDateFilter}
                className="flex items-center px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
          
          {internalSelectedDate && (
            <div className="text-sm text-blue-700">
              <span className="font-medium">Mostrando:</span> {new Date(internalSelectedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span className="text-gray-600">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-gray-600">No disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
            <span className="text-gray-600">Expirado</span>
          </div>
          {internalSelectedDate && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-sm ring-1 ring-blue-500"></div>
              <span className="text-gray-600">Fecha filtrada</span>
            </div>
          )}
        </div>
        
        {/* 🔥 NUEVO: Indicador de autenticación */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {selectedRestaurant && (
            <div>
              <span className="font-medium">Restaurante:</span> {getRestaurantInfo(parseInt(selectedRestaurant)).name}
            </div>
          )}
          {selectedTimeSlot && selectedTimeSlot !== 'all' && selectedTimeSlot !== '' && (
            <div>
              <span className="font-medium">Horario:</span> {selectedTimeSlot}
            </div>
          )}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Autenticado</span>
          </div>
        </div>
      </div>

      {/* Nombres de los días */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, index) => {
          const { date, isCurrentMonth } = dayInfo;
          const allSlots = getAllSlotsForDate(date);
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();
          const isPast = date < today && !isToday;
          const isHighlighted = isDayHighlighted(date);
          const shouldShow = shouldShowDay(date);
          const availableSlots = allSlots.filter(slot => slot.is_available && !slot.isPastDate);

          return (
            <div
              key={index}
              className={`calendar-day ${getDayStyle(dayInfo)}`}
              onClick={(e) => !isPast && shouldShow && handleDayClick(e, date, allSlots)}
            >
              {/* Número del día */}
              <div className="p-2">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-black' : 
                  !isCurrentMonth ? 'text-gray-400' : 
                  isPast ? 'text-gray-500' :
                  isHighlighted ? 'text-black font-bold' :
                  'text-gray-900'
                }`}>
                  {date.getDate()}
                </span>
                
                {isToday && (
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mx-auto mt-1"></div>
                )}

                {isHighlighted && !isToday && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>

              {/* Indicador de estado */}
              {allSlots.length > 0 && shouldShow && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className={`text-xs px-2 py-0.5 rounded-full text-center truncate ${
                    availableSlots.length > 0
                      ? 'bg-green-100 text-green-800' 
                      : allSlots.every(s => s.isPastDate)
                        ? 'bg-gray-100 text-gray-600 border border-gray-300' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {getDayStatusSummary(allSlots)}
                  </div>
                </div>
              )}

              {/* Indicador de clic disponible */}
              {availableSlots.length > 0 && !isPast && isCurrentMonth && shouldShow && (
                <div className="absolute top-1 right-1">
                  <ArrowRight className="w-3 h-3 text-blue-500" />
                </div>
              )}

              {/* Indicador de múltiples opciones */}
              {availableSlots.length > 1 && shouldShow && (
                <div className="absolute top-1 left-1">
                  <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {availableSlots.length}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip para selección de horarios - ACTUALIZADO CON CAPACIDAD */}
      {showTooltip && clickedDate && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-opacity-10"
            onClick={closeTooltip}
          ></div>
          
          <div 
            className="fixed z-50 pointer-events-auto tooltip-container"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 p-4 min-w-64 max-w-80">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-600 pb-2">
                  <div className="text-sm font-medium">
                    {clickedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <button
                    onClick={closeTooltip}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {getAllSlotsForDate(clickedDate)
                    .filter(slot => slot.is_available && !slot.isPastDate)
                    .map((slot, index) => {
                      const restaurantInfo = getRestaurantInfo(slot.restaurant_id);
                      return (
                        <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600 hover:bg-gray-700 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">
                              {restaurantInfo.name}
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                              Disponible
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2 flex items-center">
                            <Clock className="w-3 h-3 inline mr-1" />
                            <span className="font-medium">Horario:</span>
                            <span className="ml-1">{formatRestaurantSchedule(slot)}</span>
                          </div>
                          
                          {/* Capacidad del restaurante */}
                          {restaurantInfo.capacity && (
                            <div className="text-xs text-gray-400 mb-2 flex items-center">
                              <Users className="w-3 h-3 inline mr-1" />
                              <span className="font-medium">Capacidad:</span>
                              <span className="ml-1">{restaurantInfo.capacity} personas</span>
                            </div>
                          )}
                          
                          {/* Información adicional del restaurante */}
                          {restaurantInfo.address && (
                            <div className="text-xs text-gray-400 mb-3 flex items-start">
                              <MapPin className="w-3 h-3 inline mr-1 mt-0.5 flex-shrink-0" />
                              <span className="text-left">{restaurantInfo.address}</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleSlotSelection(slot)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                          >
                            <span>Reservar</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-600 text-center text-xs text-gray-300">
                  {getAllSlotsForDate(clickedDate).filter(slot => slot.is_available && !slot.isPastDate).length === 1 
                    ? "Haz clic en 'Reservar' para continuar"
                    : "Selecciona un horario para continuar con tu reserva"
                  }
                </div>
              </div>
            </div>
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-700"></div>
            </div>
          </div>
        </>
      )}

      {/* Alert personalizado */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg border border-red-600 flex items-center space-x-3 animate-fade-in-down">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-medium">
              {alertMessage}
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="flex-shrink-0 text-red-200 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer con estadísticas */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              <span className="font-medium text-green-600">
                {slots.filter(slot => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const slotDate = new Date(slot.date);
                  slotDate.setHours(0, 0, 0, 0);
                  return slot.is_available && slotDate >= today;
                }).length}
              </span> horarios disponibles
            </span>
          </div>
          <div className="text-xs text-gray-500">
            <Info className="w-3 h-3 inline mr-1" />
            Haz clic en una fecha para reservar
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCalendarView;