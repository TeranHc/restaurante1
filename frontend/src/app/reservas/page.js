'use client';
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ClientCalendarView from './ClientCalendarView'; // Ajusta la ruta según tu estructura

// 🔥 FUNCIÓN CORREGIDA PARA OBTENER TOKEN - Misma que en ReservationAdmin
const getAuthToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('adminToken');
};

// 🔥 FUNCIÓN PARA HACER PETICIONES AUTENTICADAS - Versión mejorada
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
  
  // 🔥 MANEJO MEJORADO DE ERRORES DE AUTENTICACIÓN
  if (response.status === 401 || response.status === 403) {
    console.error(`❌ Error ${response.status}: Token inválido o sin permisos`);
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    
    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    } else {
      throw new Error('No tienes permisos para acceder a este recurso. Verifica tu rol de usuario.');
    }
  }
  
  return response;
};

export default function ReservasPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [networkError, setNetworkError] = useState(null); // 🔥 NUEVO: Para errores de red
  const [retryCount, setRetryCount] = useState(0); // 🔥 NUEVO: Contador de reintentos

  useEffect(() => {
    if (checkAuthStatus()) {
      fetchData();
    }
  }, []);

  // 🔥 FUNCIÓN PARA VERIFICAR AUTENTICACIÓN - Versión mejorada
  const checkAuthStatus = () => {
    const token = getAuthToken();
    if (!token) {
      const errorMsg = 'No se encontró token de autenticación. Por favor inicia sesión.';
      console.warn('⚠️', errorMsg);
      setAuthError(errorMsg);
      return false;
    } else {
      console.log('✅ Token de autenticación encontrado:', token.substring(0, 20) + '...');
      setAuthError(null);
      return true;
    }
  };

  // 🔥 FUNCIÓN fetchData MEJORADA con mejor manejo de errores y variable de entorno
  const fetchData = async (isRetry = false) => {
    try {
      setLoading(true);
      setAuthError(null);
      setNetworkError(null);
      
      if (!isRetry) {
        setRetryCount(0);
      }
      
      console.log('🔄 Iniciando carga de datos de reservas...');
      console.log('🔄 Retry count:', retryCount);
      console.log('🔄 API URL:', process.env.NEXT_PUBLIC_API_URL);

      // 🔥 VERIFICAR TOKEN ANTES DE HACER PETICIONES
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // ✅ CORREGIDO: Usar variable de entorno en lugar de localhost hardcodeado
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL no está configurada');
      }

      // 🔥 PRIMERO VERIFICAR QUE EL TOKEN ES VÁLIDO
      console.log('🔐 Verificando validez del token...');
      const authVerifyRes = await authenticatedFetch(`${apiUrl}/auth/verify`);
      
      if (!authVerifyRes.ok) {
        throw new Error('Token inválido o expirado');
      }

      const currentUser = await authVerifyRes.json();
      console.log('✅ Token válido para usuario:', currentUser.email || currentUser.id);

      // 🔥 CARGAR DATOS CON MEJOR MANEJO DE ERRORES - USANDO VARIABLE DE ENTORNO
      console.log('📡 Cargando restaurantes y slots...');
      
      const results = await Promise.allSettled([
        authenticatedFetch(`${apiUrl}/restaurants`),
        authenticatedFetch(`${apiUrl}/available-slots`)
      ]);

      const [restaurantsResult, slotsResult] = results;

      console.log('API responses:', {
        restaurants: { 
          status: restaurantsResult.status, 
          value: restaurantsResult.status === 'fulfilled' ? restaurantsResult.value.status : 'rejected' 
        },
        slots: { 
          status: slotsResult.status, 
          value: slotsResult.status === 'fulfilled' ? slotsResult.value.status : 'rejected' 
        }
      });

      // Procesar restaurantes
      if (restaurantsResult.status === 'fulfilled' && restaurantsResult.value.ok) {
        const restaurantsData = await restaurantsResult.value.json();
        console.log('🏪 Datos de restaurantes cargados:', restaurantsData?.length || 0);
        setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
      } else {
        console.error('❌ Error cargando restaurantes:', restaurantsResult.reason || restaurantsResult.value?.status);
        // No bloquear si solo fallan los restaurantes
        setRestaurants([]);
      }

      // Procesar slots
      if (slotsResult.status === 'fulfilled' && slotsResult.value.ok) {
        const slotsData = await slotsResult.value.json();
        console.log('⏰ Datos de slots cargados:', slotsData?.length || 0);
        setSlots(Array.isArray(slotsData) ? slotsData : []);
      } else {
        console.error('❌ Error cargando slots:', slotsResult.reason || slotsResult.value?.status);
        // No bloquear si solo fallan los slots
        setSlots([]);
      }

      console.log('✅ Carga de datos completada exitosamente');

    } catch (error) {
      console.error('💥 Error cargando datos:', error);
      
      setRetryCount(prev => prev + 1);
      
      // 🔥 MANEJO MEJORADO DE DIFERENTES TIPOS DE ERROR
      if (error.message.includes('autenticación') || error.message.includes('sesión') || 
          error.message.includes('Token') || error.message.includes('permisos')) {
        setAuthError(error.message);
      } else if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setNetworkError(`Error de conexión. Verifica que el servidor esté ejecutándose en ${process.env.NEXT_PUBLIC_API_URL}`);
      } else {
        setNetworkError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN PARA REINTENTAR CON DELAY
  const retryWithDelay = async () => {
    if (retryCount >= 3) {
      setNetworkError('Máximo número de reintentos alcanzado. Verifica tu conexión y el estado del servidor.');
      return;
    }
    
    console.log('🔄 Reintentando en 2 segundos...');
    setLoading(true);
    
    setTimeout(() => {
      if (checkAuthStatus()) {
        fetchData(true);
      }
    }, 2000);
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
              localStorage.clear();
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

  // 🔥 COMPONENTE PARA MOSTRAR ERROR DE RED
  const NetworkErrorMessage = () => (
    <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-8 h-8 text-yellow-600 mr-3" />
        <div>
          <h3 className="text-lg font-medium text-yellow-900">Error de Conexión</h3>
          <p className="text-sm text-yellow-700">{networkError}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-yellow-700">
          Intentos realizados: {retryCount}/3
        </span>
        <div className="flex space-x-3">
          <button
            onClick={retryWithDelay}
            disabled={loading || retryCount >= 3}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Reintentando...' : 'Reintentar'}
          </button>
          <button
            onClick={() => {
              setNetworkError(null);
              setRetryCount(0);
            }}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // 🔥 MOSTRAR ERROR DE AUTENTICACIÓN SI EXISTE
  if (authError) {
    return <AuthErrorMessage />;
  }

  const handleDateClick = (dateString, slot) => {
    const params = new URLSearchParams({
      date: dateString,
      restaurant: slot.restaurant_id,
      time: slot.time || '',
      slot_id: slot.id
    });
    
    router.push(`/reservas/ReservaCliente?${params.toString()}`);
  };

  const getUniqueTimeSlots = () => {
    const times = slots.map(slot => slot.time).filter(Boolean);
    return [...new Set(times)].sort();
  };

  if (loading && !networkError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando horarios disponibles...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">Intento {retryCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hacer Reserva</h1>
              <p className="text-gray-600 mt-1">Selecciona una fecha y horario para tu reserva</p>
            </div>
            
            {/* 🔥 INDICADOR DE ESTADO MEJORADO */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Conectado</span>
              </div>
              
              {/* Token info (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500">
                  Token: {getAuthToken() ? '✅' : '❌'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 🔥 MOSTRAR ERROR DE RED SI EXISTE */}
        {networkError && <NetworkErrorMessage />}

        {/* Filtros */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
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
            
            {/* 🔥 STATS MEJORADAS */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={restaurants.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {restaurants.length} restaurantes
              </span>
              <span className={slots.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {slots.length} horarios
              </span>
              <button
                onClick={() => {
                  if (checkAuthStatus()) {
                    fetchData();
                  }
                }}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Calendario */}
        {!networkError && (
          <ClientCalendarView
            slots={slots}
            restaurants={restaurants}
            selectedRestaurant={selectedRestaurant}
            selectedTimeSlot={selectedTimeSlot}
            onDateClick={handleDateClick}
          />
        )}

        {/* 🔥 MENSAJE DE AYUDA PARA DEBUGGING */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <p>• API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            <p>• Token presente: {getAuthToken() ? 'Sí' : 'No'}</p>
            <p>• Restaurantes cargados: {restaurants.length}</p>
            <p>• Slots cargados: {slots.length}</p>
            <p>• Reintentos: {retryCount}</p>
          </div>
        )}
      </div>
    </div>
  );
}