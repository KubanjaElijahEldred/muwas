import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BottleWine,
  CalendarDays,
  ChevronRight,
  FlaskConical,
  Leaf,
  MapPin,
  Martini,
  Search,
  ShoppingCart,
  Sparkles,
  Warehouse,
  Wine,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fallbackProducts } from '../data/fallbackProducts';
import { formatLabel, formatPrice, normalizeProductCatalog } from '../utils/productPresentation';

const homeProducts = normalizeProductCatalog(fallbackProducts);

const categoryTiles = [
  { label: 'Gin', query: 'gin', icon: FlaskConical },
  { label: 'Whiskey', query: 'whiskey', icon: Wine },
  { label: 'Liqueurs', query: 'liqueur', icon: Martini },
  { label: 'Wholesale', query: 'wholesale', icon: Warehouse },
  { label: 'Bottles', query: 'bottle', icon: BottleWine },
];

const proofPoints = [
  {
    label: 'Wholesale & tasting',
    text: 'Bookings are open now.',
    icon: CalendarDays,
  },
  {
    label: 'Premium quality',
    text: 'Crafted with passion.',
    icon: Award,
  },
  {
    label: 'Ugandan heritage',
    text: 'Proudly local. Globally inspired.',
    icon: Leaf,
  },
];

const Landing = () => {
  const [collectionQuery, setCollectionQuery] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(result?.message || 'Unable to add this bottle right now.');
    }
  };

  const handleCollectionSearch = (event) => {
    event.preventDefault();
    const query = collectionQuery.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <div className="home-market">
      <section className="home-market__hero home-market__hero--image">
        <div className="home-market__hero-copy">
          <p>Crafted in Uganda.</p>
          <h1>
            <span>Excellence</span>
            in every drop.
          </h1>
          <span>Premium spirits made from the finest local ingredients. Bold taste, true heritage.</span>
          <div className="home-market__hero-actions">
            <Link to="/products">
              Explore our bottles
              <ArrowRight size={18} strokeWidth={2.2} />
            </Link>
            <Link to="/products">View collection</Link>
          </div>
        </div>
      </section>

      <section className="home-market__proof-strip" aria-label="Muwas service highlights">
        {proofPoints.map((point) => {
          const Icon = point.icon;

          return (
            <div key={point.label} className="home-market__proof-item">
              <span>
                <Icon size={25} strokeWidth={2} />
              </span>
              <div>
                <strong>{point.label}</strong>
                <small>{point.text}</small>
              </div>
            </div>
          );
        })}
      </section>

      <section className="home-market__layout home-market__layout--showcase">
        <div className="home-market__main">
          <div className="home-market__section-heading">
            <div>
              <span>
                <Sparkles size={18} strokeWidth={2} />
                Featured bottles
              </span>
              <p>from this week's shelf.</p>
            </div>
            <Link to="/products">
              View all
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
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
                    <ShoppingCart size={16} strokeWidth={2.1} />
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </div>

          <Link to="/products" className="home-market__carousel-next" aria-label="Browse more featured bottles">
            <ChevronRight size={24} strokeWidth={2.2} />
          </Link>
        </div>

        <aside className="home-market__side">
          <div className="home-market__section-heading">
            <div>
              <span>
                <Sparkles size={18} strokeWidth={2} />
                Explore our collection
              </span>
            </div>
          </div>

          <form className="home-market__search" onSubmit={handleCollectionSearch}>
            <Search size={19} strokeWidth={2} />
            <input
              type="search"
              value={collectionQuery}
              onChange={(event) => setCollectionQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="home-category-grid" aria-label="Shop categories">
            {categoryTiles.map((category) => {
              const Icon = category.icon;

              return (
                <Link key={category.label} to={`/products?search=${category.query}`} className="home-category-card">
                  <span>
                    <Icon size={28} strokeWidth={1.8} />
                  </span>
                  <strong>{category.label}</strong>
                </Link>
              );
            })}
          </div>

          <Link to="/contact" className="home-market__location">
            <MapPin size={33} strokeWidth={2.1} />
            <div>
              <strong>Location</strong>
              <span>Masaka Road corridor, Uganda</span>
            </div>
            <span className="home-market__map-route" aria-hidden="true" />
            <MapPin size={33} strokeWidth={2.1} />
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default Landing;
