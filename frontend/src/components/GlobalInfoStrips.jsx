import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, QrCode, ArrowRight } from 'lucide-react';

const GlobalInfoStrips = () => {
  return (
    <>
      <section className="contact-info-strip global-info-strip">
        <article>
          <MapPin size={24} />
          <div>
            <strong>OUR LOCATION</strong>
            <span>Nantale Oasis breadfruit, Kaseesa Village, Kyabutaika Parish, Kakkooge Sub-county, Nakasongola District</span>
          </div>
        </article>
        <article>
          <Phone size={24} />
          <div>
            <strong>CALL / WHATSAPP</strong>
            <span>+256772522646</span>
          </div>
        </article>
        <article>
          <Mail size={24} />
          <div>
            <strong>EMAIL US</strong>
            <span>muwasdistilling@gmail.com</span>
          </div>
        </article>
        <article>
          <QrCode size={24} />
          <div>
            <strong>SCAN TO CONNECT</strong>
            <span>Scan our code for any further information</span>
          </div>
        </article>
      </section>

      <section className="contact-cta-strip global-cta-strip">
        <div>
          <strong>LET'S CREATE MEMORABLE EXPERIENCES</strong>
          <span>From our land to your glass, we're honoured to be part of your journey.</span>
        </div>
        <Link to="/products">
          EXPLORE OUR SPIRITS
          <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
};

export default GlobalInfoStrips;
