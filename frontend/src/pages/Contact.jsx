import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { fetchWithApiFallback } from '../utils/api';

const contactCards = [
  {
    icon: MapPin,
    title: 'Visit us',
    lines: ['Muwas Farm, Masaka Road corridor, Uganda', 'Guided tastings by booking'],
  },
  {
    icon: Phone,
    title: 'Call support',
    lines: ['+256 123 456 789', 'Mon-Sat, 9:00 AM to 6:00 PM'],
  },
  {
    icon: Mail,
    title: 'Email team',
    lines: ['info@muwasdistilling.ug', 'tours@muwasdistilling.ug'],
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tourType: 'distillery',
    tourDate: '',
    tourTime: '',
    numberOfGuests: 1,
  });
  const [activeTab, setActiveTab] = useState('contact');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetchWithApiFallback('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestType: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setMessage(
        activeTab === 'tour'
          ? 'Tour request received. The Muwas team will confirm your booking shortly.'
          : 'Message sent successfully. The Muwas team will get back to you soon.'
      );
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        tourType: 'distillery',
        tourDate: '',
        tourTime: '',
        numberOfGuests: 1,
      });
    } catch (error) {
      setMessage('We could not send that request right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-page__inner">
        <section className="contact-hero">
          <div className="contact-hero__copy">
            <p className="contact-hero__eyebrow">Contact, Tours, Wholesale Support</p>
            <h1>Plan a visit, ask about a bottle, or reach the Muwas team directly.</h1>
            <span>
              This page now matches the landing and shop experience with a warmer editorial layout
              built for everyday enquiries and guided tasting bookings.
            </span>

            <div className="contact-hero__meta">
              {contactCards.map(({ icon: Icon, title, lines }) => (
                <article key={title} className="contact-hero__card">
                  <span>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    {lines.map((line) => (
                      <small key={line}>{line}</small>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="contact-hero__visual">
            <img
              src="/images/vintage_distillation.png"
              alt="Vintage-style distillation artwork for Muwas Distilling"
              className="contact-hero__image"
            />
            <div className="contact-hero__note">
              <Sparkles size={16} strokeWidth={1.8} />
              <span>Guided tastings, farm tours, and hospitality support on request.</span>
            </div>
          </div>
        </section>

        <section className="contact-layout">
          <aside className="contact-sidebar">
            <div className="contact-sidebar__panel">
              <p>Visit & support</p>
              <h2>What happens next</h2>
              <ul>
                <li>Retail enquiries are routed to product and order support.</li>
                <li>Tour requests are reviewed against current booking availability.</li>
                <li>Wholesale teams can ask about stock, fulfilment, and partnership setup.</li>
              </ul>
            </div>

            <div className="contact-sidebar__panel">
              <p>Tour information</p>
              <h2>Before you book</h2>
              <ul>
                <li>Tours last about 2 hours and can include guided tastings.</li>
                <li>Group size is capped at 10 guests per booking request.</li>
                <li>Visitors must be 18+ for tasting sessions.</li>
              </ul>
            </div>
          </aside>

          <div className="contact-panel">
            <div className="contact-panel__tabs">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={activeTab === 'contact' ? 'is-active' : ''}
              >
                Send message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={activeTab === 'tour' ? 'is-active' : ''}
              >
                Book a tour
              </button>
            </div>

            <div className="contact-panel__body">
              {message && (
                <div
                  className={`contact-panel__message ${
                    message.toLowerCase().includes('could not') ? 'is-error' : 'is-success'
                  }`}
                >
                  {message}
                </div>
              )}

              {activeTab === 'contact' ? (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-form__grid">
                    <label className="contact-field">
                      <span>Your name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Email address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+256 123 456 789"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Subject</span>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Product enquiry"
                      />
                    </label>
                  </div>

                  <label className="contact-field contact-field--full">
                    <span>Message</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help..."
                    />
                  </label>

                  <button type="submit" disabled={loading} className="contact-submit">
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={17} strokeWidth={1.8} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-form__grid">
                    <label className="contact-field">
                      <span>Your name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Email address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Tour type</span>
                      <select
                        name="tourType"
                        value={formData.tourType}
                        onChange={handleChange}
                        required
                      >
                        <option value="distillery">Distillery tour</option>
                        <option value="tasting">Tasting session</option>
                        <option value="farm">Farm visit</option>
                        <option value="cocktail">Cocktail masterclass</option>
                      </select>
                    </label>

                    <label className="contact-field">
                      <span>Guests</span>
                      <input
                        type="number"
                        name="numberOfGuests"
                        value={formData.numberOfGuests}
                        onChange={handleChange}
                        required
                        min="1"
                        max="10"
                      />
                    </label>

                    <label className="contact-field">
                      <span>Preferred date</span>
                      <div className="contact-field__with-icon">
                        <Calendar size={16} strokeWidth={1.8} />
                        <input
                          type="date"
                          name="tourDate"
                          value={formData.tourDate}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </label>

                    <label className="contact-field">
                      <span>Preferred time</span>
                      <div className="contact-field__with-icon">
                        <Clock size={16} strokeWidth={1.8} />
                        <select
                          name="tourTime"
                          value={formData.tourTime}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select time</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                        </select>
                      </div>
                    </label>
                  </div>

                  <label className="contact-field contact-field--full">
                    <span>Special requests</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Any accessibility, group, or hospitality notes for the team..."
                    />
                  </label>

                  <button type="submit" disabled={loading} className="contact-submit">
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Calendar size={17} strokeWidth={1.8} />
                        Book Tour
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
