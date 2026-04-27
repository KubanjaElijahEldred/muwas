import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Headset,
  MapPin,
  ShieldCheck,
  Smartphone,
  Timer,
  Truck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/productPresentation';

const paymentProviderLabels = {
  mtn: 'MTN Mobile Money',
  airtel: 'Airtel Money',
};

const paymentProviderBadgeText = {
  mtn: 'MTN',
  airtel: 'Airtel',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { cartItems, getCartTotal, createOrder, clearCart, loading } = useCart();
  const pollingLockRef = useRef(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      country: 'Uganda',
      postalCode: '',
      phone: user?.phone || '',
    },
    deliveryMethod: 'boda_delivery',
    paymentMethod: 'mobile_money',
    mobileMoney: {
      provider: 'mtn',
      phoneNumber: user?.phone || '',
    },
    notes: '',
  });
  const [submitError, setSubmitError] = useState('');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [paymentSession, setPaymentSession] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems.length, navigate]);

  const subtotal = getCartTotal();
  const deliveryFee = formData.deliveryMethod === 'boda_delivery' ? 5000 : 0;
  const total = subtotal + deliveryFee;
  const isAwaitingPayment = paymentSession?.status === 'pending';
  const selectedMobileMoneyProvider =
    paymentProviderLabels[formData.mobileMoney.provider] || 'MTN Mobile Money';

  const finalizeOrder = (order, message) => {
    clearCart();
    navigate('/orders', {
      state: {
        message,
        order,
      },
    });
  };

  const updatePaymentSession = (order, payment) => {
    setPaymentSession({
      orderId: order._id,
      referenceId: payment?.referenceId || order.paymentReferenceId || '',
      phoneNumber:
        payment?.phoneNumber ||
        order.paymentPhoneNumber ||
        formData.mobileMoney.phoneNumber,
      status: order.paymentStatus,
      providerStatus: payment?.providerStatus || order.paymentProviderStatus || '',
      provider: payment?.provider || formData.mobileMoney.provider,
      providerLabel: payment?.providerLabel || selectedMobileMoneyProvider,
    });
  };

  const pollPaymentStatus = async (orderId, { silent = false } = {}) => {
    if (!orderId || pollingLockRef.current) {
      return;
    }

    pollingLockRef.current = true;

    if (!silent) {
      setCheckingPayment(true);
    }

    try {
      const response = await api.get(`/orders/${orderId}/payment-status`);
      const { order, payment } = response.data;

      updatePaymentSession(order, payment);
      setPaymentStatusMessage(payment?.message || '');

      if (order.paymentStatus === 'paid') {
        finalizeOrder(order, 'Payment confirmed and order placed successfully!');
        return;
      }

      if (order.paymentStatus === 'failed') {
        setSubmitError(
          payment?.message ||
            order.paymentFailureReason ||
            'The mobile money payment was not approved.'
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Unable to confirm mobile money payment status right now.';

      if (!silent) {
        setSubmitError(message);
      }
    } finally {
      pollingLockRef.current = false;

      if (!silent) {
        setCheckingPayment(false);
      }
    }
  };

  useEffect(() => {
    if (!paymentSession?.orderId || paymentSession.status !== 'pending') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      pollPaymentStatus(paymentSession.orderId, { silent: true });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [paymentSession?.orderId, paymentSession?.status]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'paymentMethod' && value !== 'mobile_money') {
      setPaymentSession(null);
      setPaymentStatusMessage('');
      setSubmitError('');
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');

      if (name === 'mobileMoney.provider') {
        setPaymentSession(null);
        setPaymentStatusMessage('');
        setSubmitError('');
      }

      setFormData((current) => {
        const nextValue = {
          ...current,
          [parent]: {
            ...current[parent],
            [child]: value,
          },
        };

        if (
          name === 'shippingAddress.phone' &&
          (!current.mobileMoney.phoneNumber || current.mobileMoney.phoneNumber === current.shippingAddress.phone)
        ) {
          nextValue.mobileMoney = {
            ...current.mobileMoney,
            phoneNumber: value,
          };
        }

        return nextValue;
      });
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setPaymentStatusMessage('');

    const result = await createOrder(formData);

    if (!result.success) {
      setSubmitError(result.message);
      return;
    }

    if (formData.paymentMethod !== 'mobile_money') {
      finalizeOrder(result.order, result.message || 'Order placed successfully!');
      return;
    }

    updatePaymentSession(result.order, result.payment);
    setPaymentStatusMessage(
      result.payment?.message ||
        result.message ||
        'Check your phone for the mobile money prompt.'
    );

    if (result.order.paymentStatus === 'paid') {
      finalizeOrder(result.order, result.message || 'Payment confirmed and order placed successfully!');
      return;
    }

    if (result.order.paymentStatus === 'failed') {
      setSubmitError(
        result.payment?.message ||
          result.order.paymentFailureReason ||
          'The mobile money payment was not approved.'
      );
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__inner">
        <button type="button" onClick={() => navigate('/cart')} className="checkout-back-link">
          <ArrowLeft size={16} strokeWidth={1.9} />
          Back to Cart
        </button>

        <section className="checkout-hero">
          <div>
            <p className="checkout-hero__eyebrow">Checkout</p>
            <h1>Secure your Muwas order with delivery and payment details in one place.</h1>
            <span>
              Enter the mobile money number, then approve the payment prompt on the customer phone
              and enter the PIN there.
            </span>
          </div>

          <div className="checkout-hero__stats">
            <div>
              <strong>{cartItems.length}</strong>
              <span>line items</span>
            </div>
            <div>
              <strong>{formatPrice(subtotal)}</strong>
              <span>subtotal</span>
            </div>
            <div>
              <strong>{formatPrice(total)}</strong>
              <span>estimated total</span>
            </div>
          </div>
        </section>

        <section className="checkout-trust-grid" aria-label="Checkout reassurance cards">
          <article className="checkout-trust-card">
            <span>
              <ShieldCheck size={17} strokeWidth={1.8} />
            </span>
            <strong>Secure payment flow</strong>
            <p>MTN and Airtel requests are sent directly to the customer handset for PIN entry.</p>
          </article>

          <article className="checkout-trust-card">
            <span>
              <Timer size={17} strokeWidth={1.8} />
            </span>
            <strong>Fast fulfillment</strong>
            <p>Confirmed orders are prepared quickly with pickup and boda delivery options.</p>
          </article>

          <article className="checkout-trust-card">
            <span>
              <Headset size={17} strokeWidth={1.8} />
            </span>
            <strong>Support on standby</strong>
            <p>Need help at checkout? The team can assist with payment and delivery guidance.</p>
          </article>
        </section>

        {submitError && (
          <div className="checkout-feedback checkout-feedback--error">{submitError}</div>
        )}

        {paymentStatusMessage && !submitError && (
          <div className="checkout-feedback checkout-feedback--info">{paymentStatusMessage}</div>
        )}

        <div className="checkout-layout">
          <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
            <section className="checkout-panel">
              <div className="checkout-panel__heading">
                <p>Shipping information</p>
                <h2>Where should we deliver?</h2>
              </div>

              <div className="checkout-fields">
                <label className="checkout-field checkout-field--full">
                  <span>Street address</span>
                  <input
                    type="text"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    required
                    placeholder="123 Main Street"
                  />
                </label>

                <label className="checkout-field">
                  <span>City</span>
                  <input
                    type="text"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    required
                    placeholder="Kampala"
                  />
                </label>

                <label className="checkout-field">
                  <span>Postal code</span>
                  <input
                    type="text"
                    name="shippingAddress.postalCode"
                    value={formData.shippingAddress.postalCode}
                    onChange={handleChange}
                    placeholder="256"
                  />
                </label>

                <label className="checkout-field checkout-field--full">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    name="shippingAddress.phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleChange}
                    required
                    placeholder="+256 123 456 789"
                  />
                </label>
              </div>
            </section>

            <section className="checkout-panel">
              <div className="checkout-panel__heading">
                <p>Delivery method</p>
                <h2>Choose how you receive your order</h2>
              </div>

              <div className="checkout-options">
                <label
                  className={`checkout-option ${
                    formData.deliveryMethod === 'pickup' ? 'is-active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === 'pickup'}
                    onChange={handleChange}
                  />
                  <MapPin size={18} strokeWidth={1.8} />
                  <div>
                    <strong>Store Pickup</strong>
                    <span>Pick up from Muwas Farm</span>
                  </div>
                  <small>Free</small>
                </label>

                <label
                  className={`checkout-option ${
                    formData.deliveryMethod === 'boda_delivery' ? 'is-active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="boda_delivery"
                    checked={formData.deliveryMethod === 'boda_delivery'}
                    onChange={handleChange}
                  />
                  <Truck size={18} strokeWidth={1.8} />
                  <div>
                    <strong>Boda Delivery</strong>
                    <span>Delivered to your location</span>
                  </div>
                  <small>{formatPrice(5000)}</small>
                </label>
              </div>
            </section>

            <section className="checkout-panel">
              <div className="checkout-panel__heading">
                <p>Payment method</p>
                <h2>Settle your order</h2>
              </div>

              <div className="checkout-options">
                <label
                  className={`checkout-option ${
                    formData.paymentMethod === 'mobile_money' ? 'is-active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mobile_money"
                    checked={formData.paymentMethod === 'mobile_money'}
                    onChange={handleChange}
                  />
                  <Smartphone size={18} strokeWidth={1.8} />
                  <div>
                    <div className="checkout-option__title-row">
                      <strong>Mobile Money</strong>
                      <span className="checkout-option__badges" aria-label="Supported networks">
                        <span className="checkout-network-badge checkout-network-badge--mtn">
                          MTN
                        </span>
                        <span className="checkout-network-badge checkout-network-badge--airtel">
                          Airtel
                        </span>
                      </span>
                    </div>
                    <span>Choose MTN or Airtel, then confirm on the phone</span>
                  </div>
                </label>

                <label
                  className={`checkout-option ${
                    formData.paymentMethod === 'cash_on_delivery' ? 'is-active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={formData.paymentMethod === 'cash_on_delivery'}
                    onChange={handleChange}
                  />
                  <CreditCard size={18} strokeWidth={1.8} />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <span>Pay when you receive your order</span>
                  </div>
                </label>
              </div>
            </section>

            {formData.paymentMethod === 'mobile_money' && (
              <section className="checkout-panel">
                <div className="checkout-panel__heading">
                  <p>Mobile money prompt</p>
                  <h2>Choose the network and number that should receive the prompt</h2>
                </div>

                <div className="checkout-options">
                  <label
                    className={`checkout-option ${
                      formData.mobileMoney.provider === 'mtn' ? 'is-active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="mobileMoney.provider"
                      value="mtn"
                      checked={formData.mobileMoney.provider === 'mtn'}
                      onChange={handleChange}
                    />
                    <Smartphone size={18} strokeWidth={1.8} />
                    <div>
                      <div className="checkout-option__title-row">
                        <strong>MTN Mobile Money</strong>
                        <span className="checkout-network-badge checkout-network-badge--mtn">
                          MTN
                        </span>
                      </div>
                      <span>Best for MTN wallet numbers</span>
                    </div>
                  </label>

                  <label
                    className={`checkout-option ${
                      formData.mobileMoney.provider === 'airtel' ? 'is-active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="mobileMoney.provider"
                      value="airtel"
                      checked={formData.mobileMoney.provider === 'airtel'}
                      onChange={handleChange}
                    />
                    <Smartphone size={18} strokeWidth={1.8} />
                    <div>
                      <div className="checkout-option__title-row">
                        <strong>Airtel Money</strong>
                        <span className="checkout-network-badge checkout-network-badge--airtel">
                          Airtel
                        </span>
                      </div>
                      <span>Best for Airtel wallet numbers</span>
                    </div>
                  </label>
                </div>

                <div className="checkout-fields">
                  <label className="checkout-field checkout-field--full">
                    <span>{selectedMobileMoneyProvider} number</span>
                    <input
                      type="tel"
                      name="mobileMoney.phoneNumber"
                      value={formData.mobileMoney.phoneNumber}
                      onChange={handleChange}
                      required={formData.paymentMethod === 'mobile_money'}
                      placeholder="07XXXXXXXX or 2567XXXXXXXX"
                    />
                  </label>
                </div>

                <div
                  className={`checkout-payment-state ${
                    paymentSession?.status ? `is-${paymentSession.status}` : ''
                  }`}
                >
                  <strong>
                    {paymentSession?.status === 'paid'
                      ? `${paymentSession?.providerLabel || selectedMobileMoneyProvider} confirmed`
                      : paymentSession?.status === 'failed'
                        ? `${paymentSession?.providerLabel || selectedMobileMoneyProvider} was not completed`
                        : paymentSession?.status === 'pending'
                          ? `${paymentSession?.providerLabel || selectedMobileMoneyProvider} prompt sent to the phone`
                          : 'Phone confirmation step'}
                  </strong>
                  <p>
                    After you submit, {paymentSession?.providerLabel || selectedMobileMoneyProvider}
                    {' '}sends a confirmation request to this number. The customer should approve it
                    and enter the mobile money PIN on the phone, not on this website.
                  </p>
                  {(paymentSession?.provider || formData.mobileMoney.provider) && (
                    <div className="checkout-payment-state__badge-row">
                      <span
                        className={`checkout-network-badge checkout-network-badge--${
                          paymentSession?.provider || formData.mobileMoney.provider
                        }`}
                      >
                        {paymentProviderBadgeText[paymentSession?.provider || formData.mobileMoney.provider] || 'Mobile Money'}
                      </span>
                    </div>
                  )}
                  {paymentSession?.referenceId && (
                    <small>Reference: {paymentSession.referenceId}</small>
                  )}
                  {paymentSession?.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => pollPaymentStatus(paymentSession.orderId)}
                      disabled={checkingPayment}
                      className="checkout-status-button"
                    >
                      {checkingPayment ? 'Checking payment...' : 'Check payment status'}
                    </button>
                  )}
                </div>
              </section>
            )}

            <section className="checkout-panel">
              <div className="checkout-panel__heading">
                <p>Order notes</p>
                <h2>Anything we should know?</h2>
              </div>

              <label className="checkout-field checkout-field--full">
                <span>Special instructions</span>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Special instructions for your order..."
                />
              </label>
            </section>
          </form>

          <aside className="checkout-summary">
            <div className="checkout-summary__panel">
              <p>Order summary</p>
              <h2>Your basket</h2>

              <div className="checkout-summary__items">
                {cartItems.map((item) => (
                  <div key={item.productId} className="checkout-summary__item">
                    <div className="checkout-summary__item-copy">
                      <strong>{item.name}</strong>
                      <span>Qty {item.quantity}</span>
                    </div>
                    <small>{formatPrice(item.price * item.quantity)}</small>
                  </div>
                ))}
              </div>

              <div className="checkout-summary__totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div>
                  <span>Delivery Fee</span>
                  <strong>{formatPrice(deliveryFee)}</strong>
                </div>
                <div className="checkout-summary__grand-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading || isAwaitingPayment}
                className="checkout-submit"
              >
                {loading
                  ? 'Sending payment request...'
                  : isAwaitingPayment
                    ? `Waiting for ${paymentSession?.providerLabel || selectedMobileMoneyProvider} confirmation...`
                    : formData.paymentMethod === 'mobile_money'
                      ? `Request ${selectedMobileMoneyProvider} Payment`
                      : 'Place Order'}
              </button>

              {user?.role === 'wholesale' && (
                <div className="checkout-summary__notice">
                  Wholesale pricing is active for this order.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
