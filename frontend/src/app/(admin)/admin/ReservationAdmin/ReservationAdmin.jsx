'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, Edit2, Trash2, CheckCircle, AlertCircle, XCircle, Search, X } from 'lucide-react';
import SlotModal from './SlotModal';
import ReservationModal from './ReservationModal';
import CalendarView from './CalendarView';

// 🔥 FUNCIÓN CORREGIDA PARA OBTENER TOKEN - Usar las mismas claves que en tu código funcional
const getAuthToken = () => {
  // Probar las mismas claves que usas en tu código que funciona
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('adminToken');
};

// 🔥 FUNCIÓN PARA HACER PETICIONES AUTENTICADAS
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

// 🔥 COMPONENTE FUERA: ReservationFilters definido fuera del componente principal
const ReservationFilters = ({ 
  selectedDate, 
  setSelectedDate, 
  selectedRestaurant, 
  setSelectedRestaurant, 
  searchUser, 
  setSearchUser, 
  restaurants, 
  filteredReservations, 
  reservations, 
  getRestaurantName, 
  clearFilters 
}) => {
  console.log('🔄 ReservationFilters renderizado', { searchUser });

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Primera fila: Fecha y Restaurante */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border text-black border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Restaurante:</label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black flex-1"
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        {/* 🔥 CAMPO DE BÚSQUEDA CORREGIDO */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Cliente:</label>
          <input
            type="text"
            value={searchUser}
            onChange={(e) => {
              console.log('📝 Input onChange:', e.target.value);
              setSearchUser(e.target.value);
            }}
            placeholder="Buscar por nombre..."
            className="px-3 py-2 flex-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
          />
        </div>
      </div>

      {/* Filtros activos */}
      {(selectedDate || selectedRestaurant || searchUser.trim()) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Filtros activos:</span>
              {selectedDate && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Fecha: {new Date(selectedDate).toLocaleDateString('es-ES')}
                </span>
              )}
              {selectedRestaurant && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  {getRestaurantName(parseInt(selectedRestaurant))}
                </span>
              )}
              {searchUser.trim() && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  Cliente: "{searchUser.trim()}"
                </span>
              )}
              <span className="text-gray-500">
                ({filteredReservations.length} de {reservations.length} reservas)
              </span>
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ReservationAdmin = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState('');
  const [authError, setAuthError] = useState(null); // 🔥 NUEVO: Estado para errores de autenticación

  // 🔥 FUNCIÓN MEJORADA PARA VERIFICAR AUTENTICACIÓN
  const checkAuthStatus = () => {
    const token = getAuthToken();
    if (!token) {
      const errorMsg = 'No se encontró token de autenticación. Por favor inicia sesión.';
      console.warn('⚠️', errorMsg);
      setAuthError(errorMsg);
      return false;
    } else {
      console.log('✅ Token de autenticación encontrado');
      setAuthError(null);
      return true;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (checkAuthStatus()) {
      fetchData();
    }
  }, []);

  // 🔥 FUNCIÓN fetchData MEJORADA con manejo de errores de autenticación
  const fetchData = async () => {
    setLoading(true);
    setAuthError(null); // Limpiar errores previos
    
    try {
      console.log('🔄 Iniciando carga de datos...');
      
      const apiUrls = {
        restaurants: 'http://localhost:3001/api/restaurants',
        users: 'http://localhost:3001/api/users', 
        slots: 'http://localhost:3001/api/available-slots',
        reservations: 'http://localhost:3001/api/reservations'
      };
      
      console.log('🌐 URLs de API que se están llamando:', apiUrls);

      // 🔥 USAR authenticatedFetch con manejo de errores mejorado
      const results = await Promise.allSettled([
        authenticatedFetch(apiUrls.restaurants),
        authenticatedFetch(apiUrls.users),
        authenticatedFetch(apiUrls.slots),
        authenticatedFetch(apiUrls.reservations)
      ]);

      const [restaurantsRes, usersRes, slotsRes, reservationsRes] = results;

      // Procesar restaurants
      if (restaurantsRes.status === 'fulfilled' && restaurantsRes.value.ok) {
        const restaurantsData = await restaurantsRes.value.json();
        console.log('🏪 Datos de restaurantes:', restaurantsData);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      } else {
        console.error('❌ Error en restaurantes:', restaurantsRes.reason || 'Error desconocido');
      }

      // Procesar users
      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        const usersData = await usersRes.value.json();
        console.log('👥 Datos de usuarios:', usersData);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.error('❌ Error en usuarios:', usersRes.reason || 'Error desconocido');
      }

      // Procesar slots
      if (slotsRes.status === 'fulfilled' && slotsRes.value.ok) {
        const slotsData = await slotsRes.value.json();
        console.log('⏰ Datos de slots:', slotsData);
        setSlots(Array.isArray(slotsData) ? slotsData : []);
      } else {
        console.error('❌ Error en slots:', slotsRes.reason || 'Error desconocido');
      }

      // Procesar reservations
      if (reservationsRes.status === 'fulfilled' && reservationsRes.value.ok) {
        const reservationsData = await reservationsRes.value.json();
        console.log('📅 Datos de reservas:', reservationsData);
        setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      } else {
        console.error('❌ Error en reservas:', reservationsRes.reason || 'Error desconocido');
      }

    } catch (error) {
      console.error('💥 Error de red cargando datos:', error);
      if (error.message.includes('autenticación') || error.message.includes('sesión')) {
        setAuthError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 COMPONENTE PARA MOSTRAR ERROR DE AUTENTICACIÓN
  const AuthErrorMessage = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          Error de Autenticación
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          {authError}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setAuthError(null);
              if (checkAuthStatus()) {
                fetchData();
              }
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => {
              // Aquí podrías redirigir al login
              window.location.href = '/login'; // O usar tu router
            }}
            className="flex-1 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Ir a Login
          </button>
        </div>
      </div>
    </div>
  );

  // 🔥 MOSTRAR ERROR DE AUTENTICACIÓN SI EXISTE
  if (authError) {
    return <AuthErrorMessage />;
  }

  // Filtrar slots - OPTIMIZADO
  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {
      const matchesDate = !selectedDate || slot.date === selectedDate;
      const matchesRestaurant = selectedRestaurant === '' || slot.restaurant_id.toString() === selectedRestaurant;
      return matchesDate && matchesRestaurant;
    });
  }, [slots, selectedDate, selectedRestaurant]);

  // Filtrar reservas con búsqueda por usuario - OPTIMIZADO
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesDate = !selectedDate || reservation.reservation_date === selectedDate;
      const matchesRestaurant = selectedRestaurant === '' || reservation.restaurant_id.toString() === selectedRestaurant;
      
      // Buscar por nombre de usuario
      let matchesUser = true;
      if (searchUser.trim()) {
        const user = users.find(u => u.id === reservation.user_id);
        if (user) {
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          const email = user.email ? user.email.toLowerCase() : '';
          const searchTerm = searchUser.toLowerCase().trim();
          
          matchesUser = fullName.includes(searchTerm) || 
                       email.includes(searchTerm) ||
                       user.first_name.toLowerCase().includes(searchTerm) ||
                       user.last_name.toLowerCase().includes(searchTerm);
        } else {
          matchesUser = false;
        }
      }
      
      return matchesDate && matchesRestaurant && matchesUser;
    });
  }, [reservations, selectedDate, selectedRestaurant, searchUser, users]);

  // 🔥 FUNCIÓN handleDelete MEJORADA
  const handleDelete = async (type, id) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return;
    
    try {
      const endpoint = type === 'slot' ? 'available-slots' : 'reservations';
      console.log('🗑️ Eliminando:', type, 'con ID:', id);
      
      const response = await authenticatedFetch(`http://localhost:3001/api/${endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      console.log('📡 Respuesta de eliminación:', {
        status: response.status,
        ok: response.ok
      });
      
      if (response.ok) {
        console.log('✅ Elemento eliminado exitosamente');
        await fetchData(); // Recargar datos
      } else {
        const errorData = await response.text();
        console.error('❌ Error eliminando:', response.status, errorData);
        alert(`Error eliminando: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('💥 Error eliminando:', error);
      if (error.message.includes('autenticación') || error.message.includes('sesión')) {
        setAuthError(error.message);
      } else {
        alert('Error de conexión eliminando el elemento');
      }
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
    setCalendarSelectedDate('');
  };

  const handleFormSubmit = async () => {
    await fetchData();
    closeModal();
  };

  const handleCreateSlotFromCalendar = (dateString) => {
    console.log('📅 Fecha seleccionada del calendario:', dateString);
    setCalendarSelectedDate(dateString);
    setEditingItem(null);
    openModal('slot');
  };

  const handleEditSlotFromCalendar = (slot) => {
    console.log('✏️ Editando slot:', slot);
    setCalendarSelectedDate(slot.date);
    setEditingItem(slot);
    openModal('slot', slot);
  };

  const clearFilters = useCallback(() => {
    setSelectedDate('');
    setSelectedRestaurant('');
    setSearchUser('');
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRestaurantName = useCallback((id) => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant.name : `Restaurante ${id}`;
  }, [restaurants]);

  const getUserName = useCallback((id) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : `Usuario ${id}`;
  }, [users]);

  const getAvailabilityBadge = (slot) => {
    if (!slot.is_available) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">No Disponible</span>;
    }
    if (slot.current_reservations >= slot.max_capacity) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Lleno</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Disponible</span>;
  };

  // Filtros para la vista de horarios
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
            <CalendarFilters />
            
            <CalendarView
              slots={slots}
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              onCreateSlot={handleCreateSlotFromCalendar}
              onEditSlot={handleEditSlotFromCalendar}
              onDeleteSlot={(id) => handleDelete('slot', id)}
            />
          </div>
        )}
        
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <ReservationFilters
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedRestaurant={selectedRestaurant}
              setSelectedRestaurant={setSelectedRestaurant}
              searchUser={searchUser}
              setSearchUser={setSearchUser}
              restaurants={restaurants}
              filteredReservations={filteredReservations}
              reservations={reservations}
              getRestaurantName={getRestaurantName}
              clearFilters={clearFilters}
            />
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Reservas</h2>
                <p className="text-sm text-gray-500">
                  Administra todas las reservas del sistema
                  <span className="font-medium text-blue-600">
                    {(selectedDate || selectedRestaurant || searchUser.trim()) 
                      ? ` - Mostrando ${filteredReservations.length} de ${reservations.length} reservas`
                      : ` - Total: ${reservations.length} reservas`
                    }
                  </span>
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
                            {(() => {
                              const user = users.find(u => u.id === reservation.user_id);
                              return user?.email && (
                                <div className="text-xs text-gray-500">{user.email}</div>
                              );
                            })()}
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
                    <p className="text-gray-500">
                      {(selectedDate || selectedRestaurant || searchUser.trim()) 
                        ? 'No hay reservas que coincidan con los filtros seleccionados'
                        : 'No hay reservas registradas'
                      }
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Total de reservas en el sistema: {reservations.length}
                    </p>
                    <button
                      onClick={() => openModal('reservation')}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear nueva reserva
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
          selectedDate={calendarSelectedDate || selectedDate}
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