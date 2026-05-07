import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  CreditCard,
  MapPin,
  Smartphone,
  Truck,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/productPresentation';
import { showSuccessToast } from '../utils/toast';

const paymentProviderLabels = {
  mtn: 'MTN Mobile Money',
  airtel: 'Airtel Money',
};

const paymentProviderBadgeText = {
  mtn: 'MTN',
  airtel: 'airtel',
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { cartItems, getCartTotal, createOrder, clearCart, loading } = useCart();
  const pollingLockRef = useRef(false);
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: user?.name || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      district: '',
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
    const successState = {
      message,
      order,
      summaryItems: cartItems.map((item) => ({ ...item })),
      totals: {
        subtotal,
        deliveryFee,
        total,
      },
      shippingAddress: {
        ...formData.shippingAddress,
      },
      paymentLabel:
        formData.paymentMethod === 'mobile_money'
          ? selectedMobileMoneyProvider
          : formData.paymentMethod === 'credit_card'
            ? 'Credit / Debit Card'
            : 'Pay on Delivery',
    };

    showSuccessToast('Order placed successfully');
    clearCart();
    navigate('/order-success', { state: successState });
  };

  const updatePaymentSession = (order, payment) => {
    setPaymentSession({
      orderId: order._id,
      referenceId: payment?.referenceId || order.paymentReferenceId || '',
      phoneNumber:
        payment?.phoneNumber || order.paymentPhoneNumber || formData.mobileMoney.phoneNumber,
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
          (!current.mobileMoney.phoneNumber ||
            current.mobileMoney.phoneNumber === current.shippingAddress.phone)
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
      finalizeOrder(
        result.order,
        result.message || 'Payment confirmed and order placed successfully!'
      );
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
        <div className="checkout-stepper" aria-label="Checkout steps">
          {[
            ['1', 'Delivery', 'Enter delivery details'],
            ['2', 'Payment', 'Choose payment method'],
            ['3', 'Review', 'Confirm your order'],
          ].map(([number, title, copy], index) => (
            <div key={title} className={index === 0 ? 'is-active' : ''}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{copy}</small>
            </div>
          ))}
        </div>

        {submitError && <div className="checkout-feedback checkout-feedback--error">{submitError}</div>}

        {paymentStatusMessage && !submitError && (
          <div className="checkout-feedback checkout-feedback--info">{paymentStatusMessage}</div>
        )}

        <form id="checkout-form" onSubmit={handleSubmit} className="checkout-layout checkout-layout--shop">
          <section className="checkout-panel checkout-panel--delivery">
            <div className="checkout-panel__heading">
              <span>
                <MapPin size={17} strokeWidth={2} />
              </span>
              <div>
                <h2>Delivery Address</h2>
                <p>Where should we bring your order?</p>
              </div>
              <button type="button">Edit</button>
            </div>

            <div className="checkout-fields">
              <label className="checkout-field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="shippingAddress.fullName"
                  value={formData.shippingAddress.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </label>

              <label className="checkout-field">
                <span>Phone Number</span>
                <input
                  type="tel"
                  name="shippingAddress.phone"
                  value={formData.shippingAddress.phone}
                  onChange={handleChange}
                  required
                  placeholder="07XXXXXXXX"
                />
              </label>

              <label className="checkout-field checkout-field--full">
                <span>Street Address</span>
                <input
                  type="text"
                  name="shippingAddress.street"
                  value={formData.shippingAddress.street}
                  onChange={handleChange}
                  required
                  placeholder="Street address"
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
                <span>District</span>
                <input
                  type="text"
                  name="shippingAddress.district"
                  value={formData.shippingAddress.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </label>
            </div>

            <label className="checkout-save-address">
              <input type="checkbox" defaultChecked />
              <span>Save this address for faster checkout</span>
            </label>

            <h3>Delivery Options</h3>
            <div className="checkout-options">
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
                <div>
                  <strong>Standard Delivery</strong>
                  <span>2 - 5 business days</span>
                </div>
                <small>{formatPrice(5000)}</small>
              </label>

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
                <div>
                  <strong>Pickup Point</strong>
                  <span>Pick up from a nearby location</span>
                </div>
                <small>UGX 0</small>
              </label>
            </div>
          </section>

          <section className="checkout-panel checkout-panel--payment">
            <div className="checkout-panel__heading">
              <span>
                <WalletCards size={17} strokeWidth={2} />
              </span>
              <div>
                <h2>Payment Method</h2>
                <p>Choose how you want to pay</p>
              </div>
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
                <Smartphone size={19} strokeWidth={2} />
                <div>
                  <strong>Mobile Money</strong>
                  <span>MTN, Airtel, etc.</span>
                </div>
                <span className="checkout-option__badges">
                  <b>MTN</b>
                  <b>airtel</b>
                </span>
              </label>

              <label
                className={`checkout-option ${
                  formData.paymentMethod === 'credit_card' ? 'is-active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleChange}
                />
                <CreditCard size={19} strokeWidth={2} />
                <div>
                  <strong>Credit / Debit Card</strong>
                  <span>Visa, Mastercard</span>
                </div>
                <span className="checkout-option__badges">
                  <b>VISA</b>
                  <b>MC</b>
                </span>
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
                <Truck size={19} strokeWidth={2} />
                <div>
                  <strong>Pay on Delivery</strong>
                  <span>Pay when you receive your order</span>
                </div>
              </label>
            </div>

            {formData.paymentMethod === 'mobile_money' && (
              <div className="checkout-mobile-money">
                <div className="checkout-provider-tabs">
                  {Object.entries(paymentProviderLabels).map(([provider, label]) => (
                    <label
                      key={provider}
                      className={formData.mobileMoney.provider === provider ? 'is-active' : ''}
                    >
                      <input
                        type="radio"
                        name="mobileMoney.provider"
                        value={provider}
                        checked={formData.mobileMoney.provider === provider}
                        onChange={handleChange}
                      />
                      {label}
                    </label>
                  ))}
                </div>

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
                          ? `${paymentSession?.providerLabel || selectedMobileMoneyProvider} prompt sent`
                          : 'Phone confirmation step'}
                  </strong>
                  <p>
                    Submit your order, approve the prompt on the customer phone, then check the
                    payment status here.
                  </p>
                  {(paymentSession?.provider || formData.mobileMoney.provider) && (
                    <span
                      className={`checkout-network-badge checkout-network-badge--${
                        paymentSession?.provider || formData.mobileMoney.provider
                      }`}
                    >
                      {paymentProviderBadgeText[
                        paymentSession?.provider || formData.mobileMoney.provider
                      ] || 'Mobile Money'}
                    </span>
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
              </div>
            )}

            <button
              type="submit"
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
          </section>

          <aside className="checkout-summary">
            <div className="checkout-summary__panel">
              <h2>Order Summary</h2>

              <div className="checkout-summary__items">
                {cartItems.map((item) => (
                  <div key={item.productId} className="checkout-summary__item">
                    <img src={item.image} alt={item.name} />
                    <div className="checkout-summary__item-copy">
                      <strong>{item.name}</strong>
                      <span>Black / White, Qty: {item.quantity}</span>
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
                  <span>Shipping</span>
                  <strong className={deliveryFee === 0 ? 'is-free' : ''}>
                    {formatPrice(deliveryFee)}
                  </strong>
                </div>
                <div className="checkout-summary__grand-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>

              <div className="checkout-summary__notice">
                <Check size={19} strokeWidth={2.4} />
                <div>
                  <strong>You saved on shipping!</strong>
                  <span>Nice choice.</span>
                </div>
              </div>

              {user?.role === 'wholesale' && (
                <div className="checkout-summary__notice checkout-summary__notice--red">
                  Wholesale pricing is active for this order.
                </div>
              )}
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
