import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Filter,
  Package,
  Search,
  ShoppingCart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/productPresentation';

const formatLabel = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Orders = () => {
  const { user, api } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders || []);
      setError('');
    } catch (error) {
      const serverMessage = error.response?.data?.message;

      if (error.response?.status === 401) {
        setError('Please log in to view your orders');
      } else if (error.response?.status === 503) {
        setError(serverMessage || 'Orders are temporarily unavailable while the database reconnects.');
      } else if (error.response?.status === 500) {
        setError(serverMessage || 'Server error loading orders. Please try again shortly.');
      } else {
        setError(serverMessage || 'Failed to fetch orders');
      }
      console.error('Error fetching orders:', error.response?.data || error.message);
      setOrders([]); // Clear orders on error
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations for Orders
  const createOrder = async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      if (response.data.order) {
        setOrders(prev => [response.data.order, ...prev]);
        return response.data.order;
      }
      throw new Error('Failed to create order');
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateOrder = async (orderId, updateData) => {
    try {
      const response = await api.put(`/orders/${orderId}`, updateData);
      if (response.data.order) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? response.data.order : order
        ));
        return response.data.order;
      }
      throw new Error('Failed to update order');
    } catch (error) {
      console.error('Error updating order:', error.response?.data || error.message);
      throw error;
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(order => order._id !== orderId));
      return true;
    } catch (error) {
      console.error('Error deleting order:', error.response?.data || error.message);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      if (response.data.order) {
        setOrders(prev => prev.map(order => 
          order._id === orderId ? response.data.order : order
        ));
        return response.data.order;
      }
      throw new Error('Failed to update order status');
    } catch (error) {
      console.error('Error updating order status:', error.response?.data || error.message);
      throw error;
    }
  };

  const statusOptions = [
    { key: '', label: 'All Orders', description: 'View all your orders', icon: Package },
    { key: 'pending', label: 'Pending', description: 'Orders awaiting confirmation', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', description: 'Orders confirmed and being prepared', icon: CheckCircle },
    { key: 'processing', label: 'Processing', description: 'Orders being prepared for shipment', icon: AlertTriangle },
    { key: 'shipped', label: 'Shipped', description: 'Orders on their way to you', icon: Truck },
    { key: 'delivered', label: 'Delivered', description: 'Orders successfully delivered', icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', description: 'Orders that were cancelled', icon: X }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'confirmed':
        return CheckCircle;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return AlertTriangle;
      default:
        return Package;
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

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.orderNumber,
      order.status,
      order.paymentStatus,
      order.products?.map(p => p.productId?.name).join(' ')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const activeOrders = filteredOrders.length > 0 ? filteredOrders : orders;
  const hasResults = activeOrders.length > 0;
  const showcaseOrders = activeOrders.slice(0, 3);

  useEffect(() => {
    setActiveShowcaseIndex(0);
  }, [showcaseOrders.length]);

  useEffect(() => {
    if (showcaseOrders.length <= 1) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setActiveShowcaseIndex((currentIndex) => (currentIndex + 1) % showcaseOrders.length);
    }, 4200);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, [showcaseOrders.length]);

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <Package size={42} strokeWidth={1.7} />
            <h3>Loading your orders...</h3>
            <p>Fetching order history from the backend.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page orders-page">
      <div className="products-page__inner">
        <section className="orders-hero">
          <div>
            <p className="products-section__eyebrow">My Orders</p>
            <h1>Track every bottle from checkout to delivery.</h1>
            <span>Fast status updates, payment visibility, and order details in one place.</span>
          </div>
          <div className="orders-hero__stats">
            <article>
              <strong>{orders.length}</strong>
              <span>Total Orders</span>
            </article>
            <article>
              <strong>{orders.filter((o) => o.status === 'delivered').length}</strong>
              <span>Delivered</span>
            </article>
            <article>
              <strong>{orders.filter((o) => o.status === 'pending').length}</strong>
              <span>Pending</span>
            </article>
          </div>
        </section>

        <div className="products-toolbar">
          <label className="products-toolbar__search">
            <Search size={18} strokeWidth={1.9} />
            <input
              type="text"
              placeholder="Search by order number, status, or product name..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="products-toolbar__filter">
            <Filter size={18} strokeWidth={1.9} />
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              {statusOptions.slice(1).map((status) => (
                <option key={status.key} value={status.key}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="products-toolbar__summary">
            <strong>{hasResults ? activeOrders.length : 0}</strong>
            <span>{hasResults ? 'orders found' : 'No matching orders'}</span>
          </div>
        </div>

        <div className="products-categories" aria-label="Status shortcuts">
          {statusOptions.map(({ key, label, description, icon: Icon }) => (
            <button
              key={key || 'all'}
              type="button"
              className={`products-categories__item ${selectedStatus === key ? 'is-active' : ''}`}
              onClick={() => setSelectedStatus(key)}
            >
              <span className="products-categories__icon">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <strong>{label}</strong>
              <span>{description}</span>
            </button>
          ))}
        </div>

        {location.state?.message && (
          <div className="products-notice is-success">
            {location.state.message}
          </div>
        )}

        {orders.length === 0 ? (
          <section className="products-section">
            <div className="products-section__heading">
              <div>
                <p className="products-section__eyebrow">No Orders Yet</p>
                <h2>Start your Muwas journey.</h2>
              </div>

              <Link to="/products" className="products-section__link">
                Browse products
                <ArrowRight size={16} strokeWidth={1.9} />
              </Link>
            </div>

            <div className="products-empty">
              <Package size={42} strokeWidth={1.7} />
              <h3>No orders found</h3>
              <p>
                {error
                  ? 'Orders are temporarily unavailable. Please check back shortly.'
                  : "You haven't placed any orders yet. Start shopping to see your orders here."}
              </p>
              <Link to="/products" className="products-showcase__cta products-showcase__cta--primary">
                <ShoppingCart size={16} strokeWidth={1.9} />
                Start Shopping
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="products-section">
              <div className="products-section__heading">
                <div>
                  <p className="products-section__eyebrow">Recent Orders</p>
                  <h2>Your order history.</h2>
                </div>

                <div className="products-section__note">
                  <Calendar size={16} strokeWidth={1.8} />
                  <span>Track your orders from placement to delivery.</span>
                </div>
              </div>

              {hasResults ? (
                <div className="products-grid orders-grid">
                  {activeOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    
                    return (
                      <article key={order._id} className="orders-card">
                        <div className="orders-card__media">
                          <span className={`orders-card__badge is-${order.status}`}>{formatLabel(order.status)}</span>
                          <div className="products-card__order-icon">
                            <StatusIcon size={48} strokeWidth={1.8} />
                          </div>
                        </div>

                        <div className="products-card__body orders-card__body">
                          <div className="products-card__header">
                            <span className="products-card__category">
                              {formatLabel(order.status)}
                            </span>
                            <span className="products-card__stock">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h3>Order #{order.orderNumber}</h3>
                          <p>{order.products?.length || 0} items</p>

                          <div className="products-card__rating">
                            <div className="products-card__stars" aria-hidden="true">
                              {[...Array(5)].map((_, index) => (
                                <CheckCircle
                                  key={`${order._id}-star-${index}`}
                                  className={index < 3 ? 'is-filled' : ''}
                                  size={15}
                                  strokeWidth={1.8}
                                />
                              ))}
                            </div>
                            <span className={getPaymentStatusColor(order.paymentStatus)}>
                              {formatLabel(order.paymentStatus)}
                            </span>
                          </div>

                          <div className="products-card__facts">
                            <div>
                              <span>Status</span>
                              <strong>{formatLabel(order.status)}</strong>
                            </div>
                            <div>
                              <span>Total</span>
                              <strong>{formatPrice(order.totalAmount)}</strong>
                            </div>
                            <div>
                              <span>Items</span>
                              <strong>{order.products?.length || 0}</strong>
                            </div>
                          </div>

                          <div className="products-card__footer">
                            <div className="products-card__price">
                              <strong>{formatPrice(order.totalAmount)}</strong>
                              <span>{formatLabel(order.paymentStatus)}</span>
                            </div>

                            <div className="products-card__actions">
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  className="products-card__button"
                                  onClick={() => {
                                    // Update order status
                                    const nextStatus = order.status === 'pending' ? 'confirmed' : 
                                                      order.status === 'confirmed' ? 'processing' :
                                                      order.status === 'processing' ? 'shipped' : 'delivered';
                                    updateOrderStatus(order._id, nextStatus);
                                  }}
                                >
                                  <CheckCircle size={16} strokeWidth={1.9} />
                                  Update Status
                                </button>
                              )}
                              
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  className="products-card__button products-card__button--danger"
                                  onClick={() => {
                                    // Cancel order
                                    if (window.confirm('Are you sure you want to cancel this order?')) {
                                      updateOrderStatus(order._id, 'cancelled');
                                    }
                                  }}
                                >
                                  <X size={16} strokeWidth={1.9} />
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="products-empty">
                  <Package size={42} strokeWidth={1.7} />
                  <h3>No orders match your search</h3>
                  <p>Try adjusting your search terms or status filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('');
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </section>

            <section className="products-section">
              <div className="products-section__heading">
                <div>
                  <p className="products-section__eyebrow">Order Details</p>
                  <h2>Complete order information.</h2>
                </div>
              </div>

              <div className="products-deals">
                {showcaseOrders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status);
                  
                  return (
                    <article
                      key={`${order._id}-deal`}
                      className={`products-deal-card products-deal-card--${order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : 'default'} products-deal-card--${
                        index + 1
                      }`}
                    >
                      <div className="products-deal-card__copy">
                        <span className="products-deal-card__offer">
                          <StatusIcon size={14} strokeWidth={1.8} />
                          {formatLabel(order.status)}
                        </span>
                        <h3>Order #{order.orderNumber}</h3>
                        <p>{order.products?.length || 0} items • {formatLabel(order.paymentStatus)}</p>
                        <div className="products-deal-card__meta">
                          <span>{formatPrice(order.totalAmount)}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="products-deal-card__order-summary">
                        <div className="products-deal-card__items">
                          {order.products?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="products-deal-card__item">
                              <span>{item.productId?.name || 'Product'}</span>
                              <small>Qty: {item.quantity}</small>
                            </div>
                          ))}
                          {order.products?.length > 2 && (
                            <div className="products-deal-card__more">
                              +{order.products.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <section className="products-promo">
          <div className="products-promo__copy">
            <strong>Need to place another order?</strong>
            <span>
              Browse our premium collection of craft spirits and place your next order 
              for fast delivery across Uganda.
            </span>
          </div>

          <div className="products-promo__actions">
            <Link to="/products" className="products-showcase__cta products-showcase__cta--primary">
              <ShoppingCart size={16} strokeWidth={1.9} />
              Shop More
            </Link>
            <Link to="/contact" className="products-showcase__cta">
              Contact Support
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Orders;
