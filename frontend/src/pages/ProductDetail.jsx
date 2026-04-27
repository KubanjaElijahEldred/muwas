import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  formatLabel,
  formatPrice,
  normalizeProduct,
} from '../utils/productPresentation';
import { fetchWithApiFallback } from '../utils/api';
import { fallbackProducts } from '../data/fallbackProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      setSelectedImage(0);

      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetchWithApiFallback(`/products/${id}`);

        if (response.ok) {
          const data = await response.json();

          if (isMounted && data.product) {
            setProduct(normalizeProduct(data.product));
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }

      if (isMounted) {
        const fallbackProduct = fallbackProducts.find(
          (item) => String(item._id) === String(id)
        );

        if (fallbackProduct) {
          setProduct(normalizeProduct(fallbackProduct));
        } else {
          setProduct(null);
        }

        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const result = addToCart(product, quantity);

    if (!result?.success) {
      window.alert(result?.message || 'Unable to add this item right now.');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-page__inner">
          <div className="product-detail-loading" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-page__inner">
          <section className="product-detail-empty">
            <Package size={38} strokeWidth={1.7} />
            <h1>Product not found</h1>
            <p>The bottle you opened is no longer in the active catalog.</p>
            <Link to="/products" className="product-detail-pill product-detail-pill--primary">
              Back to Products
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const currentPrice =
    user?.role === 'wholesale' && product.wholesalePrice ? product.wholesalePrice : product.price;

  return (
    <div className="product-detail-page">
      <div className="product-detail-page__inner">
        <Link to="/products" className="product-detail-back-link">
          <ArrowLeft size={16} strokeWidth={1.9} />
          Back to Products
        </Link>

        <section className="product-detail-hero">
          <div className={`product-detail-gallery product-detail-gallery--${product.accent || 'default'}`}>
            <div className="product-detail-gallery__main">
              <span className="product-detail-gallery__badge">{formatLabel(product.category)}</span>
              <img
                src={product.images[selectedImage]?.url}
                alt={product.images[selectedImage]?.alt || product.name}
                className="product-detail-gallery__image"
              />
            </div>

            {product.images.length > 1 && (
              <div className="product-detail-gallery__thumbs">
                {product.images.map((image, index) => (
                  <button
                    key={`${product._id}-image-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`product-detail-gallery__thumb ${
                      selectedImage === index ? 'is-active' : ''
                    }`}
                    aria-label={`Show image ${index + 1} for ${product.name}`}
                  >
                    <img src={image.url} alt={image.alt || `${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-copy">
            <div className="product-detail-copy__eyebrow">
              <span>Muwas Distilling</span>
              <span>{product.badge}</span>
            </div>

            <h1>{product.name}</h1>

            <div className="product-detail-rating">
              <div className="product-detail-rating__stars" aria-hidden="true">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={`${product._id}-hero-star-${index}`}
                    className={index < Math.round(product.rating) ? 'is-filled' : ''}
                    size={16}
                    strokeWidth={1.8}
                  />
                ))}
              </div>
              <span>{product.rating.toFixed(1)} cellar score</span>
              <small>24 reviews</small>
            </div>

            <div className="product-detail-price">
              <strong>{formatPrice(currentPrice)}</strong>
              {user?.role === 'wholesale' && product.wholesalePrice ? (
                <span>Wholesale price active. Retail price {formatPrice(product.price)}.</span>
              ) : (
                <span>{product.offer}</span>
              )}
            </div>

            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-specs">
              <div>
                <span>ABV</span>
                <strong>{product.abv}%</strong>
              </div>
              <div>
                <span>Volume</span>
                <strong>{product.volume}ml</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>{product.stock} units</strong>
              </div>
            </div>

            <div className="product-detail-purchase">
              <div className="product-detail-quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} strokeWidth={1.9} />
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(Number(product.stock || 1), current + 1))
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={16} strokeWidth={1.9} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || product.isPreviewOnly}
                className="product-detail-pill product-detail-pill--primary"
              >
                <ShoppingCart size={16} strokeWidth={1.9} />
                {product.stock === 0
                  ? 'Out of Stock'
                  : product.isPreviewOnly
                    ? 'Live catalog unavailable'
                    : 'Add to Cart'}
              </button>
            </div>

            <div className="product-detail-origin">
              <MapPin size={16} strokeWidth={1.8} />
              <span>
                Distilled at {product.origin?.distillery}, {product.origin?.location}
              </span>
            </div>
          </div>
        </section>

        <section className="product-detail-grid">
          <article className="product-detail-panel">
            <div className="product-detail-panel__heading">
              <p>Tasting Notes</p>
              <h2>What you&apos;ll notice in the glass</h2>
            </div>

            <div className="product-detail-tags">
              {(product.tastingNotes || []).map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </article>

          <article className="product-detail-panel">
            <div className="product-detail-panel__heading">
              <p>Key Ingredients</p>
              <h2>Farm-led components</h2>
            </div>

            <div className="product-detail-tags product-detail-tags--warm">
              {(product.ingredients || []).map((ingredient) => (
                <span key={ingredient}>{ingredient}</span>
              ))}
            </div>
          </article>

          <article className="product-detail-story">
            <div className="product-detail-story__copy">
              <p>Origin</p>
              <h2>Single origin spirits, farm-grown botanicals.</h2>
              <span>
                This bottle sits inside the Muwas collection as a retail-ready expression designed
                for guided tastings, premium gifting, and hospitality shelves.
              </span>
            </div>

            <div className="product-detail-story__meta">
              <div>
                <Sparkles size={17} strokeWidth={1.8} />
                <strong>{product.badge}</strong>
                <span>Current bottle note</span>
              </div>
              <div>
                <Package size={17} strokeWidth={1.8} />
                <strong>{product.stock} units</strong>
                <span>Visible stock now</span>
              </div>
              <div>
                <MapPin size={17} strokeWidth={1.8} />
                <strong>{product.origin?.location}</strong>
                <span>Distillery source</span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
