import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  FlaskConical,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Wine,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fallbackProducts } from '../data/fallbackProducts';
import { formatLabel, formatPrice, normalizeProductCatalog } from '../utils/productPresentation';

const homeProducts = normalizeProductCatalog(fallbackProducts);

const categoryTiles = [
  { label: 'Gin', query: 'gin', icon: FlaskConical },
  { label: 'Whiskey', query: 'whiskey', icon: Wine },
  { label: 'Liqueurs', query: 'liqueur', icon: Sparkles },
  { label: 'Wholesale', query: 'wholesale', icon: Store },
];

const storyStrip = [
  '/images/home.png',
  '/images/farm.png',
  '/images/rovart.png',
  '/images/orange.png',
  '/images/story.png',
  '/images/final2.jpg',
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
      <section className="home-market__hero home-market__hero--image">
        <div className="home-market__hero-copy">
          <p>Craft spirits</p>
          <h1>Muwas sellers</h1>
          <span>Small-batch gin, whiskey, rum, and liqueurs delivered across Uganda.</span>
          <div className="home-market__hero-actions">
            <Link to="/products">Shop now</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>

        <div className="home-market__hero-frame">
          <img src="/images/home.png" alt="Muwas bottles with botanicals and farm landscape" />
        </div>
      </section>

      <section className="home-category-grid" aria-label="Shop categories">
        {categoryTiles.map(({ label, query, icon: Icon }) => (
          <Link key={label} to={`/products?search=${query}`} className="home-category-card">
            <span>
              {React.createElement(Icon, { size: 26, strokeWidth: 1.9 })}
            </span>
            <strong>{label}</strong>
          </Link>
        ))}
      </section>

      <section className="home-market__section">
        <div className="home-market__section-heading">
          <h2>Hot Deals</h2>
          <Link to="/products">
            See all
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>

        <div className="home-market__product-grid">
          {homeProducts.map((product) => (
            <article key={product._id} className="home-product-card">
              <Link to={`/product/${product._id}`} className="home-product-card__media">
                <span className="home-product-card__deal">
                  <BadgePercent size={14} strokeWidth={2} />
                  Deal
                </span>
                <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} />
              </Link>

              <div className="home-product-card__body">
                <span>{formatLabel(product.category)}</span>
                <h3>{product.name}</h3>
                <p>{formatPrice(product.price)}</p>
                <button type="button" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart size={15} strokeWidth={2} />
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-market__strip" aria-label="Muwas product preview strip">
        {storyStrip.map((image, index) => (
          <Link key={`${image}-${index}`} to="/products" className="home-market__strip-image">
            <img src={image} alt="" />
          </Link>
        ))}
      </section>

      <section className="home-market__layout">
        <div className="home-market__main">
          <div className="home-market__section-heading">
            <h2>Featured bottles</h2>
            <Link to="/products">
              View all
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <div className="home-market__product-grid">
            {homeProducts.map((product) => (
              <article key={`${product._id}-featured`} className="home-product-card">
                <Link to={`/product/${product._id}`} className="home-product-card__media">
                  <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} />
                </Link>

                <div className="home-product-card__body">
                  <span>{product.badge}</span>
                  <h3>{product.name}</h3>
                  <p>{product.shortDescription}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="home-market__side">
          <label className="home-market__search">
            <Search size={17} strokeWidth={2} />
            <input type="search" placeholder="Search Muwas store" />
            <Link to="/products">Search</Link>
          </label>

          <div className="home-market__notice">
            <Truck size={22} strokeWidth={1.9} />
            <div>
              <strong>Quick delivery is available now.</strong>
              <span>Kampala pickup, boda delivery, and wholesale fulfillment.</span>
            </div>
          </div>

          <div className="home-market__notice home-market__notice--red">
            <Package size={22} strokeWidth={1.9} />
            <div>
              <strong>Wholesale portal ready.</strong>
              <span>Approved buyers can place bulk orders with partner pricing.</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Landing;
