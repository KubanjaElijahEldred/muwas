import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Filter,
  FlaskConical,
  Leaf,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  formatLabel,
  formatPrice,
  normalizeProductCatalog,
} from '../utils/productPresentation';
import { fallbackProducts } from '../data/fallbackProducts';
import { showSuccessToast } from '../utils/toast';

const categoryIcons = {
  gin: FlaskConical,
  whiskey: Sparkles,
  liqueur: Sparkles,
  rum: ShieldCheck,
  vodka: Truck,
  reserve: Leaf,
};

const Wholesale = () => {
  const location = useLocation();
  const { user, api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setCatalogError('');
      const response = await api.get('/products');
      const data = response.data || {};

      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(normalizeProductCatalog(data.products));
        return;
      }

      setProducts(normalizeProductCatalog(fallbackProducts));
      setCatalogError('Showing signature wholesale bottles while the live catalog is empty.');
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(normalizeProductCatalog(fallbackProducts));
      setCatalogError('Showing signature wholesale bottles while the live catalog reconnects.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));

  const categoryOptions = [
    {
      key: '',
      label: 'All Bottles',
      description: `${products.length} curated pours`,
      icon: Sparkles,
    },
    ...categories.map((category) => ({
      key: category,
      label: formatLabel(category),
      description: `${products.filter((product) => product.category === category).length} bottles`,
      icon: categoryIcons[category] || Package,
    })),
  ];

  const filteredProducts = products.filter((product) => {
    const haystack = [product.name, product.shortDescription, product.description, product.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeProducts = filteredProducts.length > 0 ? filteredProducts : [];
  const showcaseProducts = (activeProducts.length > 0 ? activeProducts : products).slice(0, 3);
  const popularProducts = activeProducts.length > 0 ? activeProducts : products;
  const hasResults = activeProducts.length > 0;
  const inventoryCount = products.reduce((total, product) => total + Number(product.stock || 0), 0);
  const featuredCount = products.filter((product) => product.offer && product.offer !== 'Featured').length;

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
          price: product.wholesalePrice || product.price,
          image: product.images?.[0]?.url || '',
          quantity
        }];
      }
    });
    showSuccessToast('Cart successfully updated');
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

      await api.post('/orders', orderData);
      
      setMessage('Wholesale order placed successfully!');
      showSuccessToast('Order placed successfully');
      setCartItems([]);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to place wholesale order');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="products-page wholesale-page">
      <div className="products-page__inner">
        <section className="products-reference-hero wholesale-reference-hero">
          <div className="products-reference-hero__copy">
            <p>WHOLESALE PORTAL</p>
            <h1>
              <span>Partner</span>
              with Muwas.
            </h1>
            <small>
              Bulk ordering, partner pricing, and priority support for retailers and distributors.
            </small>
          </div>
          <div className="products-reference-hero__media">
            <img src="/images/product.png" alt="Muwas wholesale banner" />
          </div>
          <Link to="/contact" className="products-reference-hero__wholesale">CONTACT SALES</Link>
        </section>

        <section className="products-showcase wholesale-tools">
          <div className="products-toolbar">
            <label className="products-toolbar__search">
              <Search size={18} strokeWidth={1.9} />
              <input
                type="text"
                placeholder="Search for gin, reserve bottles, citrus, coffee, and more..."
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
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </label>

            <div className="products-toolbar__summary">
              <strong>{hasResults ? activeProducts.length : 0}</strong>
              <span>{hasResults ? 'matching bottles' : 'No matches yet'}</span>
            </div>
          </div>

          <div className="products-categories" aria-label="Category shortcuts">
            {categoryOptions.map(({ key, label, description, icon: Icon }) => (
              <button
                key={key || 'all'}
                type="button"
                className={`products-categories__item ${selectedCategory === key ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                <span className="products-categories__icon">
                  {React.createElement(Icon, { size: 20, strokeWidth: 1.8 })}
                </span>
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>

          <div className="products-market-strip" aria-label="Collection summary">
            <div className="products-market-strip__card">
              <strong>{products.length}</strong>
              <span>Products available for wholesale</span>
            </div>
            <div className="products-market-strip__card">
              <strong>{inventoryCount}</strong>
              <span>Units in wholesale-ready stock</span>
            </div>
            <div className="products-market-strip__card">
              <strong>{featuredCount}</strong>
              <span>Featured wholesale products</span>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="products-section__heading">
            <div>
              <p className="products-section__eyebrow">Wholesale Catalog</p>
              <h2>Exclusive products for partners.</h2>
            </div>

            <Link to="/contact" className="products-section__link">
              Need bulk pricing?
              <ArrowRight size={16} strokeWidth={1.9} />
            </Link>
          </div>

          <div className="products-deals">
            {showcaseProducts.map((product, index) => {
              const wholesalePrice = product.wholesalePrice || product.price;
              
              return (
                <article
                  key={`${product._id}-deal`}
                  className={`products-deal-card products-deal-card--${product.accent || 'default'} products-deal-card--${
                    index + 1
                  }`}
                >
                  <div className="products-deal-card__copy">
                    <span className="products-deal-card__offer">Wholesale</span>
                    <h3>{product.name}</h3>
                    <p>{product.promo}</p>
                    <div className="products-deal-card__meta">
                      <span>{formatPrice(wholesalePrice)}</span>
                      <span>{product.abv}% ABV</span>
                    </div>
                  </div>

                  <img
                    src={product.images[0]?.url}
                    alt={product.images[0]?.alt || product.name}
                    className="products-deal-card__image"
                  />
                </article>
              );
            })}
          </div>
        </section>

        <section className="products-promo">
          <div className="products-promo__copy">
            <strong>Ready to place your wholesale order?</strong>
            <span>
              Add products to your cart and submit your bulk order for priority processing and 
              dedicated wholesale support.
            </span>
          </div>

          <div className="products-promo__actions">
            <div className="wholesale-cart-summary">
              <div className="wholesale-cart-items">
                {cartItems.length === 0 ? (
                  <p>No items in wholesale cart</p>
                ) : (
                  <div className="wholesale-cart-list">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="wholesale-cart-item">
                        <span className="wholesale-cart-name">{item.name}</span>
                        <div className="wholesale-cart-controls">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="wholesale-cart-btn"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="wholesale-cart-quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="wholesale-cart-btn"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="wholesale-cart-remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <span className="wholesale-cart-price">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cartItems.length > 0 && (
                <div className="wholesale-cart-total">
                  <strong>Total: {formatPrice(getCartTotal())}</strong>
                  <button
                    onClick={createWholesaleOrder}
                    disabled={orderLoading}
                    className="products-showcase__cta products-showcase__cta--primary"
                  >
                    {orderLoading ? 'Processing...' : 'Place Wholesale Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="products-section__heading">
            <div>
              <p className="products-section__eyebrow">Full Wholesale Catalog</p>
              <h2>Complete product collection.</h2>
            </div>

            <div className="products-section__note">
              <MapPin size={16} strokeWidth={1.8} />
              <span>Masaka roots. Ugandan botanicals. Bottled with character.</span>
            </div>
          </div>

          {loading ? (
            <div className="products-empty">
              <Package size={42} strokeWidth={1.7} />
              <h3>Loading wholesale catalog...</h3>
              <p>Fetching real products from the backend.</p>
            </div>
          ) : hasResults ? (
            <div className="products-grid">
              {popularProducts.map((product) => {
                const wholesalePrice = product.wholesalePrice || product.price;

                return (
                  <article
                    key={product._id}
                    className={`products-card products-card--${product.accent || 'default'}`}
                  >
                    <div className="products-card__media">
                      <span className="products-card__badge">Wholesale</span>
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt || product.name}
                        className="products-card__image"
                      />
                    </div>

                    <div className="products-card__body">
                      <div className="products-card__header">
                        <span className="products-card__category">
                          {formatLabel(product.category)}
                        </span>
                        <span className="products-card__stock">{product.stock} in stock</span>
                      </div>

                      <h3>{product.name}</h3>
                      <p>{product.shortDescription}</p>

                      <div className="products-card__rating">
                        <div className="products-card__stars" aria-hidden="true">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={`${product._id}-star-${index}`}
                              className={index < 4 ? 'is-filled' : ''}
                              size={15}
                              strokeWidth={1.8}
                            />
                          ))}
                        </div>
                        <span>{product.rating.toFixed(1)} cellar score</span>
                      </div>

                      <div className="products-card__facts">
                        <div>
                          <span>ABV</span>
                          <strong>{product.abv}%</strong>
                        </div>
                        <div>
                          <span>Volume</span>
                          <strong>{product.volume}ml</strong>
                        </div>
                        <div>
                          <span>Wholesale</span>
                          <strong>{formatPrice(wholesalePrice)}</strong>
                        </div>
                      </div>

                      <div className="products-card__footer">
                        <div className="products-card__price">
                          <strong>{formatPrice(wholesalePrice)}</strong>
                          <span>Wholesale rate</span>
                        </div>

                        <div className="products-card__actions">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            className="products-card__button"
                          >
                            <ShoppingCart size={16} strokeWidth={1.9} />
                            Add to Order
                          </button>
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
              <h3>{catalogError ? 'Live catalog unavailable.' : 'No bottles match that search yet.'}</h3>
              <p>
                {catalogError
                  ? catalogError
                  : 'Try a broader search term or switch back to all categories.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (catalogError) {
                    window.location.reload();
                    return;
                  }

                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                {catalogError ? 'Retry loading live catalog' : 'Reset the catalog view'}
              </button>
            </div>
          )}

          {message && (
            <div className={`products-notice is-${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Wholesale;
