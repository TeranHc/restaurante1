// profile/ReservationsSection.js
import React from 'react';
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
  Utensils
} from 'lucide-react';

const ReservationsSection = ({ reservations, onCancelReservation, cancellingId }) => {
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
      },
      COMPLETED: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: CheckCircle,
        text: 'Completada'
      }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1.5" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const formatCreatedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
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

  const isUpcoming = (date, time) => {
    const reservationDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const hoursUntil = (reservationDateTime - now) / (1000 * 60 * 60);
    return hoursUntil > 0 && hoursUntil <= 24;
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No tienes reservas aún</p>
        <p className="text-gray-400">¡Haz tu primera reserva para ver el historial aquí!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => {
        const upcoming = isUpcoming(reservation.date, reservation.time);
        
        return (
          <div key={reservation.id} className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow ${
            upcoming ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'
          }`}>
            {/* Header de la Reserva */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Utensils className="w-5 h-5 mr-2 text-gray-600" />
                      {reservation.restaurant?.name || 'Restaurante desconocido'}
                    </h3>
                    {getStatusBadge(reservation.status)}
                    {upcoming && (
                      <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                        Próxima
                      </span>
                    )}
                  </div>
                </div>

                {canCancelReservation(reservation) && (
                  <button
                    onClick={() => onCancelReservation(reservation.id)}
                    disabled={cancellingId === reservation.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                  >
                    {cancellingId === reservation.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Información Principal */}
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <Calendar className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Fecha</p>
                  <p className="text-sm font-semibold text-slate-900">{formatDate(reservation.date)}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <Clock className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Hora</p>
                  <p className="text-lg font-semibold text-slate-900">{formatTime(reservation.time)}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <Users className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Personas</p>
                  <p className="text-lg font-semibold text-slate-900">{reservation.partySize}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <MapPin className="w-5 h-5 text-slate-600 mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Ubicación</p>
                  <p className="text-sm font-medium text-slate-900 break-words">
                    {reservation.restaurant?.address || 'Dirección no disponible'}
                  </p>
                </div>
              </div>

              {/* Información de Contacto */}
              {reservation.restaurant?.phone && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-slate-600" />
                    Contacto del restaurante
                  </h4>
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Teléfono:</span> {reservation.restaurant.phone}
                  </p>
                </div>
              )}

              {/* Solicitudes Especiales */}
              {reservation.specialRequests && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-yellow-700 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                        Solicitudes especiales
                      </h4>
                      <p className="text-sm text-yellow-800">{reservation.specialRequests}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con información adicional */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                <span>
                  Reserva creada el {formatCreatedDate(reservation.createdAt)}
                </span>
                
                {process.env.NODE_ENV === 'development' && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    ID: {reservation.id}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReservationsSection;