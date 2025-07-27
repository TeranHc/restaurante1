import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';

const CalendarView = ({ 
  slots, 
  restaurants, 
  selectedRestaurant, 
  selectedTimeSlot, // filtro de horario
  onCreateSlot, 
  onEditSlot, 
  onDeleteSlot 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // NUEVO: Estado interno para el filtro de fecha del calendario
  const [internalSelectedDate, setInternalSelectedDate] = useState('');

  // Efecto para sincronizar currentDate con internalSelectedDate
  useEffect(() => {
    if (internalSelectedDate) {
      const filterDate = new Date(internalSelectedDate);
      // Solo cambiar el mes si la fecha filtrada está en un mes diferente
      if (filterDate.getMonth() !== currentDate.getMonth() || 
          filterDate.getFullYear() !== currentDate.getFullYear()) {
        setCurrentDate(new Date(filterDate.getFullYear(), filterDate.getMonth(), 1));
      }
    }
  }, [internalSelectedDate]);

  // Cerrar tooltip si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTooltip && !event.target.closest('.tooltip-container') && !event.target.closest('.calendar-day')) {
        closeTooltip();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTooltip]);

  // Obtener el primer y último día del mes actual
  const getMonthBounds = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // Generar los días del calendario
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

  // Navegar entre meses
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // MODIFICADO: Obtener slots filtrados por fecha interna, restaurante Y horario
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

    // Filtrar por horario usando el campo 'time' de la tabla available_slots
    if (selectedTimeSlot !== '' && selectedTimeSlot !== 'all') {
      dateSlots = dateSlots.filter(slot => slot.time === selectedTimeSlot);
    }

    return dateSlots.map(slot => ({
      ...slot,
      isPastDate: slotDate < today,
      is_available: slotDate < today ? false : slot.is_available
    }));
  };

  // Función para determinar si un día debe estar resaltado por el filtro interno
  const isDayHighlighted = (date) => {
    if (!internalSelectedDate) return false;
    const dateString = date.toISOString().split('T')[0];
    return dateString === internalSelectedDate;
  };

  // NUEVO: Función para determinar si un día debe mostrarse (cuando hay filtro de fecha)
  const shouldShowDay = (date) => {
    if (!internalSelectedDate) return true;
    const dateString = date.toISOString().split('T')[0];
    return dateString === internalSelectedDate;
  };

  // Obtener el nombre del restaurante
  const getRestaurantName = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant.name : `Restaurante ${id}`;
  };

  // Función para formatear el horario
  const formatTimeSlot = (slot) => {
    return slot.time || 'Sin horario';
  };

  // MODIFICADO: Obtener el estilo del día considerando múltiples slots y filtro de fecha
  const getDayStyle = (dayInfo) => {
    const { date, isCurrentMonth } = dayInfo;
    const allSlots = getAllSlotsForDate(date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today && !isToday;
    const isHighlighted = isDayHighlighted(date);
    const shouldShow = shouldShowDay(date);

    let baseClasses = "relative h-16 border border-gray-200 transition-all duration-200 cursor-pointer hover:border-blue-300";
    
    // Si hay filtro de fecha y este día no debe mostrarse, aplicar estilo desvanecido
    if (internalSelectedDate && !shouldShow) {
      baseClasses += "  pointer-events-none";
    }
    
    if (!isCurrentMonth) {
      baseClasses += " bg-gray-100 text-gray-400";
    } else if (isPast) {
      baseClasses += " bg-gray-200 text-gray-500";
    } else if (isToday) {
      baseClasses += " bg-blue-200 border-blue-300";
    } else if (isHighlighted) {
      // Estilo especial para día filtrado
      baseClasses += " bg-blue-100 border-blue-400 ring-2 ring-blue-300";
    } else {
      baseClasses += " ";
    }

    if (allSlots.length > 0 && shouldShow) {
      const availableSlots = allSlots.filter(slot => slot.is_available && !slot.isPastDate);
      const expiredSlots = allSlots.filter(slot => slot.isPastDate);
      const unavailableSlots = allSlots.filter(slot => !slot.is_available && !slot.isPastDate);

      if (availableSlots.length > 0) {
        baseClasses += " border-l-4 border-l-green-500";
      } else if (expiredSlots.length > 0 && unavailableSlots.length === 0) {
        baseClasses += " border-l-4 border-l-gray-400";
      } else {
        baseClasses += " border-l-4 border-l-red-500";
      }
    }

    return baseClasses;
  };

  // Manejar limpieza del filtro de fecha
  const clearDateFilter = () => {
    setInternalSelectedDate('');
  };

  // Tooltip activado por click
  const handleDayClick = (event, date, allSlots) => {
    const selectedDateString = date.toISOString().split('T')[0];
    
    // Si no hay slots, crear uno nuevo directamente
    if (allSlots.length === 0) {
      onCreateSlot(selectedDateString);
      return;
    }

    // Si hay solo un slot, editarlo directamente
    if (allSlots.length === 1) {
      onEditSlot(allSlots[0]);
      return;
    }

    // Si hay múltiples slots, mostrar tooltip para seleccionar
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setClickedDate(date);
    setShowTooltip(true);
  };

  // Cerrar tooltip
  const closeTooltip = () => {
    setShowTooltip(false);
    setClickedDate(null);
  };

  // Manejar acción específica de restaurante
  const handleRestaurantAction = (slot, action) => {
    closeTooltip();
    
    if (action === 'edit') {
      onEditSlot(slot);
    } else if (action === 'delete') {
      onDeleteSlot(slot.id);
    }
  };

  // Generar el estado resumido para mostrar en el día
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
      {/* Header del calendario con filtro de fecha interno */}
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
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
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
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* NUEVO: Filtro de fecha interno */}
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
                title="Limpiar filtro de fecha"
              >
                <X className="w-3 h-3 mr-1" />
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
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
            <span className="text-gray-600">Sin configurar</span>
          </div>
          {internalSelectedDate && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-sm ring-1 ring-blue-500"></div>
              <span className="text-gray-600">Fecha filtrada</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {selectedRestaurant && (
            <div>
              <span className="font-medium">Restaurante:</span> {getRestaurantName(parseInt(selectedRestaurant))}
            </div>
          )}
          {selectedTimeSlot && selectedTimeSlot !== 'all' && selectedTimeSlot !== '' && (
            <div>
              <span className="font-medium">Horario:</span> {selectedTimeSlot}
            </div>
          )}
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

          return (
            <div
              key={index}
              className={`calendar-day ${getDayStyle(dayInfo)}`}
              onClick={(e) => !isPast && shouldShow && handleDayClick(e, date, allSlots)}
            >
              {/* Número del día */}
              <div className="p-2">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-blue-700' : 
                  !isCurrentMonth ? 'text-gray-400' : 
                  isPast ? 'text-gray-500' :
                  isHighlighted ? 'text-black font-bold' :
                  'text-gray-900'
                }`}>
                  {date.getDate()}
                </span>
                
                {isToday && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}

                {isHighlighted && !isToday && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>

              {/* Indicador de estado para múltiples slots */}
              {allSlots.length > 0 && shouldShow && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className={`text-xs px-2 py-0.5 rounded-full text-center truncate ${
                    allSlots.some(s => s.is_available && !s.isPastDate)
                      ? 'bg-green-100 text-green-800' 
                      : allSlots.every(s => s.isPastDate)
                        ? 'bg-gray-100 text-gray-600 border border-gray-300' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {getDayStatusSummary(allSlots)}
                  </div>
                </div>
              )}

              {/* Botón para agregar disponibilidad en días sin configurar */}
              {allSlots.length === 0 && !isPast && isCurrentMonth && shouldShow && (
                <div className="absolute bottom-1 right-1">
                  <Plus className="w-3 h-3 text-gray-400" />
                </div>
              )}

              {/* Indicador de múltiples restaurantes */}
              {allSlots.length > 1 && shouldShow && (
                <div className="absolute top-1 right-1">
                  <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {allSlots.length}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip activado por click */}
      {showTooltip && clickedDate && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
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
                  {getAllSlotsForDate(clickedDate).map((slot, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {getRestaurantName(slot.restaurant_id)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          slot.is_available && !slot.isPastDate
                            ? 'bg-green-200 text-green-800'
                            : slot.isPastDate
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {slot.is_available && !slot.isPastDate
                            ? 'Disponible'
                            : slot.isPastDate
                            ? 'Expirado'
                            : 'No Disponible'
                          }
                        </div>
                      </div>
                      
                      {/* Mostrar horario en el tooltip */}
                      <div className="text-xs text-gray-400 mb-2">
                        {formatTimeSlot(slot)}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRestaurantAction(slot, 'edit')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleRestaurantAction(slot, 'delete')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs flex items-center justify-center space-x-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen general */}
                <div className="mt-3 pt-3 border-t border-gray-600 text-center text-xs text-gray-300">
                  {getAllSlotsForDate(clickedDate).filter(s => s.is_available && !s.isPastDate).length} disponibles de {getAllSlotsForDate(clickedDate).length} slots
                </div>
              </div>
            </div>
            
            {/* Flecha del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-700"></div>
            </div>
          </div>
        </>
      )}

      {/* Footer con estadísticas considerando filtros */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            <span className="font-medium">{slots.length}</span> días configurados
            {(internalSelectedDate || selectedRestaurant || selectedTimeSlot) && (
              <span className="text-xs text-gray-500 ml-2">
                (filtrados: {
                  slots.filter(slot => {
                    const matchesDate = !internalSelectedDate || slot.date === internalSelectedDate;
                    const matchesRestaurant = selectedRestaurant === '' || slot.restaurant_id.toString() === selectedRestaurant;
                    const matchesTimeSlot = selectedTimeSlot === '' || selectedTimeSlot === 'all' || slot.time === selectedTimeSlot;
                    return matchesDate && matchesRestaurant && matchesTimeSlot;
                  }).length
                })
              </span>
            )}
          </div>
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
              </span> disponibles
            </span>
            <span>
              <span className="font-medium text-red-600">
                {slots.filter(slot => !slot.is_available).length}
              </span> cerrados
            </span>
            <span>
              <span className="font-medium text-gray-600">
                {slots.filter(slot => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const slotDate = new Date(slot.date);
                  slotDate.setHours(0, 0, 0, 0);
                  return slot.is_available && slotDate < today;
                }).length}
              </span> expirados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;