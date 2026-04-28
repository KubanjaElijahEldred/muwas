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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  formatLabel,
  formatPrice,
  normalizeProductCatalog,
} from '../utils/productPresentation';
import TypewriterText from '../components/TypewriterText';
import { fetchWithApiFallback } from '../utils/api';
import { fallbackProducts } from '../data/fallbackProducts';

const featureTiles = [
  {
    icon: Truck,
    title: 'Quick delivery',
    copy: 'Fast Kampala and Masaka dispatch on in-stock bottles.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected checkout',
    copy: 'Mobile Money, card, and bank transfer supported.',
  },
  {
    icon: Sparkles,
    title: 'Farm-led craft',
    copy: 'Every bottle is shaped by local botanicals, slower runs, and warmer finishes.',
  },
];

const categoryIcons = {
  gin: FlaskConical,
  whiskey: Sparkles,
  liqueur: Sparkles,
  rum: ShieldCheck,
  vodka: Truck,
  reserve: Leaf,
};

const Products = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setCatalogError('');
        const response = await fetchWithApiFallback('/products');

        if (!response.ok) {
          throw new Error(`Catalog request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(normalizeProductCatalog(data.products));
          return;
        }

        setProducts([]);
        setCatalogError('Live catalog is empty right now.');
      } catch (error) {
        console.error('Error fetching products:', error);
        if (isMounted) {
          setProducts([]);
          setCatalogError('Unable to load products. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

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
  const catalogStatus = loading
    ? 'Refreshing the live cellar list...'
    : catalogError
      ? 'Live catalog unavailable.'
      : 'Ready to shop and compare.';
  const inventoryCount = products.reduce((total, product) => total + Number(product.stock || 0), 0);
  const featuredCount = products.filter((product) => product.offer && product.offer !== 'Featured').length;

  useEffect(() => {
    setActiveShowcaseIndex(0);
  }, [showcaseProducts.length]);

  useEffect(() => {
    if (showcaseProducts.length <= 1) {
      return undefined;
    }

    const slideTimer = window.setInterval(() => {
      setActiveShowcaseIndex((currentIndex) => (currentIndex + 1) % showcaseProducts.length);
    }, 4200);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, [showcaseProducts.length]);

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(result?.message || 'Unable to add this item right now.');
    }
  };

  return (
    <div className="products-page">
      <div className="products-page__inner">
        <section className="products-showcase">
          <div className="products-showcase__hero">
            <div className="products-showcase__copy">
              <div className="products-showcase__eyebrow">
                <span>Muwas Market Hall</span>
                <span>{catalogStatus}</span>
              </div>

              <h1>
                <TypewriterText 
                  texts={[
                    "Exceptional spirits crafted perfectly.",
                    "Ugandan heritage distilled daily.", 
                    "Premium quality guaranteed always."
                  ]}
                  speed={30}
                  delay={500}
                  deleteSpeed={20}
                  pauseDuration={2000}
                />
              </h1>

              <p>
                Browse the current Muwas collection, compare tasting notes, and move from showcase
                bottle to checkout without losing the farm-led amber identity of the brand.
              </p>

              <div className="products-showcase__actions">
                <Link
                  to="/contact"
                  className="products-showcase__cta products-showcase__cta--primary"
                >
                  Book a tasting
                  <ArrowRight size={17} strokeWidth={1.9} />
                </Link>
                <Link to="/story" className="products-showcase__cta">
                  Read the Muwas story
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
                <div
                  className="products-showcase__track"
                  style={{ transform: `translateX(-${activeShowcaseIndex * 100}%)` }}
                >
                  {showcaseProducts.map((product, index) => {
                    const currentPrice =
                      user?.role === 'wholesale' && product.wholesalePrice
                        ? product.wholesalePrice
                        : product.price;

                    return (
                      <div key={`${product._id}-showcase`} className="products-showcase__slide">
                        <article
                          className={`products-showcase__card products-showcase__card--${product.accent || 'default'} products-showcase__card--${
                            index + 1
                          }`}
                        >
                          <span className="products-showcase__card-badge">{product.offer}</span>

                          <div className="products-showcase__card-copy">
                            <strong>{product.name}</strong>
                            <span>{product.badge}</span>
                            <p className="products-showcase__card-note">{product.promo}</p>

                            <div className="products-showcase__card-facts">
                              <span>{formatPrice(currentPrice)}</span>
                              <span>{product.abv}% ABV</span>
                              <span>{product.volume}ml</span>
                            </div>

                            <div className="products-showcase__card-actions">
                              <Link
                                to={`/product/${product._id}`}
                                className="products-showcase__card-link"
                              >
                                View bottle
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                disabled={product.isPreviewOnly}
                                className="products-showcase__card-link products-showcase__card-link--primary"
                              >
                                <ShoppingCart size={16} strokeWidth={1.9} />
                                {product.isPreviewOnly ? 'Live catalog unavailable' : 'Add to cart'}
                              </button>
                            </div>
                          </div>

                          <div className="products-showcase__card-media">
                            <img
                              src={product.images[0]?.url}
                              alt={product.images[0]?.alt || product.name}
                              className="products-showcase__card-image"
                            />
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="products-showcase__controls">
                <p className="products-showcase__caption">Featured products on automatic slideshow</p>

                <div className="products-showcase__pagination" aria-label="Featured product slides">
                  {showcaseProducts.map((product, index) => (
                    <button
                      key={`${product._id}-dot`}
                      type="button"
                      className={`products-showcase__slide-button ${
                        activeShowcaseIndex === index ? 'is-active' : ''
                      }`}
                      onClick={() => setActiveShowcaseIndex(index)}
                      aria-label={`Show ${product.name}`}
                      aria-pressed={activeShowcaseIndex === index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <strong>{label}</strong>
                <span>{description}</span>
              </button>
            ))}
          </div>

          <div className="products-market-strip" aria-label="Collection summary">
            <div className="products-market-strip__card">
              <strong>{products.length}</strong>
              <span>Signature bottles in the current collection</span>
            </div>
            <div className="products-market-strip__card">
              <strong>{inventoryCount}</strong>
              <span>Units visible across retail-ready stock</span>
            </div>
            <div className="products-market-strip__card">
              <strong>{featuredCount}</strong>
              <span>Highlighted pours promoted for tours and gifting</span>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="products-section__heading">
            <div>
              <p className="products-section__eyebrow">Hot Deals</p>
              <h2>Featured bottles from this week&apos;s shelf.</h2>
            </div>

            <Link to="/contact" className="products-section__link">
              Need a stockist?
              <ArrowRight size={16} strokeWidth={1.9} />
            </Link>
          </div>

          <div className="products-deals">
            {showcaseProducts.map((product, index) => (
              <article
                key={`${product._id}-deal`}
                className={`products-deal-card products-deal-card--${product.accent || 'default'} products-deal-card--${
                  index + 1
                }`}
              >
                <div className="products-deal-card__copy">
                  <span className="products-deal-card__offer">{product.offer}</span>
                  <h3>{product.name}</h3>
                  <p>{product.promo}</p>
                  <div className="products-deal-card__meta">
                    <span>
                      {formatPrice(
                        user?.role === 'wholesale' && product.wholesalePrice
                          ? product.wholesalePrice
                          : product.price
                      )}
                    </span>
                    <span>{product.abv}% ABV</span>
                  </div>
                </div>

                <img
                  src={product.images[0]?.url}
                  alt={product.images[0]?.alt || product.name}
                  className="products-deal-card__image"
                />
              </article>
            ))}
          </div>
        </section>

        <section className="products-promo">
          <div className="products-promo__copy">
            <strong>Wholesale and tasting bookings are open now.</strong>
            <span>
              Sign in for wholesale pricing, or book a guided farm and distillery experience for
              your team.
            </span>
          </div>

          <div className="products-promo__actions">
            <Link to="/login" className="products-showcase__cta products-showcase__cta--primary">
              Wholesale login
            </Link>
            <Link to="/contact" className="products-showcase__cta">
              Book a tour
            </Link>
          </div>
        </section>

        <section className="products-section">
          <div className="products-section__heading">
            <div>
              <p className="products-section__eyebrow">Popular This Week</p>
              <h2>Explore the current collection.</h2>
            </div>

            <div className="products-section__note">
              <MapPin size={16} strokeWidth={1.8} />
              <span>Masaka roots. Ugandan botanicals. Bottled with character.</span>
            </div>
          </div>

          {loading ? (
            <div className="products-empty">
              <Package size={42} strokeWidth={1.7} />
              <h3>Loading live catalog...</h3>
              <p>Fetching real products from the backend.</p>
            </div>
          ) : hasResults ? (
            <div className="products-grid">
              {popularProducts.map((product) => {
                const currentPrice =
                  user?.role === 'wholesale' && product.wholesalePrice
                    ? product.wholesalePrice
                    : product.price;

                return (
                  <article
                    key={product._id}
                    className={`products-card products-card--${product.accent || 'default'}`}
                  >
                    <div className="products-card__media">
                      <span className="products-card__badge">{product.badge}</span>
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
                          <span>Profile</span>
                          <strong>{product.offer}</strong>
                        </div>
                      </div>

                      <div className="products-card__footer">
                        <div className="products-card__price">
                          <strong>{formatPrice(currentPrice)}</strong>
                          {user?.role === 'wholesale' && product.wholesalePrice ? (
                            <span>Wholesale rate applied</span>
                          ) : (
                            <span>{product.badge}</span>
                          )}
                        </div>

                        <div className="products-card__actions">
                          <Link to={`/product/${product._id}`} className="products-card__link">
                            View Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.isPreviewOnly}
                            className="products-card__button"
                          >
                            <ShoppingCart size={16} strokeWidth={1.9} />
                            {product.isPreviewOnly ? 'Live catalog unavailable' : 'Add to cart'}
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
        </section>
      </div>
    </div>
  );
};

export default Products;
