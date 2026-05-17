import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Check, Heart, PackageCheck, Star, Truck } from 'lucide-react';
import { formatPrice } from '../utils/productPresentation';
import { useAuth } from '../contexts/AuthContext';

const OrderSuccess = () => {
  const location = useLocation();
  const state = location.state;
  const { api } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackState, setFeedbackState] = useState({ type: '', message: '' });
  const [showFeedbackModal, setShowFeedbackModal] = useState(true);

  if (!state?.order) {
    return <Navigate to="/orders" replace />;
  }

  const {
    order,
    summaryItems = [],
    totals = {},
    shippingAddress = {},
    paymentLabel = 'Mobile Money',
  } = state;
  const orderId = order?._id || '';
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    if (rating < 1) {
      setFeedbackState({ type: 'error', message: 'Please select a rating before submitting.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/feedback', {
        orderId,
        rating,
        comment,
        source: 'order-success',
      });
      setFeedbackState({ type: 'success', message: 'Thanks. Your feedback has been sent to the Muwas admin team.' });
      window.setTimeout(() => setShowFeedbackModal(false), 1000);
    } catch (error) {
      setFeedbackState({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-success-page">
      {showFeedbackModal && (
        <div className="order-feedback-modal" role="dialog" aria-modal="true" aria-label="Rate your experience">
          <div className="order-feedback-modal__panel">
            <div className="order-feedback-panel">
              <span>
                <Heart size={25} fill="currentColor" strokeWidth={2} />
              </span>
              <h2>Rate Your Experience</h2>
              <p>Please rate the system after payment.</p>
              <form className="order-feedback-form" onSubmit={handleFeedbackSubmit}>
                <div className="order-feedback-stars" role="radiogroup" aria-label="Rate your experience">
                  {stars.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={value <= rating ? 'is-active' : ''}
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                      onClick={() => setRating(value)}
                    >
                      <Star size={18} fill={value <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Tell us what went well and what we should improve."
                  maxLength={1200}
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                {feedbackState.message && (
                  <small className={feedbackState.type === 'error' ? 'is-error' : 'is-success'}>
                    {feedbackState.message}
                  </small>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="order-success-page__inner">
        <section className="order-success-panel">
          <div className="order-success-confetti" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <span className="order-success-check" aria-hidden="true">
            <Check size={42} strokeWidth={2.8} />
          </span>

          <h1>Order Placed Successfully!</h1>
          <p>Thank you for shopping with us. We&apos;ve received your order.</p>

          <div className="order-success-meta">
            <div>
              <span>Order Number</span>
              <strong>{order.orderNumber || order._id}</strong>
            </div>
            <div>
              <span>Order Date</span>
              <strong>Just now</strong>
            </div>
          </div>

          <h2>What happens next?</h2>

          <div className="order-success-steps">
            <div>
              <span>
                <Check size={17} strokeWidth={2.2} />
              </span>
              <strong>Order Confirmed</strong>
              <p>We&apos;ve received your order and are processing it.</p>
            </div>
            <div>
              <span>
                <PackageCheck size={17} strokeWidth={2.2} />
              </span>
              <strong>Order Shipped</strong>
              <p>We&apos;ll notify you once your order is on the way.</p>
            </div>
            <div>
              <span>
                <Truck size={17} strokeWidth={2.2} />
              </span>
              <strong>Order Delivered</strong>
              <p>Get your order delivered to your doorstep.</p>
            </div>
          </div>

          <div className="order-success-actions">
            <Link to="/orders">Track Your Order</Link>
            <Link to="/products">Continue Shopping</Link>
          </div>
        </section>

        <aside className="order-success-sidebar">
          <section className="checkout-summary__panel">
            <h2>Order Summary</h2>

            <div className="checkout-summary__items">
              {summaryItems.map((item) => (
                <div key={item.productId || item.name} className="checkout-summary__item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-summary__item-copy">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <small>{formatPrice(item.price * item.quantity)}</small>
                </div>
              ))}
            </div>

            <div className="checkout-summary__totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(totals.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping</span>
                <strong className={totals.deliveryFee === 0 ? 'is-free' : ''}>
                  {formatPrice(totals.deliveryFee)}
                </strong>
              </div>
              <div className="checkout-summary__grand-total">
                <span>Total</span>
                <strong>{formatPrice(totals.total)}</strong>
              </div>
            </div>
          </section>

          <section className="order-success-address">
            <h2>Delivery Address</h2>
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.phone}</p>
            <p>{shippingAddress.street}</p>
            <p>{[shippingAddress.city, shippingAddress.district].filter(Boolean).join(', ')}</p>
            <strong>Paid with {paymentLabel}</strong>
            <div>
              <span>Total</span>
              <strong>{formatPrice(totals.total)}</strong>
            </div>
          </section>
        </aside>

      </div>
    </div>
  );
};

export default OrderSuccess;
