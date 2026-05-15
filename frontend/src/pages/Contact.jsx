import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AtSign,
  Calendar,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Send,
} from 'lucide-react';
import { fetchWithApiFallback } from '../utils/api';

const contactCards = [
  {
    icon: MapPin,
    title: 'Visit Us',
    lines: [
      'Nantale Oasis breadfruit, Kaseesa Village, Kyabutaika Parish, Kakkooge Sub-county, Nakasongola District',
    ],
  },
  {
    icon: Phone,
    title: 'Call Support',
    lines: ['+256772522646', 'Call or WhatsApp any time'],
  },
  {
    icon: Mail,
    title: 'Email Team',
    lines: ['muwasdistilling@gmail.com', 'For tours, orders, and partnerships'],
  },
];

const productCards = [
  {
    type: 'VODKA',
    title: 'Coffee Flavoured Vodka',
    copy: 'Smooth. Rich. Distinctly Ugandan.',
    image: '/images/vodka.png',
  },
  {
    type: 'GIN',
    title: 'Kakoge Gin',
    copy: "A vibrant botanical gin inspired by Uganda's landscape.",
    image: '/images/kakoge.png',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const submitRequest = async (requestType = 'contact') => {
    setLoading(true);
    setSubmitMessage('');

    try {
      const response = await fetchWithApiFallback('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, requestType }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setSubmitMessage(
        requestType === 'tour'
          ? 'Tour request received. The Muwas team will confirm your booking shortly.'
          : 'Message sent successfully. The Muwas team will get back to you soon.'
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitMessage('We could not send that request right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitRequest('contact');
  };

  return (
    <div className="contact-luxe-page">
      <section className="contact-luxe-hero">
        <div className="contact-luxe-hero__backdrop" aria-hidden="true" />
        <motion.div className="contact-luxe-hero__inner" {...fadeUp}>
          <article className="contact-luxe-hero__copy">
            <p>WE&apos;RE HERE TO HELP</p>
            <h1>
              Let&apos;s craft something <span>exceptional.</span>
            </h1>
            <small>
              Whether you&apos;re planning a tasting, booking a tour, discussing wholesale
              partnerships, or making a product enquiry, our team is ready to connect.
            </small>
          </article>

          <div className="contact-luxe-hero__cards">
            {contactCards.map(({ icon: Icon, title, lines }) => (
              <motion.article
                key={title}
                className="contact-luxe-floating-card"
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <span>
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <h3>{title}</h3>
                {lines.map((line) => (
                  <small key={line}>{line}</small>
                ))}
              </motion.article>
            ))}
          </div>

        </motion.div>
      </section>

      <section className="contact-luxe-body">
        <motion.aside className="contact-luxe-panel" {...fadeUp}>
          <p>MUWAS DISPATCH</p>
          <h2>Choose the right desk</h2>
          <ul>
            <li>Retail enquiries and order support</li>
            <li>Tours, tastings, and private bookings</li>
            <li>Wholesale onboarding and stock setup</li>
          </ul>
        </motion.aside>

        <motion.form className="contact-luxe-form" onSubmit={handleSubmit} {...fadeUp}>
          {submitMessage && (
            <div className="contact-luxe-form__message" role="status">
              {submitMessage}
            </div>
          )}
          <label>
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </label>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+256 123 456 789"
            />
          </label>
          <label>
            <span>Subject</span>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="How can we help?"
            />
          </label>
          <label className="is-full">
            <span>Message</span>
            <textarea
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Tell us more about your enquiry..."
            />
          </label>
          <div className="contact-luxe-form__actions">
            <motion.button
              type="submit"
              className="contact-luxe-btn contact-luxe-btn--primary"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </motion.button>
            <motion.button
              type="button"
              className="contact-luxe-btn contact-luxe-btn--dark"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => submitRequest('tour')}
              disabled={loading}
            >
              <Calendar size={16} />
              Book a Tour
            </motion.button>
          </div>
        </motion.form>

        <motion.aside className="contact-luxe-products" {...fadeUp}>
          {productCards.map((item) => (
            <article key={item.title} className="contact-luxe-product-card">
              <img src={item.image} alt={item.title} />
              <div>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <small>Coffee beans • Orange peel • Lemongrass • Coriander • Juniper</small>
              </div>
            </article>
          ))}
        </motion.aside>
      </section>

      <section className="contact-luxe-strip">
        <article>
          <MapPin size={20} />
          <div>
            <strong>LOCATION</strong>
            <span>Nantale Oasis breadfruit, Kaseesa Village, Kyabutaika Parish, Kakkooge</span>
          </div>
        </article>
        <article>
          <Phone size={20} />
          <div>
            <strong>WHATSAPP</strong>
            <span>+256772522646</span>
          </div>
        </article>
        <article>
          <Mail size={20} />
          <div>
            <strong>EMAIL</strong>
            <span>muwasdistilling@gmail.com</span>
          </div>
        </article>
        <article>
          <QrCode size={20} />
          <div>
            <strong>QR CONNECT</strong>
            <span>Scan to connect with Muwas Distilling</span>
          </div>
        </article>
      </section>

      <section className="contact-luxe-final">
        <div>
          <strong>From our land to your glass.</strong>
          <span>We&apos;re honoured to be part of your journey.</span>
        </div>
        <div className="contact-luxe-final__actions">
          <Link to="/products">Explore Our Spirits</Link>
          <div>
            <a href="#" aria-label="Instagram">
              <Globe size={16} />
            </a>
            <a href="#" aria-label="Facebook">
              <MessageCircle size={16} />
            </a>
            <a href="#" aria-label="Youtube">
              <AtSign size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
