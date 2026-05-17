import React from 'react';
import { Download } from 'lucide-react';

const BusinessCard = () => {
  return (
    <section className="business-card-page">
      <div className="business-card-shell">
        <div className="business-card-preview">
          <img src="/images/bucard.png" alt="Muwas business card preview" />
        </div>

        <div className="business-card-actions">
          <a href="/images/bucard.png" download="muwas-business-card.png" className="business-card-btn">
            <Download size={16} />
            Download Card
          </a>
        </div>
      </div>
    </section>
  );
};

export default BusinessCard;
