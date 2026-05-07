import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Check,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatLabel, formatPrice, normalizeProduct } from '../utils/productPresentation';
import { fetchWithApiFallback } from '../utils/api';
import { fallbackProducts } from '../data/fallbackProducts';

const colorOptions = [
  { label: 'Black', value: '#061735' },
  { label: 'Silver', value: '#aeb8c4' },
  { label: 'Blue', value: '#1f3f8f' },
  { label: 'Mist', value: '#d8e1ea' },
];

const sizeOptions = ['Small', 'Medium', 'Large'];

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);

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
        const fallbackProduct = fallbackProducts.find((item, index) => {
          const normalizedFallback = normalizeProduct(item, index);
          return item._id === id || normalizedFallback._id === id;
        });

        setProduct(fallbackProduct ? normalizeProduct(fallbackProduct) : null);
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

  const galleryImages = [
    ...(product.images || []),
    { url: '/images/home.png', alt: 'Muwas display' },
    { url: '/images/story.png', alt: 'Muwas story display' },
  ].slice(0, 4);
  const currentPrice =
    user?.role === 'wholesale' && product.wholesalePrice ? product.wholesalePrice : product.price;
  const originalPrice = Math.round(Number(currentPrice || 0) * 1.12);
  const relatedTags = [
    product.name,
    formatLabel(product.category),
    'Muwas',
    'Craft spirits',
    'Wholesale',
    'Best sellers',
  ];

  return (
    <div className="product-detail-page">
      <div className="product-detail-page__inner">
        <section className="product-detail-shell">
          <div className="product-detail-topline">
            <nav aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/products">Products</Link>
              <span>/</span>
              <Link to={`/products?search=${product.category}`}>{formatLabel(product.category)}</Link>
              <span>/</span>
              <strong>{product.name}</strong>
            </nav>

            <Link to="/products" className="product-detail-back-link">
              Back to Products
            </Link>
          </div>

          <div className="product-detail-hero">
            <div className="product-detail-gallery">
              <div className="product-detail-gallery__thumbs">
                {galleryImages.map((image, index) => (
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

              <div className="product-detail-gallery__main">
                <img
                  src={galleryImages[selectedImage]?.url}
                  alt={galleryImages[selectedImage]?.alt || product.name}
                  className="product-detail-gallery__image"
                />
              </div>
            </div>

            <aside className="product-detail-copy">
              <span className="product-detail-stock">In Stock</span>
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
                <strong>{product.rating.toFixed(1)}</strong>
                <span>({Math.max(0, Math.round(product.rating * 36))} reviews)</span>
              </div>

              <div className="product-detail-price">
                <strong>{formatPrice(currentPrice)}</strong>
                <span>{formatPrice(originalPrice)}</span>
                <small>-10%</small>
              </div>

              <p className="product-detail-description">{product.shortDescription || product.description}</p>

              <div className="product-detail-choice">
                <strong>Color: {selectedColor.label}</strong>
                <div className="product-detail-swatches">
                  {colorOptions.map((color) => (
                    <button
                      key={color.label}
                      type="button"
                      className={selectedColor.label === color.label ? 'is-active' : ''}
                      style={{ '--swatch-color': color.value }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Choose ${color.label}`}
                    />
                  ))}
                </div>
              </div>

              <div className="product-detail-choice">
                <strong>Size: {selectedSize}</strong>
                <div className="product-detail-sizes">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={selectedSize === size ? 'is-active' : ''}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-detail-purchase">
                <strong>Quantity:</strong>
                <div className="product-detail-quantity">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} strokeWidth={2} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(Number(product.stock || 1), current + 1))
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>

              <span className="product-detail-selected">
                {selectedColor.label} / {selectedSize}
              </span>

              <div className="product-detail-actions">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || product.isPreviewOnly}
                  className="product-detail-pill product-detail-pill--primary"
                >
                  <ShoppingCart size={18} strokeWidth={2} />
                  {product.stock === 0
                    ? 'Out of Stock'
                    : product.isPreviewOnly
                      ? 'Live catalog unavailable'
                      : 'Add to Cart'}
                </button>
                <Link to="/contact" className="product-detail-chat" aria-label="Chat about this product">
                  <MessageCircle size={20} strokeWidth={2} />
                </Link>
                <button type="button" className="product-detail-heart" aria-label="Add to favorites">
                  <Heart size={21} strokeWidth={1.9} />
                </button>
              </div>

              <div className="product-detail-benefits">
                <div>
                  <Check size={15} strokeWidth={2.2} />
                  <strong>100% Original</strong>
                  <span>Genuine products</span>
                </div>
                <div>
                  <RotateCcw size={15} strokeWidth={2.1} />
                  <strong>7-Day Returns</strong>
                  <span>Easy returns</span>
                </div>
                <div>
                  <Truck size={15} strokeWidth={2.1} />
                  <strong>Free Delivery</strong>
                  <span>On orders over UGX 100,000</span>
                </div>
              </div>
            </aside>
          </div>

          <section className="product-detail-related">
            <h2>Related Searches</h2>
            <div>
              {relatedTags.map((tag) => (
                <Link key={tag} to={`/products?search=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
