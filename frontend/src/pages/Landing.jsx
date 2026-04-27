import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Compass,
  CreditCard,
  FlaskConical,
  Landmark,
  Leaf,
  MapPin,
  Smartphone,
} from 'lucide-react';

const landingArtwork = '/images/home.png';

const experiences = [
  {
    icon: Compass,
    title: 'The Canadian Connection',
    description:
      'Technical partnership and research-led recipe development shaped the first Muwas small-batch pours.',
    cta: 'Our Origins',
    to: '/story',
  },
  {
    icon: Leaf,
    title: 'East African Botanical Exploration',
    description:
      'Local ingredients lead every blend, from bright citrus peels to layered spice and aromatic farm botanicals.',
    cta: 'Botanicals Guide',
    to: '/products',
  },
  {
    icon: FlaskConical,
    title: 'Distillation & Craft',
    description:
      'Traditional methods and careful slow runs bring warmth, clarity, and a finish that feels deliberately made.',
    cta: 'Learn More',
    to: '/story',
  },
  {
    icon: MapPin,
    title: 'Masaka Retailer Integration',
    description:
      'Regional fulfilment makes it easier for nearby hotels, stockists, and tasting rooms to stay supplied.',
    cta: 'Retailer Finder',
    to: '/contact',
  },
];

const featuredProducts = [
  {
    name: 'Farm Gin',
    note: 'Juniper, citrus, long finish',
    variant: 'clear',
    image: '/images/farm.png',
    imageAlt: 'Muwas Farm Gin with key ingredients artwork',
  },
  {
    name: 'Loquat Reserve',
    note: 'Oak, orange peel, spice',
    variant: 'amber',
    image: '/images/rovart.png',
    imageAlt: 'Muwas Loquat Reserve product artwork',
  },
  {
    name: 'Muwas Select',
    note: 'Barrel warmth, cocoa, smoke',
    variant: 'reserve',
    image: '/images/orange.png',
    imageAlt: 'Muwas Select product artwork',
  },
];

const paymentOptions = [
  { icon: Smartphone, label: 'Mobile Money' },
  { icon: CreditCard, label: 'Credit Card' },
  { icon: Landmark, label: 'Bank Transfer' },
];

function ShelfBottle({ variant, name, note, image, imageAlt }) {
  return (
    <Link to="/products" className="shop-product">
      {image ? (
        <div className="shop-product__art">
          <img src={image} alt={imageAlt || name} className="shop-product__art-image" />
        </div>
      ) : (
        <div className={`shop-product__bottle shop-product__bottle--${variant}`} aria-hidden="true">
          <span className="shop-product__bottle-cap" />
          <span className="shop-product__bottle-body" />
        </div>
      )}
      <div className="shop-product__copy">
        <strong>{name}</strong>
        <span>{note}</span>
      </div>
    </Link>
  );
}

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="landing-frame">
        <section className="hero-panel hero-panel--artwork">
          <div className="hero-panel__media hero-panel__media--home">
            <img
              src={landingArtwork}
              alt="Muwas Distilling spirits displayed on a wooden platter with fruit, botanicals, and farmland in the background"
              className="hero-panel__artwork hero-panel__artwork--home"
            />
            <div className="hero-panel__vignette" aria-hidden="true" />
            <div className="hero-panel__shine" aria-hidden="true" />

            <div className="hero-panel__overlay">
              <div className="hero-panel__content-shell">
                <p className="hero-panel__eyebrow">Farm Harvest. Botanical Craft. Ugandan Spirit.</p>
                <h1 className="hero-panel__title">Muwas Distilling</h1>
                <p className="hero-panel__lede">
                  Premium gin and local whiskey shaped by fruit harvests, coffee botanicals, and
                  farm-rooted distilling.
                </p>
              </div>

              <div className="hero-panel__action-row hero-panel__action-row--overlay">
                <Link to="/products" className="muwas-pill-link">
                  Explore The Gin
                </Link>
                <Link to="/contact" className="muwas-pill-link">
                  Book A Tour
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="experience-section">
          <div className="section-heading">
            <h2>Our Story & Experiences</h2>
          </div>

          <div className="experience-grid">
            {experiences.map(({ icon: Icon, title, description, cta, to }) => (
              <article key={title} className="experience-card">
                <div className="experience-card__icon">
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link to={to} className="muwas-pill-link">
                  {cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="shop-section" id="featured-shop">
          <div className="section-heading">
            <h2>Featured Online Shop</h2>
          </div>

          <div className="shop-section__grid">
            <div className="shop-section__products">
              {featuredProducts.map((product) => (
                <ShelfBottle key={product.name} {...product} />
              ))}
            </div>

            <div className="shop-section__cart">
              <div className="shop-section__cart-row">sample cart</div>
              <div className="shop-section__cart-row">customer data</div>
              <div className="shop-section__cart-copy">
                <p>Curated tasting packs, reserve bottles, and gift-ready checkout flow.</p>
                <Link to="/cart" className="muwas-pill-link muwas-pill-link--wide">
                  Open Cart
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            <div className="shop-section__payments">
              <h3>Payment Options</h3>
              <div className="payment-list">
                {paymentOptions.map(({ icon: Icon, label }) => (
                  <div key={label} className="payment-list__item">
                    <span className="payment-list__badge">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="shop-section__meta">
            <div className="shop-section__meta-item">
              <Building2 size={18} strokeWidth={1.7} />
              <span>Retail-ready bottling for restaurants, tasting rooms, and private events.</span>
            </div>
            <div className="shop-section__meta-item">
              <Compass size={18} strokeWidth={1.7} />
              <span>Book guided farm visits and distillery walk-throughs directly from the site.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
