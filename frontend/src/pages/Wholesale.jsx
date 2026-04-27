import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { getProductImage, normalizeProductCatalog } from '../utils/productPresentation';

const Wholesale = () => {
  const { user, api } = useAuth();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/wholesale');
      setProducts(normalizeProductCatalog(response.data.products || []));
    } catch (error) {
      console.error('Error fetching wholesale products:', error);
      setMessage('Failed to fetch wholesale products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product._id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, {
          productId: product._id,
          name: product.name,
          price: product.wholesalePrice,
          image: getProductImage(product),
          quantity
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const createWholesaleOrder = async () => {
    if (cartItems.length === 0) {
      setMessage('Please add products to your cart');
      return;
    }

    setOrderLoading(true);
    setMessage('');

    try {
      const orderData = {
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          country: 'Uganda',
          phone: user.phone || ''
        },
        deliveryMethod: 'retailer_delivery',
        paymentMethod: 'bank_transfer',
        notes: 'Wholesale order'
      };

      const response = await api.post('/wholesale/order', orderData);
      
      setMessage('Wholesale order placed successfully!');
      setCartItems([]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to place wholesale order');
    } finally {
      setOrderLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `UGX ${price.toLocaleString()}`;
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
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-white mb-4">
            Wholesale Portal
          </h1>
          <p className="text-xl text-gray-300">
            Exclusive pricing for wholesale partners. Minimum order quantities apply.
          </p>
        </div>

        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-900/50 border border-green-600 text-green-200' 
              : 'bg-red-900/50 border border-red-600 text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg border border-gold-600/20 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Wholesale Products</h2>
              
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No wholesale products available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gold-600/20 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                          <p className="text-gray-400 text-sm mb-3">{product.shortDescription}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-gray-500 text-xs">Retail Price</p>
                              <p className="text-gray-400 line-through">{formatPrice(product.price)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Wholesale Price</p>
                              <p className="text-gold-500 font-bold">{formatPrice(product.wholesalePrice)}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(product._id, Math.max(1, (cartItems.find(item => item.productId === product._id)?.quantity || 0) - 1))}
                                className="p-1 text-gray-400 hover:text-gold-500 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-white font-medium w-8 text-center">
                                {cartItems.find(item => item.productId === product._id)?.quantity || 0}
                              </span>
                              <button
                                onClick={() => addToCart(product)}
                                className="p-1 text-gray-400 hover:text-gold-500 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">Stock: {product.stock}</p>
                              <p className="text-gray-400 text-sm">ABV: {product.abv}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg border border-gold-600/20 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4">Wholesale Order</h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No items in cart</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gold-600/20 pt-4">
                    <div className="flex justify-between text-white font-semibold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-gold-500">{formatPrice(getCartTotal())}</span>
                    </div>

                    <button
                      onClick={createWholesaleOrder}
                      disabled={orderLoading}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gold-600 text-dark-900 font-semibold rounded-lg hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {orderLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-900"></div>
                      ) : (
                        'Place Wholesale Order'
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-gold-600/10 border border-gold-600/30 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Wholesale Information</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Minimum order: 12 units per product</li>
                  <li>• Bulk discounts available</li>
                  <li>• Delivery within 3-5 business days</li>
                  <li>• Payment terms: 50% upfront</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wholesale;
