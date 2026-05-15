import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const PRODUCTS = [
  {
    _id: 'kakoge-gin',
    name: 'Kakoge Gin',
    category: 'GIN',
    price: 42000,
    abv: 37.5,
    description:
      'A vibrant botanical gin inspired by Uganda\'s landscape. Crisp, aromatic and unapologetically authentic.',
    image: '/images/kakoge.png',
  },
  {
    _id: 'coffee-vodka',
    name: 'Coffee Flavoured Vodka',
    category: 'VODKA',
    price: 45000,
    abv: 42,
    description:
      'Smooth. Rich. Distinctly Ugandan. Crafted with premium vodka and locally sourced coffee beans.',
    image: '/images/vodka.png',
  },
];

const formatUGX = (value) => `UGX ${value.toLocaleString()}`;

const Products = () => {
  const { addToCart } = useCart();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((item) => {
      const matchesCategory =
        category === 'all' || item.category.toLowerCase() === category.toLowerCase();
      const matchesQuery = !q
        || `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="products-reference-page">
      <section className="products-reference-hero">
        <div className="products-reference-hero__copy">
          <p>EXPLORE OUR SPIRITS</p>
          <h1>
            <span>Discover</span>
            your flavor.
          </h1>
          <small>Handcrafted in Uganda. Inspired by nature. Made for moments that matter.</small>
        </div>
        <div className="products-reference-hero__media">
          <img src="/images/product.png" alt="Muwas product banner" />
        </div>
        <Link to="/register" className="products-reference-hero__wholesale">WHOLESALE LOGIN</Link>
      </section>

      <section className="products-reference-strip">
        <p>
          Wholesale and tasting bookings are open now. Connect with us to explore our full range and
          experiences.
        </p>
        <div>
          <Link to="/register">WHOLESALE</Link>
          <Link to="/contact">ADD BOOKING</Link>
        </div>
      </section>

      <section className="products-reference-main">
        <div className="products-reference-head">
          <div>
            <h1>Our Spirits Collection</h1>
            <p>Premium craft spirits inspired by Uganda&apos;s rich landscape, botanicals and people.</p>
          </div>

          <label className="products-reference-search">
            <Search size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search spirits..."
              aria-label="Search spirits"
            />
          </label>
        </div>
        <div className="products-reference-categories" aria-label="Spirit categories">
          {['all', 'gin', 'vodka', 'rum', 'liqueur'].map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? 'is-active' : ''}
              onClick={() => setCategory(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="products-reference-grid">
          {filtered.map((product) => (
            <article key={product._id} className="products-reference-card">
              <img src={product.image} alt={product.name} className="products-reference-card__image" />
              <div className="products-reference-card__body">
                <span>{product.category}</span>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <strong>{formatUGX(product.price)}</strong>
                <small>{product.abv}% ABV</small>
                <div className="products-reference-card__actions">
                  <Link to={`/products?search=${encodeURIComponent(product.name)}`} className="is-outline">
                    DETAILS
                  </Link>
                  <button
                    type="button"
                    onClick={() => addToCart({
                      _id: product._id,
                      name: product.name,
                      price: product.price,
                      images: [{ url: product.image, alt: product.name }],
                    })}
                  >
                    <ShoppingCart size={15} />
                    ADD TO CART
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="products-reference-empty">No spirits match your current filter.</p>
        )}
      </section>
    </div>
  );
};

export default Products;
