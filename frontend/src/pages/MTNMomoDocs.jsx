import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Code,
  Terminal,
  FileText,
  CheckCircle,
  Copy,
  Download,
  Search,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MTNMomoDocs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documentation = [
    {
      id: 1,
      title: 'Getting Started',
      category: 'basics',
      description: 'Learn how to integrate MTN MoMo API into your application',
      icon: BookOpen,
      content: 'Complete guide for initial setup and configuration'
    },
    {
      id: 2,
      title: 'Authentication',
      category: 'security',
      description: 'Secure authentication methods for API access',
      icon: CheckCircle,
      content: 'OAuth 2.0 and API key authentication'
    },
    {
      id: 3,
      title: 'Payment Endpoints',
      category: 'payments',
      description: 'All payment-related API endpoints',
      icon: Terminal,
      content: 'Initiate, verify, and manage payments'
    },
    {
      id: 4,
      title: 'Webhooks',
      category: 'integration',
      description: 'Configure webhooks for real-time notifications',
      icon: FileText,
      content: 'Payment status and transaction notifications'
    },
    {
      id: 5,
      title: 'Error Handling',
      category: 'troubleshooting',
      description: 'Common errors and how to handle them',
      icon: Code,
      content: 'Error codes, responses, and best practices'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Documentation' },
    { value: 'basics', label: 'Getting Started' },
    { value: 'security', label: 'Security' },
    { value: 'payments', label: 'Payments' },
    { value: 'integration', label: 'Integration' },
    { value: 'troubleshooting', label: 'Troubleshooting' }
  ];

  const filteredDocs = documentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Header siteProducts={[]} theme="light" />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MTN MoMo API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete guide to integrate mobile money payments into your applications
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <doc.icon className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{doc.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{doc.content}</p>
              <Link
                to={`/mtn-momo/docs/${doc.id}`}
                className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                Read more
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Quick Start Section */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Create Account</h3>
              <p className="opacity-90">Sign up for MTN MoMo API access</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get API Keys</h3>
              <p className="opacity-90">Generate your authentication keys</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Make First Payment</h3>
              <p className="opacity-90">Integrate and test your first transaction</p>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-gray-900 rounded-xl p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Sample Code</h3>
            <button
              onClick={() => copyCode(`// MTN MoMo API Example
const response = await fetch('https://api.mtn.momo/payment', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000,
    currency: 'UGX',
    phoneNumber: '+256700000000'
  })
});

const result = await response.json();`)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <pre className="text-green-400 overflow-x-auto">
            <code>{`// MTN MoMo API Example
const response = await fetch('https://api.mtn.momo/payment', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000,
    currency: 'UGX',
    phoneNumber: '+256700000000'
  })
});

const result = await response.json();`}</code>
          </pre>
        </div>

        {/* SDK Downloads */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">SDK Downloads</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Node.js SDK
            </button>
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Python SDK
            </button>
            <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center">
              <Download className="w-5 h-5 mr-2" />
              PHP SDK
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MTNMomoDocs;
