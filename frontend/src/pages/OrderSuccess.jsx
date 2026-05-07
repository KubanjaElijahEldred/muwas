import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Check, Heart, PackageCheck, Truck } from 'lucide-react';
import { formatPrice } from '../utils/productPresentation';

const OrderSuccess = () => {
  const location = useLocation();
  const state = location.state;

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

  return (
    <div className="order-success-page">
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

        <section className="order-feedback-panel">
          <span>
            <Heart size={25} fill="currentColor" strokeWidth={2} />
          </span>
          <h2>We&apos;d love your feedback!</h2>
          <p>How was your shopping experience?</p>
        </section>
      </div>
    </div>
  );
};

export default OrderSuccess;
