import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  FlaskConical,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { fallbackProducts } from '../data/fallbackProducts';
import { fetchWithApiFallback } from '../utils/api';
import { formatLabel, formatPrice, normalizeProductCatalog } from '../utils/productPresentation';

const categoryIcons = {
  gin: FlaskConical,
  whiskey: Sparkles,
  liqueur: Store,
  rum: Sparkles,
  vodka: FlaskConical,
  other: Package,
};

const Products = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState(() => normalizeProductCatalog(fallbackProducts));
  const [loading, setLoading] = useState(true);
  const [catalogNote, setCatalogNote] = useState('Refreshing the live shelf...');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const response = await fetchWithApiFallback('/products');

        if (!response.ok) {
          throw new Error(`Catalog request failed with status ${response.status}`);
        }

        const data = await response.json();
        const liveProducts = Array.isArray(data.products) ? data.products : [];

        if (!isMounted) {
          return;
        }

        if (liveProducts.length > 0) {
          setProducts(normalizeProductCatalog(liveProducts));
          setCatalogNote('Live catalog is ready.');
          return;
        }

        setProducts(normalizeProductCatalog(fallbackProducts));
        setCatalogNote('Showing the signature shelf while the live catalog is empty.');
      } catch (error) {
        console.error('Error fetching products:', error);
        if (isMounted) {
          setProducts(normalizeProductCatalog(fallbackProducts));
          setCatalogNote('Showing the signature shelf while the live catalog reconnects.');
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

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const haystack = [product.name, product.shortDescription, product.description, product.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.trim().toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredProducts = filteredProducts.slice(0, 3);
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(result?.message || 'Unable to add this bottle right now.');
    }
  };

  return (
    <div className="products-page products-page--market">
      <div className="products-page__inner">
        <section className="products-market-hero">
          <div className="products-market-hero__copy">
            <p>Explore our bottles.</p>
            <h1>Discover your flavor.</h1>
          </div>
          <div className="products-market-hero__shape" aria-hidden="true" />
        </section>

        <section className="products-promo products-promo--market">
          <div className="products-promo__copy">
            <strong>Wholesale and tasting bookings are open now.</strong>
            <span>{catalogNote}</span>
          </div>

          <div className="products-promo__actions">
            <Link to="/login" className="products-market-button products-market-button--dark">
              Wholesale
            </Link>
            <Link to="/contact" className="products-market-button">
              Add booking
            </Link>
          </div>
        </section>

        <section className="products-market-layout">
          <div className="products-market-layout__main">
            <div className="products-section__heading products-section__heading--market">
              <div>
                <p className="products-section__eyebrow">Featured shelf</p>
                <h2>Featured bottles from this week&apos;s shelf.</h2>
              </div>
              <Link to="/contact" className="products-section__link">
                Need a stockist?
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
            </div>

            <div className="products-deals products-deals--market">
              {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3)).map((product) => (
                <article key={`${product._id}-featured`} className="products-deal-card">
                  <img
                    src={product.images[0]?.url}
                    alt={product.images[0]?.alt || product.name}
                    className="products-deal-card__image"
                  />
                  <div className="products-deal-card__copy">
                    <span className="products-deal-card__offer">{product.offer}</span>
                    <h3>{product.name}</h3>
                    <p>{formatPrice(user?.role === 'wholesale' && product.wholesalePrice ? product.wholesalePrice : product.price)}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="products-section__heading products-section__heading--market">
              <div>
                <p className="products-section__eyebrow">Collection</p>
                <h2>Explore the current collection.</h2>
              </div>
              <span className="products-section__count">
                {loading ? 'Loading' : `${displayProducts.length} bottles`}
              </span>
            </div>

            <div className="products-grid products-grid--market">
              {displayProducts.map((product) => {
                const currentPrice =
                  user?.role === 'wholesale' && product.wholesalePrice
                    ? product.wholesalePrice
                    : product.price;

                return (
                  <article key={product._id} className="products-card products-card--market">
                    <Link to={`/product/${product._id}`} className="products-card__media">
                      <span className="products-card__badge">{product.badge}</span>
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.alt || product.name}
                        className="products-card__image"
                      />
                    </Link>

                    <div className="products-card__body">
                      <div className="products-card__header">
                        <span className="products-card__category">
                          {formatLabel(product.category)}
                        </span>
                        <span className="products-card__stock">{product.stock} in stock</span>
                      </div>

                      <h3>{product.name}</h3>
                      <p>{product.shortDescription}</p>

                      <div className="products-card__footer">
                        <div className="products-card__price">
                          <strong>{formatPrice(currentPrice)}</strong>
                          <span>{product.abv}% ABV</span>
                        </div>

                        <div className="products-card__actions">
                          <Link to={`/product/${product._id}`} className="products-card__link">
                            Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="products-card__button"
                          >
                            <ShoppingCart size={16} strokeWidth={2} />
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="products-market-layout__side">
            <label className="products-toolbar__search products-toolbar__search--market">
              <Search size={18} strokeWidth={2} />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <div className="products-categories products-categories--market" aria-label="Category shortcuts">
              <button
                type="button"
                className={`products-categories__item ${selectedCategory === '' ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                <Sparkles size={20} strokeWidth={2} />
                <strong>All</strong>
                <span>{products.length} bottles</span>
              </button>

              {categories.map((category) => {
                const Icon = categoryIcons[category] || Package;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`products-categories__item ${
                      selectedCategory === category ? 'is-active' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <strong>{formatLabel(category)}</strong>
                    <span>{products.filter((product) => product.category === category).length} bottles</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Products;
