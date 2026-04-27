import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Activity,
  Globe,
  MapPin,
  Truck,
  Package,
  Users,
  CreditCard,
  Zap,
  Brain,
  Target,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Radar,
  Cpu,
  Database,
  Wifi,
  Battery,
  ChevronRight,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  Timer,
  Navigation,
  Radio,
  Cloud,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Mock real-time data
  const [kpiData, setKpiData] = useState({
    totalOrders: 1847,
    revenueFlow: 2847500,
    pendingPayments: 12,
    accountGrowth: {
      wholesale: 234,
      retail: 1847
    },
    fleetStatus: {
      active: 18,
      idle: 4,
      maintenance: 2
    }
  });

  const [riskAlerts, setRiskAlerts] = useState([
    {
      id: 1,
      type: 'high',
      title: 'Payment Delay Risk',
      description: '3 wholesale accounts approaching credit limit',
      time: '2 min ago',
      severity: 'critical'
    },
    {
      id: 2,
      type: 'medium',
      title: 'Delivery Bottleneck',
      description: 'Kampala route experiencing 45min delays',
      time: '8 min ago',
      severity: 'warning'
    },
    {
      id: 3,
      type: 'low',
      title: 'Unconfirmed Orders',
      description: '7 retail orders pending confirmation',
      time: '15 min ago',
      severity: 'info'
    }
  ]);

  const [fleetData, setFleetData] = useState([
    { id: 'TRK-001', driver: 'James Okello', location: 'Kampala', status: 'active', speed: 45, fuel: 78, nextDelivery: '12:30' },
    { id: 'TRK-002', driver: 'Sarah Nalule', location: 'Masaka', status: 'active', speed: 38, fuel: 65, nextDelivery: '14:15' },
    { id: 'TRK-003', driver: 'David Muwanga', location: 'Entebbe', status: 'idle', speed: 0, fuel: 92, nextDelivery: '16:00' },
    { id: 'TRK-004', driver: 'Grace Nakato', location: 'Jinja', status: 'maintenance', speed: 0, fuel: 45, nextDelivery: 'N/A' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setKpiData(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + Math.floor(Math.random() * 3),
        revenueFlow: prev.revenueFlow + Math.floor(Math.random() * 5000),
        pendingPayments: Math.max(0, prev.pendingPayments + (Math.random() > 0.7 ? 1 : -1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Generate AI insights
  useEffect(() => {
    const insights = [
      {
        title: 'Predictive Demand Surge',
        description: 'AI predicts 23% order volume increase in next 4 hours',
        confidence: 87,
        action: 'Prepare additional fleet capacity'
      },
      {
        title: 'Payment Pattern Analysis',
        description: '3 retailers showing delayed payment behavior - risk score: 7.2/10',
        confidence: 92,
        action: 'Send payment reminders and review credit limits'
      },
      {
        title: 'Route Optimization',
        description: 'Alternative route via Entebbe could save 18min on Kampala deliveries',
        confidence: 78,
        action: 'Update navigation for active fleet'
      }
    ];
    setAiInsights(insights);
  }, []);

  // Fetch real data
  const fetchDashboardData = async ({ initial = false, silent = false } = {}) => {
    if (initial) {
      setLoading(true);
    }

    try {
      const [ordersResult, productsResult, contactsResult] = await Promise.allSettled([
        api.get('/orders?limit=200'),
        api.get('/products?limit=200'),
        api.get('/contact?limit=200'),
      ]);

      const nextOrders = ordersResult.status === 'fulfilled' ? ordersResult.value?.data?.orders || [] : [];
      const nextProducts = productsResult.status === 'fulfilled' ? productsResult.value?.data?.products || [] : [];
      const nextContacts = contactsResult.status === 'fulfilled' ? contactsResult.value?.data?.contacts || [] : [];

      setOrders(nextOrders);
      setProducts(nextProducts);
      setContacts(nextContacts);
      
      // Update KPI data with real values
      setKpiData(prev => ({
        ...prev,
        totalOrders: nextOrders.length || prev.totalOrders,
        revenueFlow: nextOrders.reduce((sum, order) => sum + (order.totalAmount || 0), prev.revenueFlow),
        pendingPayments: nextOrders.filter(order => order.paymentStatus === 'pending').length
      }));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData({ initial: true });
  }, []);

  const navigation = [
    { name: 'Overview', icon: BarChart3, path: 'overview' },
    { name: 'Orders', icon: ShoppingCart, path: 'orders' },
    { name: 'Products', icon: Package, path: 'products' },
    { name: 'Customers', icon: Users, path: 'customers' },
    { name: 'Fleet Tracking', icon: Truck, path: 'fleet' },
    { name: 'Analytics', icon: LineChart, path: 'analytics' },
    { name: 'Settings', icon: Settings, path: 'settings' }
  ];

  const getKPICard = (title, value, change, icon, color) => (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
      <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
            <icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : change < 0 ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );

  const getRiskAlertCard = (alert) => {
    const severityColors = {
      critical: 'from-red-500 to-orange-500',
      warning: 'from-yellow-500 to-orange-500',
      info: 'from-blue-500 to-cyan-500'
    };

    return (
      <div key={alert.id} className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r ${severityColors[alert.severity]}/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300`}></div>
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/50 transition-all duration-300">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${severityColors[alert.severity]} flex items-center justify-center flex-shrink-0`}>
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1">{alert.title}</h4>
              <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{alert.time}</span>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading Operations Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.15),transparent_50%)] pointer-events-none"></div>
      
      <Header siteProducts={[]} theme="dark" />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-gray-900/60 backdrop-blur-xl border-r border-gray-800/50 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Muwas Operations
                </h2>
                <p className="text-xs text-gray-400">Command Center</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.path
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50'
                      : 'hover:bg-gray-800/50 border border-transparent'
                  }`}
                >
                  <item.icon className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Global Operations Overview
                </h1>
                <p className="text-gray-400">Real-time logistics intelligence and predictive analytics</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-xl px-4 py-2">
                  <div className={`w-2 h-2 rounded-full ${systemStatus === 'operational' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                  <span className="text-sm font-medium capitalize">{systemStatus}</span>
                </div>
                
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-3 rounded-xl border transition-all duration-200 ${
                    autoRefresh 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                      : 'bg-gray-900/80 border-gray-800/50 text-gray-400'
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
                
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {getKPICard('Total Orders', kpiData.totalOrders, 12.4, ShoppingCart, 'from-cyan-500 to-blue-500')}
                  {getKPICard('Revenue Flow', `UGX ${kpiData.revenueFlow.toLocaleString()}`, 8.7, DollarSign, 'from-green-500 to-emerald-500')}
                  {getKPICard('Pending Payments', kpiData.pendingPayments, -3.2, Clock, 'from-yellow-500 to-orange-500')}
                  {getKPICard('Account Growth', kpiData.accountGrowth.wholesale + kpiData.accountGrowth.retail, 15.3, Users, 'from-purple-500 to-pink-500')}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Risk Monitor & AI Insights */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* AI Risk Monitor */}
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Brain className="w-5 h-5 mr-2 text-cyan-400" />
                          AI Risk Monitor
                        </h3>
                        <span className="text-xs text-gray-400">Live</span>
                      </div>
                      
                      <div className="space-y-3">
                        {riskAlerts.map(getRiskAlertCard)}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Zap className="w-5 h-5 mr-2 text-purple-400" />
                          AI Insights
                        </h3>
                        <span className="text-xs text-gray-400">Predictive</span>
                      </div>
                      
                      <div className="space-y-4">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                            <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                                <span className="text-xs text-purple-400">{insight.confidence}% confidence</span>
                              </div>
                              <p className="text-gray-400 text-xs mb-3">{insight.description}</p>
                              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                {insight.action} →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Panel */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Supply Chain Performance */}
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center">
                          <LineChart className="w-5 h-5 mr-2 text-cyan-400" />
                          Supply Chain Performance
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors">
                            <Filter className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="h-64 bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">Interactive Performance Chart</p>
                          <p className="text-xs text-gray-500 mt-1">Real-time analytics visualization</p>
                        </div>
                      </div>
                    </div>

                    {/* Fleet Tracking */}
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center">
                          <Radar className="w-5 h-5 mr-2 text-green-400" />
                          Live Fleet Tracking
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-400">Active</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-gray-400">Idle</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-gray-400">Maintenance</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fleetData.map((vehicle) => (
                          <div key={vehicle.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  vehicle.status === 'active' ? 'bg-green-500' :
                                  vehicle.status === 'idle' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className="font-mono text-sm text-white">{vehicle.id}</span>
                              </div>
                              <span className="text-xs text-gray-400 capitalize">{vehicle.status}</span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Driver:</span>
                                <span className="text-white">{vehicle.driver}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Location:</span>
                                <span className="text-white">{vehicle.location}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Speed:</span>
                                <span className="text-white">{vehicle.speed} km/h</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Fuel:</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        vehicle.fuel > 60 ? 'bg-green-500' :
                                        vehicle.fuel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${vehicle.fuel}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-white">{vehicle.fuel}%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Next Delivery:</span>
                                <span className="text-white">{vehicle.nextDelivery}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Status Bar */}
                <div className="mt-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">Database:</span>
                        <span className="text-sm text-green-400">Operational</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">Network:</span>
                        <span className="text-sm text-green-400">99.9% Uptime</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">CPU:</span>
                        <span className="text-sm text-yellow-400">42%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Battery className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">Power:</span>
                        <span className="text-sm text-green-400">Stable</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-400">Last updated: {new Date().toLocaleTimeString()}</span>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">System Secured</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Management</h2>
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Order management interface</p>
                  <p className="text-sm text-gray-500 mt-2">Real orders from database will appear here</p>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Product Management</h2>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Product management interface</p>
                  <p className="text-sm text-gray-500 mt-2">Real products from database will appear here</p>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'overview' && activeTab !== 'orders' && activeTab !== 'products' && (
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 capitalize">{activeTab}</h2>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">{activeTab} management interface</p>
                  <p className="text-sm text-gray-500 mt-2">Advanced features coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
