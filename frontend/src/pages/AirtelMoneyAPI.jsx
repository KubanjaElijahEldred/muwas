import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Smartphone,
  User,
  Mail,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  Plus,
  Settings,
  RefreshCw,
  Trash2,
  QrCode,
  Phone,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AirtelMoneyAPI = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecondaryKey, setShowSecondaryKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: 'muwas distilling',
      status: 'active',
      startedOn: '04/03/2026',
      primaryKey: 'airtel_60d04c6ac4e34f3a8c41f90dabad7465',
      secondaryKey: 'airtel_e2448004aff741c1953bd96ac4d41980'
    }
  ]);

  const copyToClipboard = (text, keyType) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyType);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navigation = [
    { name: 'Logo', icon: '🏠', path: '/' },
    { name: 'Go-Live', icon: '🚀', path: '/airtel-money/go-live' },
    { name: 'Home', icon: '🏠', path: '/' },
    { name: 'Documentation', icon: '📚', path: '/airtel-money/docs' },
    { name: 'API Sandbox', icon: '🧪', path: '/airtel-money/sandbox' },
    { name: 'Products', icon: '📦', path: '/products' },
    { name: 'Support', icon: '💬', path: '/support' },
    { name: 'Profile', icon: '👤', path: '/profile' },
    { name: 'Sign out', icon: '🚪', path: '/logout' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <Header siteProducts={[]} theme="light" />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-6">Airtel Money API</h2>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to Airtel Money API
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your mobile money integration and API settings
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Endpoints</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <Mail className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">kubanjaelijah2037@gmail.com</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First name
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">Elijah Eldred</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last name
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">Kubanja</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration date
                  </label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                    <Calendar className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="text-gray-900 dark:text-white">04/03/2026</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Change name
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center">
                  <Key className="w-4 h-4 mr-2" />
                  Change password
                </button>
                <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Close account
                </button>
              </div>
            </div>

            {/* Your Subscriptions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Your Subscriptions
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">State</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{subscription.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            Rename
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                API Keys
              </h2>
              
              <div className="space-y-6">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{subscription.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Started on {subscription.startedOn}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary key</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(subscription.primaryKey, 'primary')}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {copiedKey === 'primary' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white">
                          {showApiKey ? subscription.primaryKey : '•'.repeat(subscription.primaryKey.length)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secondary key</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowSecondaryKey(!showSecondaryKey)}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {showSecondaryKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(subscription.secondaryKey, 'secondary')}
                              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {copiedKey === 'secondary' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="font-mono text-sm bg-gray-50 dark:bg-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white">
                          {showSecondaryKey ? subscription.secondaryKey : '•'.repeat(subscription.secondaryKey.length)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <QrCode className="w-8 h-8 mr-3" />
                  <h3 className="text-xl font-semibold">QR Code Payments</h3>
                </div>
                <p className="mb-4 opacity-90">Generate QR codes for instant payments</p>
                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  Generate QR Code
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Phone className="w-8 h-8 mr-3" />
                  <h3 className="text-xl font-semibold">USSD Payments</h3>
                </div>
                <p className="mb-4 opacity-90">Receive payments via USSD codes</p>
                <button className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                  Configure USSD
                </button>
              </div>
            </div>

            {/* Collection Widget */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Collection Widget</h3>
                  <p className="opacity-90">Receive mobile money payments on your website through a USSD or QR code</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Active</span>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AirtelMoneyAPI;
