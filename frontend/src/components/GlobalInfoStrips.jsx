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
            <span>Muwas Farm, Masaka Road corridor, Uganda</span>
          </div>
        </article>
        <article>
          <Phone size={24} />
          <div>
            <strong>CALL / WHATSAPP</strong>
            <span>+256 123 456 789 • Mon-Sat, 9:00 AM to 6:00 PM EAT</span>
          </div>
        </article>
        <article>
          <Mail size={24} />
          <div>
            <strong>EMAIL US</strong>
            <span>info@muwasdistilling.ug • tours@muwasdistilling.ug</span>
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
