import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  Code,
  Settings,
  Smartphone,
  CreditCard,
  Globe
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MTNMomoSandbox = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [requestBody, setRequestBody] = useState({
    amount: 1000,
    currency: 'UGX',
    phoneNumber: '+256700000000',
    reference: 'TEST123'
  });
  const [response, setResponse] = useState(null);
  const [logs, setLogs] = useState([]);

  const addToLogs = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const executeRequest = async () => {
    setIsPlaying(true);
    addToLogs('Sending request to MTN MoMo API...', 'info');
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        status: 'success',
        transactionId: 'TXN' + Date.now(),
        amount: requestBody.amount,
        currency: requestBody.currency,
        phoneNumber: requestBody.phoneNumber,
        reference: requestBody.reference,
        timestamp: new Date().toISOString()
      };
      
      setResponse(mockResponse);
      addToLogs('Response received successfully', 'success');
      setIsPlaying(false);
    }, 2000);
  };

  const resetSandbox = () => {
    setResponse(null);
    setLogs([]);
    setIsPlaying(false);
    addToLogs('Sandbox reset', 'info');
  };

  const copyCode = () => {
    const code = `curl -X POST https://api.mtn.momo/payment \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${requestBody.amount},
    "currency": "${requestBody.currency}",
    "phoneNumber": "${requestBody.phoneNumber}",
    "reference": "${requestBody.reference}"
  }'`;
    navigator.clipboard.writeText(code);
    addToLogs('Code copied to clipboard', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Header siteProducts={[]} theme="light" />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            MTN MoMo API Sandbox
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your API integration in a safe environment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Builder */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Request Builder
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (UGX)
                  </label>
                  <input
                    type="number"
                    value={requestBody.amount}
                    onChange={(e) => setRequestBody({...requestBody, amount: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={requestBody.phoneNumber}
                    onChange={(e) => setRequestBody({...requestBody, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={requestBody.reference}
                    onChange={(e) => setRequestBody({...requestBody, reference: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={executeRequest}
                    disabled={isPlaying}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetSandbox}
                    className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Request Code */}
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Request Code</h3>
                <button
                  onClick={copyCode}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{`curl -X POST https://api.mtn.momo/payment \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": ${requestBody.amount},
    "currency": "${requestBody.currency}",
    "phoneNumber": "${requestBody.phoneNumber}",
    "reference": "${requestBody.reference}"
  }'`}</code>
              </pre>
            </div>
          </div>

          {/* Response & Logs */}
          <div className="space-y-6">
            {/* Response */}
            {response && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  API Response
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-900 dark:text-white overflow-x-auto">
                    <code>{JSON.stringify(response, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Console Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Console Logs
              </h2>
              
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs yet. Send a request to see logs here.</p>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <span className="text-gray-500 font-mono">{log.timestamp}</span>
                        <span className={`font-mono ${
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'error' ? 'text-red-400' : 'text-gray-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Scenarios */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Test Scenarios
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setRequestBody({...requestBody, amount: 1000, phoneNumber: '+256700000000'})}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-gray-900 dark:text-white">Successful Payment (1000 UGX)</span>
                </button>
                
                <button
                  onClick={() => setRequestBody({...requestBody, amount: 5000, phoneNumber: '+256711111111'})}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-gray-900 dark:text-white">Higher Amount (5000 UGX)</span>
                </button>
                
                <button
                  onClick={() => setRequestBody({...requestBody, amount: 1000, phoneNumber: '+256722222222'})}
                  className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-3 text-red-600" />
                  <span className="text-gray-900 dark:text-white">Invalid Number (Test Error)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center space-x-6">
          <Link
            to="/mtn-momo/docs"
            className="px-6 py-3 border border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center"
          >
            <Code className="w-4 h-4 mr-2" />
            View Documentation
          </Link>
          <Link
            to="/mtn-momo"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
          >
            <Globe className="w-4 h-4 mr-2" />
            Go Live
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MTNMomoSandbox;
