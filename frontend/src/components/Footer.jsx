import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
const brandLogo = '/images/logo-muwas.jpg';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/story', label: 'Our Story' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Book a Tour' },
];

const signaturePours = [
  { to: '/products?search=Farm%20Gin', label: 'Farm Gin' },
  { to: '/products?search=Loquat%20Reserve', label: 'Loquat Reserve' },
  { to: '/products?search=Muwas%20Select', label: 'Muwas Select' },
  { to: '/login', label: 'Wholesale Login' },
];

const paymentOptions = ['Mobile Money', 'Credit Card', 'Bank Transfer'];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="muwas-footer">
      <div className="muwas-footer__glow muwas-footer__glow--left" aria-hidden="true" />
      <div className="muwas-footer__glow muwas-footer__glow--right" aria-hidden="true" />

      <div className="muwas-footer__inner">
        <div className="muwas-footer__hero">
          <div className="muwas-footer__brand-panel">
            <Link to="/" className="muwas-footer__brand">
              <span className="muwas-footer__brand-mark" aria-hidden="true">
                <img src={brandLogo} alt="" className="muwas-footer__brand-image" />
              </span>

              <span className="muwas-footer__brand-copy">
                <span className="muwas-footer__eyebrow">Nakasongola, Uganda</span>
                <h2>Muwas Distilling</h2>
              </span>
            </Link>

            <p className="muwas-footer__summary">
              From our land to your glass, Muwas Distilling crafts small-batch spirits with
              Ugandan botanicals, local expertise, and a commitment to authentic quality.
            </p>

            <div className="muwas-footer__tags" aria-label="Brand highlights">
              <span>Farm to glass</span>
              <span>Guided tastings</span>
              <span>Wholesale ready</span>
            </div>
          </div>

          <div className="muwas-footer__cta">
            <p className="muwas-footer__cta-kicker">
              <Sparkles size={16} strokeWidth={1.8} />
              Plan a Muwas experience
            </p>

            <p className="muwas-footer__cta-copy">
              Browse signature bottles, book a farm visit, or reach the team for retail and
              wholesale support.
            </p>

            <div className="muwas-footer__cta-actions">
              <Link to="/contact" className="muwas-footer__button muwas-footer__button--primary">
                Book a Tour
                <ArrowRight size={16} strokeWidth={1.9} />
              </Link>

              <Link to="/products" className="muwas-footer__button">
                Shop the Collection
              </Link>
            </div>
          </div>
        </div>

        <div className="muwas-footer__grid">
          <div className="muwas-footer__column">
            <h3>Explore</h3>
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to} className="muwas-footer__link">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="muwas-footer__column">
            <h3>Signature Pours</h3>
            {signaturePours.map((link) => (
              <Link key={link.to} to={link.to} className="muwas-footer__link">
                {link.label}
              </Link>
            ))}

            <div className="muwas-footer__payments">
              <p className="muwas-footer__payments-label">Payment options</p>
              <div className="muwas-footer__payment-list">
                {paymentOptions.map((payment) => (
                  <span key={payment} className="muwas-footer__payment-pill">
                    {payment}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="muwas-footer__column">
            <h3>Visit & Support</h3>

            <div className="muwas-footer__detail">
              <MapPin size={16} strokeWidth={1.8} />
              <span>Nantale Oasis breadfruit, Kaseesa Village, Kyabutaika Parish, Kakkooge Sub-county, Nakasongola District</span>
            </div>

            <a href="tel:+256772522646" className="muwas-footer__detail muwas-footer__detail--link">
              <Phone size={16} strokeWidth={1.8} />
              <span>+256772522646</span>
            </a>

            <a
              href="mailto:muwasdistilling@gmail.com"
              className="muwas-footer__detail muwas-footer__detail--link"
            >
              <Mail size={16} strokeWidth={1.8} />
              <span>muwasdistilling@gmail.com</span>
            </a>

            <div className="muwas-footer__detail">
              <Clock3 size={16} strokeWidth={1.8} />
              <span>Open for tastings, tours, retail, and wholesale support by booking.</span>
            </div>
          </div>
        </div>

        <div className="muwas-footer__bottom">
          <span>© {currentYear} Muwas Distilling. All rights reserved.</span>
          <div className="muwas-footer__bottom-links">
            <Link to="/story">Brand Story</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Wholesale</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
