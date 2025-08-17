'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Phone, 
  MessageSquare, 
  X,
  CheckCircle,
  AlertCircle,
  XCircle,
  User
} from 'lucide-react';

export default function UserProfilePage() {
  const [userData, setUserData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserReservations();
  }, []);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      // Verificar el token primero para obtener el usuario actual
      console.log('Verificando token para obtener usuario actual...');
      const userVerificationRes = await fetch('http://localhost:3001/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userVerificationRes.ok) {
        const errorData = await userVerificationRes.json();
        throw new Error(errorData.message || 'Token inválido. Por favor, inicia sesión nuevamente.');
      }

      const currentUser = await userVerificationRes.json();
      console.log('Usuario actual verificado:', currentUser);

      const userId = currentUser.id;

      // Establecer datos del usuario desde la verificación del token
      setUserData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role
      });

      // Intentar cargar reservas del usuario específico
      console.log('Cargando reservas del usuario:', userId);
      
      try {
        const apiUrl = `http://localhost:3001/api/reservations/user/${userId}`;
        console.log('Making request to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status, 'OK:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('Reservas obtenidas:', data);
          
          // Si la respuesta incluye datos del usuario, usarlos para actualizar
          if (data.user) {
            setUserData(prev => ({
              ...prev,
              ...data.user
            }));
          }
          
          setReservations(data.reservations || []);
          console.log(`✅ Se cargaron ${data.reservations?.length || 0} reservas`);
          return;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar las reservas`);
        }
      } catch (specificError) {
        console.error('Error cargando reservas específicas:', specificError);
        throw specificError;
      }

    } catch (error) {
      console.error('Error cargando reservas:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en http://localhost:3001');
      } else if (error.message.includes('404')) {
        setError('Endpoint no encontrado. Verifica que la API esté configurada correctamente.');
      } else if (error.message.includes('401') || error.message.includes('Token inválido')) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login después de un delay
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      } else if (error.message.includes('500')) {
        setError('Error interno del servidor. Revisa los logs del servidor.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    setCancellingId(reservationId);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Verificar el token para obtener el user ID actual
      const userVerificationRes = await fetch('http://localhost:3001/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userVerificationRes.ok) {
        throw new Error('Token inválido. Por favor, inicia sesión nuevamente.');
      }

      const currentUser = await userVerificationRes.json();
      const userId = currentUser.id;
      
      // Usar la nueva ruta de cancelación
      const response = await fetch(
        `http://localhost:3001/api/reservations/${reservationId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar la reserva');
      }

      const result = await response.json();
      console.log('Reserva cancelada:', result);

      // Update local state
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId 
            ? { ...reservation, status: 'CANCELLED' }
            : reservation
        )
      );

      alert('Reserva cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      
      if (error.message.includes('Token inválido')) {
        alert('Sesión expirada. Serás redirigido al login.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        text: 'Pendiente'
      },
      CONFIRMED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Confirmada'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Cancelada'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const isPastReservation = (date, time) => {
    const reservationDateTime = new Date(`${date}T${time}`);
    return reservationDateTime < new Date();
  };

  const canCancelReservation = (reservation) => {
    return reservation.status !== 'CANCELLED' && 
           reservation.status !== 'COMPLETED' &&
           !isPastReservation(reservation.date, reservation.time);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          <button 
            onClick={fetchUserReservations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
          >
            Reintentar
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <User className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 mt-1">Gestiona tu información y reservas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Information */}
        {userData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <p className="mt-1 text-sm text-gray-900">{userData.firstName} {userData.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
              </div>
              {userData.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="mt-1 text-sm text-gray-900">{userData.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reservations */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Mis Reservas ({reservations.length})
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Historial completo de todas tus reservas
            </p>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No tienes reservas aún</p>
              <p className="text-gray-400">¡Haz tu primera reserva para ver el historial aquí!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Reservation header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {reservation.restaurant?.name || 'Restaurante desconocido'}
                        </h3>
                        {getStatusBadge(reservation.status)}
                      </div>

                      {/* Main information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm">{formatDate(reservation.date)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">{formatTime(reservation.time)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">{reservation.partySize} personas</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm truncate">{reservation.restaurant?.address || 'Dirección no disponible'}</span>
                        </div>
                      </div>

                      {/* Additional information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {reservation.restaurant?.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span className="text-sm">{reservation.restaurant.phone}</span>
                          </div>
                        )}
                        
                        {reservation.specialRequests && (
                          <div className="flex items-start text-gray-600">
                            <MessageSquare className="w-4 h-4 mr-2 mt-0.5" />
                            <span className="text-sm">{reservation.specialRequests}</span>
                          </div>
                        )}
                      </div>

                      {/* Creation date */}
                      <p className="text-xs text-gray-400">
                        Reserva creada el {new Date(reservation.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Cancel button */}
                    {canCancelReservation(reservation) && (
                      <div className="ml-4">
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          {cancellingId === reservation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}