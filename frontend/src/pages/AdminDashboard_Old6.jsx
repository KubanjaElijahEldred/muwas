import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Settings,
  LogOut,
  Store,
  CreditCard,
  Truck,
  Star,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Target,
  Home,
  FileText,
  HelpCircle,
  Menu,
  X,
  MapPin,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: 'gin',
    price: '',
    wholesalePrice: '',
    stock: '',
    isFeatured: false,
    images: []
  });

  // Mock statistics
  const [stats, setStats] = useState({
    totalOrders: 156,
    totalRevenue: 2450000,
    totalProducts: 48,
    totalUsers: 1234,
    pendingOrders: 12,
    lowStockProducts: 5
  });

  // Check if user is superadmin
  const isSuperAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!isSuperAdmin) {
      return;
    }
    
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
          api.get('/orders'),
          api.get('/products'),
          api.get('/auth/users')
        ]);

        if (ordersRes.status === 'fulfilled') {
          setOrders(ordersRes.value.data.orders || []);
        }
        if (productsRes.status === 'fulfilled') {
          setProducts(productsRes.value.data.products || []);
        }
        if (usersRes.status === 'fulfilled') {
          setUsers(usersRes.value.data.users || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api, isSuperAdmin]);

  const handleAddProduct = async () => {
    try {
      const response = await api.post('/products', productForm);
      setProducts([...products, response.data.product]);
      setShowAddProduct(false);
      setProductForm({
        name: '',
        shortDescription: '',
        description: '',
        category: 'gin',
        price: '',
        wholesalePrice: '',
        stock: '',
        isFeatured: false,
        images: []
      });
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      category: product.category,
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      stock: product.stock,
      isFeatured: product.isFeatured,
      images: product.images || []
    });
  };

  const handleUpdateProduct = async () => {
    try {
      const response = await api.put(`/products/${editingProduct._id}`, productForm);
      setProducts(products.map(p => p._id === editingProduct._id ? response.data.product : p));
      setEditingProduct(null);
      setProductForm({
        name: '',
        shortDescription: '',
        description: '',
        category: 'gin',
        price: '',
        wholesalePrice: '',
        stock: '',
        isFeatured: false,
        images: []
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, { status });
      setOrders(orders.map(o => o._id === orderId ? response.data.order : o));
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Redirect if not superadmin
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link to="/" className="mt-4 muwas-outline-button">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const categoryOptions = [
    { key: '', label: 'All Categories', description: 'Browse all products', icon: Package },
    { key: 'gin', label: 'Gin', description: 'Botanical spirits', icon: Sparkles },
    { key: 'whiskey', label: 'Whiskey', description: 'Aged spirits', icon: Brain },
    { key: 'rum', label: 'Rum', description: 'Caribbean style', icon: ShieldCheck },
    { key: 'liqueur', label: 'Liqueur', description: 'Sweet spirits', icon: Target },
    { key: 'vodka', label: 'Vodka', description: 'Pure spirits', icon: Zap }
  ];

  const adminStats = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, trend: '+12%', color: 'default' },
    { title: 'Revenue', value: `UGX ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+8%', color: 'reserve' },
    { title: 'Products', value: stats.totalProducts, icon: Package, trend: '-3%', color: 'botanical' },
    { title: 'Customers', value: stats.totalUsers, icon: Users, trend: '+15%', color: 'select' }
  ];

  const featureTiles = [
    { icon: Truck, title: 'Quick delivery', copy: 'Fast Kampala and Masaka dispatch on in-stock bottles.' },
    { icon: ShieldCheck, title: 'Protected checkout', copy: 'Mobile Money, card, and bank transfer supported.' },
    { icon: Sparkles, title: 'Farm-led craft', copy: 'Every bottle is shaped by local botanicals, slower runs, and warmer finishes.' }
  ];

  return (
    <div className="products-page">
      <div className="products-page__inner">
        {/* Admin Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Muwas Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/"
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-gray-500">Manage your Muwas distillery operations</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/products" className="muwas-outline-button">
                  <Store className="w-4 h-4" />
                  View Store
                </Link>
              </div>
            </div>
          </header>

          {/* Admin Showcase Section */}
          <section className="products-showcase">
            <div className="products-showcase__hero">
              <div className="products-showcase__copy">
                <div className="products-showcase__eyebrow">
                  <span>Muwas Admin Control Center</span>
                  <span>{loading ? 'Loading dashboard data...' : 'System operational'}</span>
                </div>

                <h1>
                  Welcome back, {user?.name || 'Admin'}.
                </h1>

                <p>
                  Manage catalog, orders, customers, and analytics from one central location. 
                  Track performance, monitor inventory, and optimize your Muwas distillery operations.
                </p>

                <div className="products-showcase__actions">
                  <Link
                    to="/products"
                    className="products-showcase__cta products-showcase__cta--primary"
                  >
                    View Store
                    <ArrowRight size={17} strokeWidth={1.9} />
                  </Link>
                  <Link to="/contact" className="products-showcase__cta">
                    Contact Support
                  </Link>
                </div>

                <div className="products-showcase__services">
                  {featureTiles.map(({ icon: Icon, title, copy }) => (
                    <div key={title} className="products-showcase__service">
                      <span className="products-showcase__service-icon">
                        <Icon size={18} strokeWidth={1.8} />
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <span>{copy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="products-showcase__visual">
                <div className="products-showcase__carousel">
                  <div className="products-showcase__track">
                    {adminStats.map((stat, index) => (
                      <div key={index} className="products-showcase__slide">
                        <article className={`products-showcase__card products-showcase__card--${stat.color} products-showcase__card--${index + 1}`}>
                          <div className="products-showcase__card-copy">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex items-center text-green-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-sm font-medium">{stat.trend}</span>
                              </div>
                            </div>
                            <strong>{stat.value}</strong>
                            <span>{stat.title}</span>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Admin Toolbar */}
          <section className="products-toolbar">
            <label className="products-toolbar__search">
              <Search size={18} strokeWidth={1.9} />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="products-toolbar__filter">
              <Filter size={18} strokeWidth={1.9} />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="products-toolbar__summary">
              <strong>{products.length}</strong>
              <span>Products in catalog</span>
            </div>
          </section>

          {/* Admin Categories */}
          <div className="products-categories" aria-label="Admin shortcuts">
            {sidebarItems.slice(0, 6).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`products-categories__item ${activeTab === id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <span className="products-categories__icon">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <strong>{label}</strong>
                <span>Manage {label.toLowerCase()}</span>
              </button>
            ))}
          </div>

          {/* Admin Market Strip */}
          <div className="products-market-strip" aria-label="System summary">
            <div className="products-market-strip__card">
              <strong>{stats.totalOrders}</strong>
              <span>Orders processed this month</span>
            </div>
            <div className="products-market-strip__card">
              <strong>UGX {stats.totalRevenue.toLocaleString()}</strong>
              <span>Total revenue generated</span>
            </div>
            <div className="products-market-strip__card">
              <strong>{stats.lowStockProducts}</strong>
              <span>Products needing restock</span>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Recent Activity</p>
                    <h2>Latest orders and system updates.</h2>
                  </div>

                  <Link to="/orders" className="products-section__link">
                    View all orders
                    <ArrowRight size={16} strokeWidth={1.9} />
                  </Link>
                </div>

                <div className="products-deals">
                  {orders.slice(0, 3).map((order, index) => (
                    <article
                      key={order._id}
                      className={`products-deal-card products-deal-card--default products-deal-card--${index + 1}`}
                    >
                      <div className="products-deal-card__copy">
                        <span className="products-deal-card__offer">#{order._id?.slice(-8).toUpperCase()}</span>
                        <h3>{order.customer?.name || 'Guest Customer'}</h3>
                        <p>{order.items?.length || 0} items • UGX {order.totalAmount || 0}</p>
                        <div className="products-deal-card__meta">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Product Management</p>
                    <h2>Manage your product catalog.</h2>
                  </div>

                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="products-showcase__cta products-showcase__cta--primary"
                  >
                    <Plus size={16} strokeWidth={1.9} />
                    Add Product
                  </button>
                </div>

                <div className="products-section__note">
                  <Package size={16} strokeWidth={1.8} />
                  <span>Muwas distillery. Premium spirits. Crafted with care.</span>
                </div>

                {products.length > 0 ? (
                  <div className="products-grid">
                    {products.map((product) => (
                      <article
                        key={product._id}
                        className={`products-card products-card--${product.accent || 'default'}`}
                      >
                        <div className="products-card__media">
                          <span className="products-card__badge">{product.category}</span>
                          {product.images?.[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              className="products-card__image"
                            />
                          )}
                        </div>

                        <div className="products-card__body">
                          <div className="products-card__header">
                            <span className="products-card__category">
                              {product.category}
                            </span>
                            <span className="products-card__stock">{product.stock || 0} in stock</span>
                          </div>

                          <h3>{product.name}</h3>
                          <p>{product.shortDescription}</p>

                          <div className="products-card__facts">
                            <div>
                              <span>Price</span>
                              <strong>UGX {product.price}</strong>
                            </div>
                            <div>
                              <span>Wholesale</span>
                              <strong>UGX {product.wholesalePrice || 'N/A'}</strong>
                            </div>
                            <div>
                              <span>Status</span>
                              <strong>{product.isFeatured ? 'Featured' : 'Standard'}</strong>
                            </div>
                          </div>

                          <div className="products-card__footer">
                            <div className="products-card__price">
                              <strong>UGX {product.price}</strong>
                              <span>{product.stock || 0} units available</span>
                            </div>

                            <div className="products-card__actions">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="products-card__link"
                              >
                                <Edit2 size={16} strokeWidth={1.9} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="products-card__link products-card__link--primary"
                              >
                                <Trash2 size={16} strokeWidth={1.9} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="products-empty">
                    <Package size={42} strokeWidth={1.7} />
                    <h3>No products found</h3>
                    <p>Start by adding your first product to the catalog.</p>
                  </div>
                )}
              </section>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Order Management</p>
                    <h2>Process and track customer orders.</h2>
                  </div>
                </div>

                <div className="products-section__note">
                  <ShoppingCart size={16} strokeWidth={1.8} />
                  <span>Efficient order processing. Happy customers.</span>
                </div>

                {orders.length > 0 ? (
                  <div className="products-grid">
                    {orders.map((order) => (
                      <article
                        key={order._id}
                        className="products-card products-card--default"
                      >
                        <div className="products-card__body">
                          <div className="products-card__header">
                            <span className="products-card__category">
                              Order #{order._id?.slice(-8).toUpperCase()}
                            </span>
                            <span className={`products-card__stock px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </div>

                          <h3>{order.customer?.name || 'Guest Customer'}</h3>
                          <p>{order.customer?.email || 'No email provided'}</p>

                          <div className="products-card__facts">
                            <div>
                              <span>Total</span>
                              <strong>UGX {order.totalAmount || 0}</strong>
                            </div>
                            <div>
                              <span>Items</span>
                              <strong>{order.items?.length || 0}</strong>
                            </div>
                            <div>
                              <span>Date</span>
                              <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                            </div>
                          </div>

                          <div className="products-card__footer">
                            <div className="products-card__price">
                              <strong>UGX {order.totalAmount || 0}</strong>
                              <span>{order.items?.length || 0} items</span>
                            </div>

                            <div className="products-card__actions">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                className="products-card__link"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="products-empty">
                    <ShoppingCart size={42} strokeWidth={1.7} />
                    <h3>No orders found</h3>
                    <p>Orders will appear here when customers make purchases.</p>
                  </div>
                )}
              </section>
            )}

            {/* Other tabs placeholder */}
            {activeTab === 'customers' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Customer Management</p>
                    <h2>Manage customer accounts and data.</h2>
                  </div>
                </div>

                <div className="products-empty">
                  <Users size={42} strokeWidth={1.7} />
                  <h3>Customer management coming soon</h3>
                  <p>Advanced customer features will be available here.</p>
                </div>
              </section>
            )}

            {activeTab === 'analytics' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Analytics Dashboard</p>
                    <h2>View detailed performance metrics.</h2>
                  </div>
                </div>

                <div className="products-empty">
                  <BarChart3 size={42} strokeWidth={1.7} />
                  <h3>Analytics coming soon</h3>
                  <p>Advanced analytics and reporting features will be available here.</p>
                </div>
              </section>
            )}

            {activeTab === 'reports' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Reports</p>
                    <h2>Generate business reports.</h2>
                  </div>
                </div>

                <div className="products-empty">
                  <FileText size={42} strokeWidth={1.7} />
                  <h3>Reports coming soon</h3>
                  <p>Report generation and export features will be available here.</p>
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Settings</p>
                    <h2>Configure system preferences.</h2>
                  </div>
                </div>

                <div className="products-empty">
                  <Settings size={42} strokeWidth={1.7} />
                  <h3>Settings coming soon</h3>
                  <p>System configuration options will be available here.</p>
                </div>
              </section>
            )}

            {activeTab === 'help' && (
              <section className="products-section">
                <div className="products-section__heading">
                  <div>
                    <p className="products-section__eyebrow">Help & Support</p>
                    <h2>Get help and documentation.</h2>
                  </div>
                </div>

                <div className="products-empty">
                  <HelpCircle size={42} strokeWidth={1.7} />
                  <h3>Help documentation coming soon</h3>
                  <p>Comprehensive help guides and support resources will be available here.</p>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="products-showcase__card products-showcase__card--default max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="products-showcase__card-copy">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="gin">Gin</option>
                    <option value="whiskey">Whiskey</option>
                    <option value="rum">Rum</option>
                    <option value="liqueur">Liqueur</option>
                    <option value="vodka">Vodka</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (UGX)</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wholesale Price (UGX)</label>
                    <input
                      type="number"
                      value={productForm.wholesalePrice}
                      onChange={(e) => setProductForm({...productForm, wholesalePrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <textarea
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured Product
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setProductForm({
                      name: '',
                      shortDescription: '',
                      description: '',
                      category: 'gin',
                      price: '',
                      wholesalePrice: '',
                      stock: '',
                      isFeatured: false,
                      images: []
                    });
                  }}
                  className="products-showcase__cta"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                  className="products-showcase__cta products-showcase__cta--primary"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
