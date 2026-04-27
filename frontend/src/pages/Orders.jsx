import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Package, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const Orders = () => {
  const { user, api } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders);
    } catch (error) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
        return 'text-blue-500';
      case 'processing':
        return 'text-purple-500';
      case 'shipped':
        return 'text-green-500';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'paid':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'refunded':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-white">My Orders</h1>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-gold-600 text-dark-900 font-medium rounded-lg hover:bg-gold-500 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Shop More
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {location.state?.message && (
          <div className="bg-green-900/40 border border-green-600 text-green-100 px-4 py-3 rounded-lg mb-6">
            {location.state.message}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't placed any orders. Start shopping to see your orders here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-gold-600 text-dark-900 font-semibold rounded-lg hover:bg-gold-500 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-dark-800 rounded-lg border border-gold-600/20 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-2xl font-bold text-gold-500">
                        UGX {order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <p className={`font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Payment</p>
                      <p className={`font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Delivery Method</p>
                      <p className="font-medium text-white capitalize">
                        {order.deliveryMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Payment Method</p>
                      <p className="font-medium text-white capitalize">
                        {(order.paymentProvider || order.paymentMethod).replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gold-600/20 pt-4">
                    <h4 className="text-white font-medium mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center">
                              {item.productId?.images?.[0]?.url ? (
                                <img
                                  src={item.productId.images[0].url}
                                  alt={item.productId.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {item.productId?.name || 'Product'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-white font-medium">
                            UGX {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gold-600/20 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Shipping Address</h4>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300">{order.shippingAddress?.street}</p>
                          <p className="text-gray-300">
                            {order.shippingAddress?.city}, {order.shippingAddress?.country}
                          </p>
                          <div className="flex items-center text-gray-300">
                            <Phone className="w-4 h-4 mr-1" />
                            {order.shippingAddress?.phone}
                          </div>
                        </div>
                      </div>
                      
                      {order.trackingNumber && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Tracking Information</h4>
                          <p className="text-gray-300 text-sm">
                            Tracking Number: <span className="text-gold-500">{order.trackingNumber}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="border-t border-gold-600/20 pt-4 mt-4">
                      <h4 className="text-white font-medium mb-2">Order Notes</h4>
                      <p className="text-gray-300 text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
