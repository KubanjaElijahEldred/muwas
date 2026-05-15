import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  ShieldCheck,
  Leaf,
  BadgeCheck,
} from 'lucide-react';
import { fallbackProducts } from '../data/fallbackProducts';

const Landing = () => {
  const [query, setQuery] = useState('');

  const featured = useMemo(
    () => [
      {
        id: 'home-vodka',
        name: 'Coffee Flavoured Vodka',
        category: 'vodka',
        tastingNotes: ['coffee', 'smooth'],
        image: '/images/vodka.png',
      },
      {
        id: 'home-kakoge',
        name: 'Kakoge Gin',
        category: 'gin',
        tastingNotes: ['botanical', 'citrus'],
        image: '/images/kakoge.png',
      },
      {
        id: 'home-banner',
        name: 'Muwas Signature Pair',
        category: 'collection',
        tastingNotes: ['uganda', 'crafted'],
        image: '/images/product.png',
      },
    ],
    []
  );

  const filteredFeatured = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return featured;
    }

    return featured.filter((item) => {
      const haystack = [item.name, item.category, ...item.tastingNotes].join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }, [featured, query]);

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
              EXPLORE OUR BOTTLES
              <ArrowRight size={18} strokeWidth={2.2} />
            </Link>
            <Link to="/products">VIEW COLLECTION</Link>
          </div>
        </div>
      </section>

      <section className="home-ref-proof">
        <article>
          <span><BadgeCheck size={16} /></span>
          <div>
            <strong>WHOLESALE & TASTING</strong>
            <small>Bookings are open now.</small>
          </div>
        </article>
        <article>
          <span><ShieldCheck size={16} /></span>
          <div>
            <strong>PREMIUM QUALITY</strong>
            <small>Crafted with passion.</small>
          </div>
        </article>
        <article>
          <span><Leaf size={16} /></span>
          <div>
            <strong>UGANDAN HERITAGE</strong>
            <small>Proudly local. Globally inspired.</small>
          </div>
        </article>
      </section>

      <section className="home-ref-lower">
        <div className="home-ref-lower__left">
          <div className="home-ref-lower__head">
            <h2><Sparkles size={16} /> Featured bottles</h2>
            <Link to="/products">VIEW ALL <ArrowRight size={14} /></Link>
          </div>
          <p>from this week&apos;s shelf.</p>
          <div className="home-ref-cards">
            {filteredFeatured.map((item) => (
              <article key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="home-ref-card__details">
                  <strong>{item.name}</strong>
                  <span>{item.category.toUpperCase()}</span>
                </div>
              </article>
            ))}
          </div>
          {filteredFeatured.length === 0 && (
            <p className="home-ref-empty">No bottles match your search yet.</p>
          )}
        </div>
        <div className="home-ref-lower__right">
          <h2><Sparkles size={16} /> Explore our collection</h2>
          <div className="home-ref-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
            />
            <button type="button" onClick={() => setQuery('')}>CLEAR</button>
          </div>
          <div className="home-ref-stats">
            <div><strong>100% Local</strong><span>Sourced in Uganda</span></div>
            <div><strong>Crafted with care</strong><span>Small batch distilled</span></div>
            <div><strong>Secure payments</strong><span>Safe & trusted checkout</span></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
