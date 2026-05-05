import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FlaskConical,
  MapPin,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fallbackProducts } from '../data/fallbackProducts';
import { formatLabel, formatPrice, normalizeProductCatalog } from '../utils/productPresentation';

const homeProducts = normalizeProductCatalog(fallbackProducts);

const categoryTiles = [
  { label: 'Gin', query: 'gin', icon: FlaskConical },
  { label: 'Whiskey', query: 'whiskey', icon: Sparkles },
  { label: 'Liqueurs', query: 'liqueur', icon: Store },
  { label: 'Wholesale', query: 'wholesale', icon: Store },
  { label: 'Bottles', query: 'bottle', icon: FlaskConical },
];

const Landing = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(result?.message || 'Unable to add this bottle right now.');
    }
  };

  return (
    <div className="home-market">
      <section className="home-market__hero">
        <div className="home-market__hero-copy">
          <p>Explore our bottles.</p>
          <h1>Discover your flavor.</h1>
        </div>
        <div className="home-market__hero-shape" aria-hidden="true" />
      </section>

      <section className="home-market__layout">
        <div className="home-market__main">
          <div className="home-market__section-heading">
            <h2>Featured bottles from this week&apos;s shelf.</h2>
            <Link to="/products">
              View all
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <div className="home-market__notice">
            <strong>Wholesale and tasting bookings are open now.</strong>
            <span>Ask about signature serving formats and private events.</span>
          </div>

          <div className="home-market__product-grid">
            {homeProducts.map((product) => (
              <article key={product._id} className="home-product-card">
                <Link to={`/product/${product._id}`} className="home-product-card__media">
                  <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} />
                </Link>

                <div className="home-product-card__body">
                  <span>{formatLabel(product.category)}</span>
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                  <button type="button" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart size={14} strokeWidth={2} />
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="home-market__side">
          <div className="home-market__section-heading">
            <h2>Explore the current collection.</h2>
          </div>

          <label className="home-market__search">
            <Search size={16} strokeWidth={2} />
            <input type="search" placeholder="Search" />
            <Link to="/products">Search</Link>
          </label>

          <div className="home-category-grid">
            {categoryTiles.map((category) => (
              <Link
                key={category.label}
                to={`/products?search=${category.query}`}
                className="home-category-card"
              >
                {React.createElement(category.icon, { size: 22, strokeWidth: 2 })}
                <strong>{category.label}</strong>
              </Link>
            ))}
          </div>

          <div className="home-market__location">
            <MapPin size={18} strokeWidth={2} />
            <div>
              <strong>Location</strong>
              <span>Masaka Road corridor, Uganda</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Landing;
