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
  X
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex">
      {/* Sidebar */}
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
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
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

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="products-showcase__card products-showcase__card--default">
                  <div className="products-showcase__card-copy">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">12%</span>
                      </div>
                    </div>
                    <strong>{stats.totalOrders}</strong>
                    <span>Total Orders</span>
                  </div>
                </div>

                <div className="products-showcase__card products-showcase__card--reserve">
                  <div className="products-showcase__card-copy">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">8%</span>
                      </div>
                    </div>
                    <strong>UGX {stats.totalRevenue.toLocaleString()}</strong>
                    <span>Total Revenue</span>
                  </div>
                </div>

                <div className="products-showcase__card products-showcase__card--botanical">
                  <div className="products-showcase__card-copy">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-medium">3%</span>
                      </div>
                    </div>
                    <strong>{stats.totalProducts}</strong>
                    <span>Products</span>
                  </div>
                </div>

                <div className="products-showcase__card products-showcase__card--select">
                  <div className="products-showcase__card-copy">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">15%</span>
                      </div>
                    </div>
                    <strong>{stats.totalUsers}</strong>
                    <span>Customers</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders and Low Stock */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="products-showcase__card products-showcase__card--default">
                  <div className="products-showcase__card-copy">
                    <h2>Recent Orders</h2>
                    <div className="space-y-4 mt-6">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order._id?.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-600">{order.customer?.name || 'Guest'}</p>
                            <p className="text-sm text-gray-600">UGX {order.totalAmount || 0}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link to="/orders" className="mt-4 text-orange-600 hover:text-orange-700 font-medium flex items-center">
                      View All Orders
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="products-showcase__card products-showcase__card--reserve">
                  <div className="products-showcase__card-copy">
                    <div className="flex items-center mb-6">
                      <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                      <h2>Low Stock Alert</h2>
                    </div>
                    <div className="space-y-4">
                      {products.filter(p => (p.stock || 0) < 10).slice(0, 5).map((product) => (
                        <div key={product._id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-red-600 font-medium">
                              {product.stock || 0} left
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link to="/products" className="mt-4 text-orange-600 hover:text-orange-700 font-medium flex items-center">
                      Manage Products
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="products-toolbar">
                <div className="flex items-center justify-between">
                  <h2>Product Management</h2>
                  <div className="flex items-center space-x-4">
                    <label className="products-toolbar__search">
                      <Search className="w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </label>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="muwas-outline-button"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>
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
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                          className="muwas-outline-button"
                        >
                          {editingProduct ? 'Update' : 'Add'} Product
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="products-showcase__card products-showcase__card--default">
                    <div className="products-showcase__card-copy">
                      <div className="flex items-center justify-between mb-4">
                        <h3>{product.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{product.shortDescription}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">UGX {product.price}</span>
                        <span className="text-sm text-gray-600">Stock: {product.stock || 0}</span>
                      </div>
                      {product.isFeatured && (
                        <div className="flex items-center text-orange-600">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Order Management</h2>
                <div className="space-y-4 mt-6">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3>Order #{order._id?.slice(-8).toUpperCase()}</h3>
                          <p className="text-sm text-gray-600">{order.customer?.name || 'Guest'}</p>
                          <p className="text-sm text-gray-600">{order.customer?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">UGX {order.totalAmount}</p>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="mt-2 px-3 py-1 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab === 'customers' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Customer Management</h2>
                <p className="text-gray-600">Customer management features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Analytics Dashboard</h2>
                <p className="text-gray-600">Analytics features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Reports</h2>
                <p className="text-gray-600">Report generation features coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Settings</h2>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="products-showcase__card products-showcase__card--default">
              <div className="products-showcase__card-copy">
                <h2>Help & Support</h2>
                <p className="text-gray-600">Help documentation coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
