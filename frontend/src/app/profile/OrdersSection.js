// profile/OrdersSection.js
import React from 'react';
import { 
  ShoppingBag,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  MapPin,
  Utensils,
  MessageSquare,
  X,
  AlertTriangle,
  Calendar,
  Phone
} from 'lucide-react';

const OrdersSection = ({ orders, onCancelOrder, cancellingOrderId }) => {
  console.log('🔍 OrdersSection recibió:', { 
    orders, 
    type: typeof orders,
    isArray: Array.isArray(orders),
    length: orders?.length 
  });

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pendiente: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        text: 'Pendiente'
      },
      en_preparacion: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Package,
        text: 'En Preparación'
      },
      listo: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Listo'
      },
      entregado: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Entregado'
      },
      cancelado: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Cancelado'
      }
    };

    const config = statusConfig[status] || statusConfig.pendiente;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <IconComponent className="w-4 h-4 mr-1.5" />
        {config.text}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const canCancelOrder = (order) => {
    return order?.estado === 'pendiente';
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toFixed(2);
  };

  // Validación de props
  if (!orders) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Error: No se recibieron datos de pedidos</p>
        </div>
      </div>
    );
  }

  if (!Array.isArray(orders)) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500">Error: Los datos de pedidos no tienen el formato correcto</p>
          <p className="text-xs text-gray-400 mt-2">Tipo recibido: {typeof orders}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No tienes pedidos aún</p>
        <p className="text-gray-400">¡Haz tu primer pedido para ver el historial aquí!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Debug info en desarrollo */}


      {orders.map((order, index) => {
        console.log(`📋 Renderizando pedido ${index + 1}:`, order);
        
        return (
                      <div key={order.id || index} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            {/* Header del Pedido */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{order.order_number || order.id || 'N/A'}
                    </h3>
                    {getOrderStatusBadge(order.estado)}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDateTime(order.fecha || order.created_at)}
                  </div>
                </div>

                {canCancelOrder(order) && (
                  <button
                    onClick={() => onCancelOrder(order.id)}
                    disabled={cancellingOrderId === order.id}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                  >
                    {cancellingOrderId === order.id ? (
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
                  <DollarSign className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-lg font-semibold text-slate-900">${formatPrice(order.total)}</p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <Package className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Tipo</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.order_type === 'PICKUP' ? 'Retiro' : 
                     order.order_type === 'DELIVERY' ? 'Delivery' : 
                     'No especificado'}
                  </p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <Utensils className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Productos</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {order.detalle_pedidos?.length || 0}
                  </p>
                </div>

                {order.delivery_address && (
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <MapPin className="w-5 h-5 text-slate-600 mb-1" />
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Dirección</p>
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {order.delivery_address}
                    </p>
                  </div>
                )}
              </div>

              {/* Lista de Productos */}
              {order.detalle_pedidos && Array.isArray(order.detalle_pedidos) && order.detalle_pedidos.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <Utensils className="w-4 h-4 mr-2" />
                    Productos del pedido
                  </h4>
                  <div className="space-y-3">
                    {order.detalle_pedidos.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="flex items-center justify-between bg-white rounded p-3">
                        <div className="flex items-center">
                          <div className="bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full mr-3">
                            {item.cantidad}x
                          </div>
                          <span className="text-slate-700 font-medium">
                            {item.productos?.nombre || item.producto_nombre || 'Producto'}
                          </span>
                        </div>
                        <span className="text-slate-900 font-semibold">
                          ${formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instrucciones Especiales */}
              {order.special_instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-yellow-700 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                        Instrucciones especiales
                      </h4>
                      <p className="text-sm text-yellow-800">{order.special_instructions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información del Cliente (para admin) */}
              {order.user_profiles && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Información del cliente
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nombre:</span> {order.user_profiles.first_name} {order.user_profiles.last_name}
                    </p>
                    {order.user_profiles.phone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Teléfono:</span> {order.user_profiles.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con información adicional */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                <span>
                  Pedido creado el {new Date(order.created_at || order.fecha).toLocaleDateString('es-ES')}
                </span>
                
                {/* Debug info por pedido */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    ID: {order.id} | User: {order.user_id}
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

export default OrdersSection;