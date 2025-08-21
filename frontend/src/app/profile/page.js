// profile/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ShoppingBag,
  XCircle,
  User
} from 'lucide-react';

// Importar componentes
import UserInfoSection from '../profile/UserInfoSection';
import ReservationsSection from '../profile/ReservationsSection';
import OrdersSection from '../profile/OrdersSection';

export default function UserProfilePage() {
  const [userData, setUserData] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' | 'orders'
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
      }

      // Verificar el token para obtener el usuario actual
      const userVerificationRes = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userVerificationRes.ok) {
        const errorData = await userVerificationRes.json();
        throw new Error(errorData.message || 'Token inválido. Por favor, inicia sesión nuevamente.');
      }

      const currentUser = await userVerificationRes.json();
      console.log('Usuario actual verificado:', currentUser);

      // Establecer datos del usuario
      setUserData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
        role: currentUser.role
      });

      // Cargar reservas y pedidos en paralelo
      await Promise.all([
        fetchReservations(currentUser.id, token),
        fetchOrders(token)
      ]);

    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (userId, token) => {
    try {
      const response = await fetch(`${API_URL}/reservations/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    }
  };

  const fetchOrders = async (token) => {
    try {
      const response = await fetch(`${API_URL}/pedidos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const handleError = (error) => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      setError(`No se puede conectar al servidor. Verifica que el servidor esté ejecutándose en ${API_URL}`);
    } else if (error.message.includes('401') || error.message.includes('Token inválido')) {
      setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } else {
      setError(`Error: ${error.message}`);
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

      const response = await fetch(
        `${API_URL}/reservations/${reservationId}/cancel`,
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
      alert(`Error: ${error.message}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return;
    }

    setCancellingOrderId(orderId);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(
        `${API_URL}/pedidos/${orderId}/cancelar`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cancelar el pedido');
      }

      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, estado: 'cancelado' }
            : order
        )
      );

      alert('Pedido cancelado exitosamente');
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setCancellingOrderId(null);
    }
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
            onClick={fetchUserData}
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
              <p className="text-gray-600 mt-1">Gestiona tu información, reservas y pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Information */}
        <UserInfoSection userData={userData} />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reservations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Mis Reservas ({reservations.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingBag className="w-4 h-4 inline-block mr-2" />
                Mis Pedidos ({orders.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'reservations' && (
              <ReservationsSection 
                reservations={reservations}
                onCancelReservation={handleCancelReservation}
                cancellingId={cancellingId}
              />
            )}
            
            {activeTab === 'orders' && (
              <OrdersSection 
                orders={orders}
                onCancelOrder={handleCancelOrder}
                cancellingOrderId={cancellingOrderId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
