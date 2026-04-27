import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const cartDescriptions = {
  'Farm Gin': 'Bright citrus and juniper with a clean finish for tasting flights and cocktails.',
  'Loquat Reserve': 'Oak depth, orange peel lift, and a warmer reserve finish for evening pours.',
  'Muwas Select': 'Barrel warmth, cocoa notes, and a darker smoky finish from the cellar shelf.',
};

function formatPrice(price = 0) {
  return `UGX ${Number(price || 0).toLocaleString()}`;
}

function getCartDescription(name = '') {
  return (
    cartDescriptions[name] ||
    'Small-batch Muwas spirit selected from the current market hall collection.'
  );
}

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, clearCart } =
    useCart();

  const subtotal = getCartTotal();
  const deliveryFee = cartItems.length > 0 ? 5000 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = getCartCount();

  if (itemCount === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__inner">
          <section className="cart-hero cart-hero--empty">
            <div className="cart-hero__copy">
              <p className="cart-hero__eyebrow">Your Muwas basket</p>
              <h1>The cart is waiting for its first bottle.</h1>
              <p>
                Start with Farm Gin, Loquat Reserve, or one of the featured pours from the
                products page and build your order from there.
              </p>
              <div className="cart-hero__actions">
                <Link to="/products" className="cart-pill cart-pill--primary">
                  Browse products
                  <ArrowRight size={16} strokeWidth={1.9} />
                </Link>
                <Link to="/story" className="cart-pill">
                  Read the story
                </Link>
              </div>
            </div>

            <div className="cart-hero__visual">
              <div className="cart-empty-card">
                <ShoppingBag size={34} strokeWidth={1.8} />
                <strong>No items yet</strong>
                <span>Fill this basket with your next Muwas pour.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__inner">
        <section className="cart-hero">
          <div className="cart-hero__copy">
            <Link to="/products" className="cart-back-link">
              <ArrowLeft size={16} strokeWidth={1.9} />
              Back to products
            </Link>

            <p className="cart-hero__eyebrow">Muwas cart</p>
            <h1>Your bottles are ready for checkout.</h1>
            <p>
              Review your basket, adjust quantities, and continue to secure checkout with the same
              premium storefront style as the products page.
            </p>

            <div className="cart-hero__stats">
              <div className="cart-hero__stat">
                <strong>{itemCount}</strong>
                <span>items selected</span>
              </div>
              <div className="cart-hero__stat">
                <strong>{formatPrice(subtotal)}</strong>
                <span>current subtotal</span>
              </div>
              <div className="cart-hero__stat">
                <strong>UGX 5,000</strong>
                <span>delivery estimate</span>
              </div>
            </div>
          </div>

          <div className="cart-hero__visual">
            <div className="cart-highlight">
              <div className="cart-highlight__pill">
                <Sparkles size={15} strokeWidth={1.9} />
                Ready for dispatch
              </div>
              <div className="cart-highlight__grid">
                <div>
                  <ShieldCheck size={18} strokeWidth={1.8} />
                  <strong>Protected checkout</strong>
                  <span>Card, bank transfer, or Mobile Money supported.</span>
                </div>
                <div>
                  <Truck size={18} strokeWidth={1.8} />
                  <strong>Fast local delivery</strong>
                  <span>Kampala and Masaka area delivery available.</span>
                </div>
                <div>
                  <CreditCard size={18} strokeWidth={1.8} />
                  <strong>Wholesale ready</strong>
                  <span>Approved buyers keep their wholesale pricing in cart.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cart-layout">
          <div className="cart-shelf">
            <div className="cart-section-heading">
              <div>
                <p className="cart-section-heading__eyebrow">Cart Shelf</p>
                <h2>Selected bottles</h2>
              </div>

              <button type="button" className="cart-clear-button" onClick={clearCart}>
                Clear cart
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => (
                <article key={item.productId} className="cart-item-card">
                  <div className="cart-item-card__media">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="cart-item-card__image" />
                    ) : (
                      <div className="cart-item-card__image cart-item-card__image--empty">
                        <Package size={28} strokeWidth={1.7} />
                      </div>
                    )}
                  </div>

                  <div className="cart-item-card__body">
                    <div className="cart-item-card__header">
                      <div>
                        <p className="cart-item-card__type">Muwas Bottle</p>
                        <h3>{item.name}</h3>
                      </div>

                      <button
                        type="button"
                        className="cart-item-card__remove"
                        onClick={() => removeFromCart(item.productId)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={16} strokeWidth={1.9} />
                      </button>
                    </div>

                    <p className="cart-item-card__description">{getCartDescription(item.name)}</p>

                    <div className="cart-item-card__footer">
                      <div className="cart-item-card__price">
                        <strong>{formatPrice(item.price)}</strong>
                        <span>Per bottle</span>
                      </div>

                      <div className="cart-item-card__quantity">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus size={15} strokeWidth={2} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus size={15} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="cart-item-card__total">
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                        <span>Line total</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-summary">
            <div className="cart-summary__panel">
              <p className="cart-section-heading__eyebrow">Order Summary</p>
              <h2>Checkout details</h2>

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Items</span>
                  <strong>{itemCount}</strong>
                </div>
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div className="cart-summary__row">
                  <span>Delivery</span>
                  <strong>{formatPrice(deliveryFee)}</strong>
                </div>
              </div>

              <div className="cart-summary__total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <div className="cart-summary__actions">
                <Link to="/checkout" className="cart-pill cart-pill--primary cart-pill--wide">
                  Proceed to checkout
                  <ArrowRight size={16} strokeWidth={1.9} />
                </Link>
                <Link to="/products" className="cart-pill cart-pill--wide">
                  Continue shopping
                </Link>
              </div>

              {user?.role === 'wholesale' && (
                <div className="cart-summary__notice">
                  <Sparkles size={16} strokeWidth={1.8} />
                  <span>Wholesale pricing is active for this basket.</span>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Cart;
