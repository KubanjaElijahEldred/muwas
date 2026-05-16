import React from 'react';

function SplashScreen() {
  return (
    <div className="muwas-splash" role="status" aria-live="polite" aria-label="Loading Muwas app">
      <div className="muwas-splash__ambient" aria-hidden="true" />
      <div className="muwas-splash__content">
        <div className="muwas-splash__logo-wrap">
          <img
            className="muwas-splash__logo"
            src="/images/logo-muwas.jpg"
            alt="Muwas Distilleries logo"
          />
        </div>
        <p className="muwas-splash__title">Muwas Distilleries</p>
        <p className="muwas-splash__subtitle">Crafted for Uganda</p>
        <div className="muwas-splash__bar" aria-hidden="true">
          <span className="muwas-splash__bar-fill" />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
