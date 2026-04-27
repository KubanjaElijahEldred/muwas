import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getProductImage, normalizeCartItem } from '../utils/productPresentation';

const CartContext = createContext();
const normalizeMatchKey = (value = '') => String(value || '').trim().toLowerCase();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, api } = useAuth();

  const buildCartItemFromProduct = (product, quantity = 1) =>
    normalizeCartItem({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: user?.role === 'wholesale' && product.wholesalePrice ? product.wholesalePrice : product.price,
      image: getProductImage(product),
      quantity,
    });

  const upgradePreviewItemsWithLiveCatalog = async (items = []) => {
    const previewCount = items.filter((item) => item.isPreviewOnly).length;

    if (previewCount === 0) {
      return {
        items,
        upgradedPreviewCount: 0,
        unresolvedPreviewCount: 0,
      };
    }

    try {
      const response = await api.get('/products');
      const liveProducts = Array.isArray(response.data?.products) ? response.data.products : [];

      if (liveProducts.length === 0) {
        return {
          items,
          upgradedPreviewCount: 0,
          unresolvedPreviewCount: previewCount,
        };
      }

      const upgradedItems = items.map((item) => {
        if (!item.isPreviewOnly) {
          return item;
        }

        const exactMatch = liveProducts.find(
          (product) =>
            normalizeMatchKey(product.name) === normalizeMatchKey(item.name) &&
            normalizeMatchKey(product.category) === normalizeMatchKey(item.category)
        );
        const relaxedMatch =
          exactMatch ||
          liveProducts.find((product) => normalizeMatchKey(product.name) === normalizeMatchKey(item.name));

        if (!relaxedMatch) {
          return item;
        }

        return buildCartItemFromProduct(relaxedMatch, item.quantity);
      });

      const unresolvedPreviewCount = upgradedItems.filter((item) => item.isPreviewOnly).length;

      return {
        items: upgradedItems,
        upgradedPreviewCount: previewCount - unresolvedPreviewCount,
        unresolvedPreviewCount,
      };
    } catch (error) {
      return {
        items,
        upgradedPreviewCount: 0,
        unresolvedPreviewCount: previewCount,
      };
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');

    if (!savedCart) {
      return;
    }

    try {
      const parsedCart = JSON.parse(savedCart);
      if (Array.isArray(parsedCart)) {
        setCartItems(
          parsedCart
            .map((item) => normalizeCartItem(item))
        );
      }
    } catch (error) {
      console.error('Failed to parse saved cart:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const upgradeStoredPreviewItems = async () => {
      if (cartItems.length === 0 || !cartItems.some((item) => item.isPreviewOnly)) {
        return;
      }

      const result = await upgradePreviewItemsWithLiveCatalog(cartItems);

      if (isMounted && result.upgradedPreviewCount > 0) {
        setCartItems(result.items);
      }
    };

    upgradeStoredPreviewItems();

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = buildCartItemFromProduct(product, quantity);

    if (normalizedProduct.isPreviewOnly) {
      return {
        success: false,
        message: 'Live catalog is still loading. Please refresh products and add again.',
      };
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === normalizedProduct.productId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === normalizedProduct.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, normalizedProduct];
      }
    });

    return { success: true };
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

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      let orderItems = cartItems;
      let invalidItems = orderItems.filter((item) => item.isPreviewOnly);

      if (invalidItems.length > 0) {
        const upgradedResult = await upgradePreviewItemsWithLiveCatalog(orderItems);
        orderItems = upgradedResult.items;

        if (upgradedResult.upgradedPreviewCount > 0) {
          setCartItems(orderItems);
        }

        invalidItems = orderItems.filter((item) => item.isPreviewOnly);
      }

      if (invalidItems.length > 0) {
        return {
          success: false,
          message:
            'Some cart items could not be matched to live products. Please clear cart and add products again from the live catalog.',
        };
      }

      const response = await api.post('/orders', {
        products: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        ...orderData
      });

      return {
        success: true,
        order: response.data.order,
        payment: response.data.payment || null,
        message: response.data.message,
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Order creation failed';
      return {
        success: false,
        message,
        unauthorized: error.response?.status === 401,
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    createOrder
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
