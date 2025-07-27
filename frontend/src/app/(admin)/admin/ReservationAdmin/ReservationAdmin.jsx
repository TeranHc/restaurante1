'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Edit2, Trash2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import SlotModal from './SlotModal';
import ReservationModal from './ReservationModal';
import CalendarView from './CalendarView';

const ReservationAdmin = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  // 🔥 NUEVO ESTADO: Para manejar la fecha seleccionada del calendario
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('');

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
        console.log('🏪 Total restaurantes cargados:', restaurantsData?.length || 0);
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
        console.log('👥 Total usuarios cargados:', usersData?.length || 0);
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
        console.log('⏰ Total slots cargados:', slotsData?.length || 0);
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
        console.log('📅 Total reservas cargadas:', reservationsData?.length || 0);
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

  // Filtrar datos por fecha y restaurante - CORREGIDO
  const filteredSlots = slots.filter(slot => {
    const matchesDate = !selectedDate || slot.date === selectedDate;
    const matchesRestaurant = selectedRestaurant === '' || slot.restaurant_id.toString() === selectedRestaurant;
    return matchesDate && matchesRestaurant;
  });

  const filteredReservations = reservations.filter(reservation => {
    const matchesDate = !selectedDate || reservation.reservation_date === selectedDate;
    const matchesRestaurant = selectedRestaurant === '' || reservation.restaurant_id.toString() === selectedRestaurant;
    return matchesDate && matchesRestaurant;
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
    // 🔥 LIMPIAR: También limpiar la fecha seleccionada del calendario
    setCalendarSelectedDate('');
  };

  const handleFormSubmit = async () => {
    await fetchData();
    closeModal();
  };

  // 🔥 NUEVA FUNCIÓN: Manejar creación de slot desde el calendario
  const handleCreateSlotFromCalendar = (dateString) => {
    console.log('📅 Fecha seleccionada del calendario:', dateString);
    setCalendarSelectedDate(dateString); // Guardar la fecha seleccionada
    setEditingItem(null); // Limpiar item de edición
    openModal('slot');
  };

  // 🔥 NUEVA FUNCIÓN: Manejar edición de slot desde el calendario
  const handleEditSlotFromCalendar = (slot) => {
    console.log('✏️ Editando slot:', slot);
    setCalendarSelectedDate(slot.date); // Establecer la fecha del slot
    setEditingItem(slot);
    openModal('slot', slot);
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
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">No Disponible</span>;
    }
    if (slot.current_reservations >= slot.max_capacity) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Lleno</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Disponible</span>;
  };

  // 🔥 NUEVO COMPONENTE: Filtros para la vista de horarios
  const CalendarFilters = () => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Restaurante:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black min-w-[200px]"
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // 🔥 NUEVO COMPONENTE: Filtros para la gestión de reservas
  const ReservationFilters = () => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border text-black border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              Limpiar Fecha
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Restaurante:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black min-w-[200px]"
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Reservas</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => openModal('slot')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Horario
              </button>
              <button
                onClick={() => openModal('reservation')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Reserva
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors  ${
                  activeTab === 'calendar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vista de Horarios
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reservations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gestión de Reservas
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calendar' && (
          <div>
            {/* 🔥 FILTROS PARA VISTA DE HORARIOS */}
            <CalendarFilters />
            
            <CalendarView
              slots={slots} // 🔥 CAMBIO: Pasar todos los slots, no filteredSlots
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onCreateSlot={handleCreateSlotFromCalendar} // 🔥 USAR NUEVA FUNCIÓN
              onEditSlot={handleEditSlotFromCalendar} // 🔥 USAR NUEVA FUNCIÓN
              onDeleteSlot={(id) => handleDelete('slot', id)}
            />
          </div>
        )}
        
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* 🔥 FILTROS PARA GESTIÓN DE RESERVAS */}
            <ReservationFilters />
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Reservas</h2>
                <p className="text-sm text-gray-500">
                  Administra todas las reservas del sistema
                  {selectedDate && ` - Fecha: ${new Date(selectedDate).toLocaleDateString('es-ES')}`}
                  {selectedRestaurant && ` - Restaurante: ${getRestaurantName(parseInt(selectedRestaurant))}`}
                </p>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando reservas...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                        <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getUserName(reservation.user_id)}</div>
                            {reservation.special_requests && (
                              <div className="text-xs text-gray-500 truncate max-w-xs" title={reservation.special_requests}>
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
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('reservation', reservation)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Editar reserva"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete('reservation', reservation.id)}
                                className="text-red-600 hover:text-red-900 transition-colors"
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
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear primera reserva
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && modalType === 'slot' && (
        <SlotModal
          slot={editingItem}
          restaurants={restaurants}
          selectedDate={calendarSelectedDate || selectedDate} // 🔥 USAR: Fecha del calendario o fecha del filtro
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
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
            <div className="flex items-center space-x-3">
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