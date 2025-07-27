'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Edit2, Trash2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import SlotModal from './SlotModal';
import ReservationModal from './ReservationModal';
import CalendarView from './CalendarView'; // Importar el componente del calendario

const ReservationAdmin = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // NUEVO: Estado para filtro de horarios
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando carga de datos...');
      
      const apiUrls = {
        restaurants: 'http://localhost:3001/api/restaurants',
        users: 'http://localhost:3001/api/users', 
        slots: 'http://localhost:3001/api/available-slots',
        reservations: 'http://localhost:3001/api/reservations'
      };
      
      console.log('🌐 URLs de API que se están llamando:', apiUrls);

      const [restaurantsRes, usersRes, slotsRes, reservationsRes] = await Promise.all([
        fetch(apiUrls.restaurants),
        fetch(apiUrls.users),
        fetch(apiUrls.slots),
        fetch(apiUrls.reservations)
      ]);

      console.log('📡 Respuestas de API:', {
        restaurants: { status: restaurantsRes.status, ok: restaurantsRes.ok },
        users: { status: usersRes.status, ok: usersRes.ok },
        slots: { status: slotsRes.status, ok: slotsRes.ok },
        reservations: { status: reservationsRes.status, ok: reservationsRes.ok }
      });

      if (restaurantsRes.ok) {
        const restaurantsData = await restaurantsRes.json();
        console.log('🏪 Datos de restaurantes:', restaurantsData);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      } else {
        const errorText = await restaurantsRes.text();
        console.error('❌ Error en restaurantes:', {
          status: restaurantsRes.status,
          statusText: restaurantsRes.statusText,
          error: errorText
        });
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('👥 Datos de usuarios:', usersData);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        const errorText = await usersRes.text();
        console.error('❌ Error en usuarios:', {
          status: usersRes.status,
          statusText: usersRes.statusText,
          error: errorText
        });
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        console.log('⏰ Datos de slots:', slotsData);
        setSlots(Array.isArray(slotsData) ? slotsData : []);
      } else {
        const errorText = await slotsRes.text();
        console.error('❌ Error en slots:', {
          status: slotsRes.status,
          statusText: slotsRes.statusText,
          error: errorText
        });
      }

      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json();
        console.log('📅 Datos de reservas:', reservationsData);
        setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      } else {
        const errorText = await reservationsRes.text();
        console.error('❌ Error en reservas:', {
          status: reservationsRes.status,
          statusText: reservationsRes.statusText,
          error: errorText
        });
      }

    } catch (error) {
      console.error('💥 Error de red cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Obtener horarios únicos de los slots para el filtro
  const getUniqueTimeSlots = () => {
    const timeSlots = new Set();
    slots.forEach(slot => {
      // Usar el campo 'time' de la tabla available_slots
      if (slot.time) {
        timeSlots.add(slot.time);
      }
    });
    return Array.from(timeSlots).sort();
  };

  // Filtrar datos por fecha, restaurante y horario
  const filteredSlots = slots.filter(slot => {
    const matchesDate = !selectedDate || slot.date === selectedDate;
    const matchesRestaurant = selectedRestaurant === '' || slot.restaurant_id.toString() === selectedRestaurant;
    
    // NUEVO: Filtro por horario
    let matchesTimeSlot = true;
    if (selectedTimeSlot !== '' && selectedTimeSlot !== 'all') {
      matchesTimeSlot = slot.time === selectedTimeSlot;
    }
    
    return matchesDate && matchesRestaurant && matchesTimeSlot;
  });

  const filteredReservations = reservations.filter(reservation => {
    const matchesDate = !selectedDate || reservation.reservation_date === selectedDate;
    const matchesRestaurant = selectedRestaurant === '' || reservation.restaurant_id.toString() === selectedRestaurant;
    
    // NUEVO: Filtro por horario en reservas
    let matchesTimeSlot = true;
    if (selectedTimeSlot !== '' && selectedTimeSlot !== 'all') {
      matchesTimeSlot = reservation.reservation_time === selectedTimeSlot;
    }
    
    return matchesDate && matchesRestaurant && matchesTimeSlot;
  });

  const handleDelete = async (type, id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      const endpoint = type === 'slot' ? 'available-slots' : 'reservations';
      const response = await fetch(`http://localhost:3001/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  const handleFormSubmit = async () => {
    await fetchData();
    closeModal();
  };

  // NUEVAS funciones para el calendario
  const handleCreateSlot = (dateString) => {
    const newSlot = {
      date: dateString,
      restaurant_id: selectedRestaurant ? parseInt(selectedRestaurant) : null
    };
    openModal('slot', newSlot);
  };

  const handleEditSlot = (slot) => {
    openModal('slot', slot);
  };

  const handleDeleteSlot = async (slotId) => {
    await handleDelete('slot', slotId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRestaurantName = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant.name : `Restaurante ${id}`;
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : `Usuario ${id}`;
  };

  const getAvailabilityBadge = (slot) => {
    if (!slot.is_available) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">No Disponible</span>;
    }
    if (slot.current_reservations >= slot.max_capacity) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Lleno</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Disponible</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Reservas</h1>
            <div className="flex gap-4">
              <button
                onClick={() => openModal('slot')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Horario
              </button>
              <button
                onClick={() => openModal('reservation')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Reserva
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
              />
              <button
                onClick={() => setSelectedDate('')}
                className="px-3 py-2 text-sm border border-gray-400 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
              >
                Limpiar fecha
              </button>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="">Todos los restaurantes</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            {/* NUEVO: Filtro de horarios */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="">Todos los horarios</option>
                {getUniqueTimeSlots().map(timeSlot => (
                  <option key={timeSlot} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 -mb-px">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-2 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'calendar'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Vista de Calendario ({slots.length})
              </button>
              <button
                onClick={() => setActiveTab('slots')}
                className={`py-2 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'slots'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Vista de Horarios ({filteredSlots.length})
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-2 px-1 font-medium text-sm transition-colors ${
                  activeTab === 'reservations'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gestión de Reservas ({filteredReservations.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* NUEVA pestaña: Vista de Calendario */}
        {activeTab === 'calendar' && (
          <CalendarView
            slots={slots}
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            selectedTimeSlot={selectedTimeSlot}
            onCreateSlot={handleCreateSlot}
            onEditSlot={handleEditSlot}
            onDeleteSlot={handleDeleteSlot}
          />
        )}

        {activeTab === 'slots' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Horarios Disponibles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona la disponibilidad de horarios por restaurante 
                {selectedDate && ` - Fecha: ${new Date(selectedDate).toLocaleDateString('es-ES')}`}
                {selectedRestaurant && ` - Restaurante: ${getRestaurantName(parseInt(selectedRestaurant))}`}
                {selectedTimeSlot && ` - Horario: ${selectedTimeSlot}`}
              </p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Cargando horarios...</p>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay horarios disponibles para los filtros seleccionados</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Total de horarios en el sistema: {slots.length}
                  </p>
                  <button
                    onClick={() => openModal('slot')}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primer horario
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSlots.map(slot => (
                    <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{getRestaurantName(slot.restaurant_id)}</h3>
                          <p className="text-sm text-gray-500">{new Date(slot.date).toLocaleDateString('es-ES')}</p>
                          {/* MOSTRAR horario en la tarjeta */}
                          <p className="text-xs text-gray-600">
                            {slot.time || 'Sin horario'}
                          </p>
                        </div>
                        {getAvailabilityBadge(slot)}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal('slot', slot)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded border-none hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete('slot', slot.id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-700 rounded border-none hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Reservas</h2>
              <p className="text-sm text-gray-500 mt-1">
                Administra todas las reservas del sistema
                {selectedDate && ` - Fecha: ${new Date(selectedDate).toLocaleDateString('es-ES')}`}
                {selectedRestaurant && ` - Restaurante: ${getRestaurantName(parseInt(selectedRestaurant))}`}
                {selectedTimeSlot && ` - Horario: ${selectedTimeSlot}`}
              </p>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Cargando reservas...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurante</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha & Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map(reservation => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getUserName(reservation.user_id)}
                          </div>
                          {reservation.special_requests && (
                            <div className="text-xs text-gray-500" title={reservation.special_requests}>
                              {reservation.special_requests.length > 30 
                                ? reservation.special_requests.substring(0, 30) + '...'
                                : reservation.special_requests
                              }
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getRestaurantName(reservation.restaurant_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(reservation.reservation_date).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-sm text-gray-500">{reservation.reservation_time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            {reservation.party_size}
                          </div>  
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(reservation.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {reservation.status.toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openModal('reservation', reservation)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar reserva"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('reservation', reservation.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar reserva"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && filteredReservations.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay reservas para los filtros seleccionados</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Total de reservas en el sistema: {reservations.length}
                  </p>
                  <button
                    onClick={() => openModal('reservation')}
                    className="mt-4 flex items-center mx-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primera reserva
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && modalType === 'slot' && (
        <SlotModal
          slot={editingItem}
          restaurants={restaurants}
          selectedDate={selectedDate}
          selectedRestaurant={selectedRestaurant}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        /> 
      )}

      {showModal && modalType === 'reservation' && (
        <ReservationModal
          reservation={editingItem}
          users={users}
          restaurants={restaurants}
          selectedDate={selectedDate}
          selectedRestaurant={selectedRestaurant}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900">Cargando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationAdmin;