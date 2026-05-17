import React from 'react';
import { Download, Phone } from 'lucide-react';

const BusinessCard = () => {
  return (
    <section className="business-card-page">
      <div className="business-card-shell">
        <header className="business-card-header">
          <h1>Muwas Business Card</h1>
          <p>Preview first, then download the card file you want.</p>
          <p>Phone: +256772522646 | WhatsApp: +256772522646 | Gmail: muwasdistilling@gmail.com | Site: muwas.vercel.app</p>
        </header>

        <div className="business-card-preview">
          <img src="/muwas-business-card.svg" alt="Muwas business card preview" />
        </div>

        <div className="business-card-actions">
          <a href="/muwas-business-card.svg" download className="business-card-btn">
            <Download size={16} />
            Download Card (SVG)
          </a>
          <a href="https://wa.me/256772522646" target="_blank" rel="noreferrer" className="business-card-btn">
            <Phone size={16} />
            Open WhatsApp
          </a>
          <a href="/muwas-business-card.vcf" download className="business-card-btn business-card-btn--secondary">
            <Phone size={16} />
            Download Contact (VCF)
          </a>
        </div>
      </div>
    </section>
  );
};

export default BusinessCard;
