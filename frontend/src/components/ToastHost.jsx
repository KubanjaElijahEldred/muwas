import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { TOAST_EVENT_NAME } from '../utils/toast';

const ToastHost = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let dismissTimer;

    const handleToast = (event) => {
      window.clearTimeout(dismissTimer);
      setToast(event.detail);
      dismissTimer = window.setTimeout(() => setToast(null), 3600);
    };

    window.addEventListener(TOAST_EVENT_NAME, handleToast);

    return () => {
      window.clearTimeout(dismissTimer);
      window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    };
  }, []);

  if (!toast) {
    return null;
  }

  return (
    <div className={`muwas-toast muwas-toast--${toast.tone || 'success'}`} role="status">
      <span className="muwas-toast__icon" aria-hidden="true">
        <Check size={22} strokeWidth={3} />
      </span>
      <strong>{toast.message}</strong>
      <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">
        <X size={22} strokeWidth={3} />
      </button>
    </div>
  );
};

export default ToastHost;
