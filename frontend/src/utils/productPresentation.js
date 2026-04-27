const namedPresentation = {
  'Farm Gin': {
    accent: 'botanical',
    badge: 'Signature Pour',
    offer: 'Farm Favorite',
    rating: 4.9,
    promo: 'Bright citrus and juniper for clean G&Ts, tasting flights, and hotel bar menus.',
    artwork: '/images/farm.png',
  },
  'Loquat Reserve': {
    accent: 'reserve',
    badge: 'Reserve Release',
    offer: 'Limited Pour',
    rating: 4.8,
    promo: 'Oak depth, orange peel lift, and a smooth evening finish built for slower pours.',
    artwork: '/images/rovart.png',
  },
  'Muwas Select': {
    accent: 'select',
    badge: 'Cellar Choice',
    offer: 'Tour Favorite',
    rating: 4.7,
    promo: 'Barrel warmth, cocoa notes, and a darker smoky finish from the reserve shelf.',
    artwork: '/images/orange.png',
  },
  'Muwas Premium Gin': {
    accent: 'botanical',
    badge: 'Estate Gin',
    offer: 'Citrus Lift',
    rating: 4.8,
    promo: 'Craft gin led by Ugandan botanicals, bright peel, and a clean premium finish.',
    artwork: '/images/farm.png',
  },
  'Muwas Coffee Liqueur': {
    accent: 'coffee',
    badge: 'After Dinner Pour',
    offer: 'Coffee Roast',
    rating: 4.8,
    promo: 'Arabica-led richness with vanilla warmth for espresso martinis and slow sipping.',
    artwork: '/images/rovart.png',
  },
  'Muwas Citrus Vodka': {
    accent: 'crystal',
    badge: 'Clean Pour',
    offer: 'Citrus Bright',
    rating: 4.6,
    promo: 'Multiple-distilled vodka with an easy citrus lift for highballs and house cocktails.',
    artwork: '/images/farm.png',
  },
  'Muwas Spiced Rum': {
    accent: 'spice',
    badge: 'Barrel Spice',
    offer: 'Warm Finish',
    rating: 4.7,
    promo: 'Oak-aged rum rounded with cinnamon, vanilla, and East African spice character.',
    artwork: '/images/orange.png',
  },
  'Muwas Orange Gin': {
    accent: 'sunset',
    badge: 'Orange Blossom',
    offer: 'Fresh Harvest',
    rating: 4.7,
    promo: 'Sun-ripened orange expression with floral lift and a softer, brighter gin profile.',
    artwork: '/images/orange.png',
  },
  'Muwas Premium Whiskey': {
    accent: 'reserve',
    badge: 'Oak Reserve',
    offer: 'Slow Aged',
    rating: 4.8,
    promo: 'Mellow oak, caramel, and tropical fruit notes shaped for gifting and evening service.',
    artwork: '/images/rovart.png',
  },
};

const categoryPresentation = {
  gin: {
    accent: 'botanical',
    badge: 'Estate Gin',
    offer: 'Botanical Pour',
    rating: 4.7,
    promo: 'Botanical layers, citrus brightness, and a polished distillery finish.',
  },
  liqueur: {
    accent: 'coffee',
    badge: 'Dessert Bottle',
    offer: 'Velvet Pour',
    rating: 4.7,
    promo: 'Richer texture, softer sweetness, and a smooth after-dinner profile.',
  },
  vodka: {
    accent: 'crystal',
    badge: 'Clear Spirit',
    offer: 'Bright Finish',
    rating: 4.6,
    promo: 'Clean and crisp with an easy finish for mixed drinks and service pours.',
  },
  rum: {
    accent: 'spice',
    badge: 'Spice Barrel',
    offer: 'Cellar Warmth',
    rating: 4.7,
    promo: 'Spiced barrel character with warmth, oak, and cocktail-friendly depth.',
  },
  whiskey: {
    accent: 'reserve',
    badge: 'Reserve Cask',
    offer: 'Oak Aged',
    rating: 4.8,
    promo: 'A slower-aged profile with caramel, oak, and a longer finish.',
  },
  reserve: {
    accent: 'select',
    badge: 'Reserve Cellar',
    offer: 'Dark Finish',
    rating: 4.7,
    promo: 'Layered reserve spirit with cocoa, barrel warmth, and a rounder finish.',
  },
  signature: {
    accent: 'default',
    badge: 'Signature Bottle',
    offer: 'Featured',
    rating: 4.6,
    promo: 'Crafted spirit from the Muwas collection.',
  },
  other: {
    accent: 'default',
    badge: 'Signature Bottle',
    offer: 'Featured',
    rating: 4.6,
    promo: 'Crafted spirit from the Muwas collection.',
  },
};

const accentPalettes = {
  botanical: {
    backgroundStart: '#133528',
    backgroundEnd: '#071a16',
    glow: '#85d58f',
    liquid: '#d7efe3',
    label: '#f7e9d0',
    text: '#1d2b20',
  },
  reserve: {
    backgroundStart: '#4c2510',
    backgroundEnd: '#180d09',
    glow: '#f3af67',
    liquid: '#a86e35',
    label: '#f5e2c3',
    text: '#43200c',
  },
  select: {
    backgroundStart: '#41311a',
    backgroundEnd: '#151312',
    glow: '#d6a35d',
    liquid: '#bb7a30',
    label: '#f7e4c3',
    text: '#4e3213',
  },
  coffee: {
    backgroundStart: '#47231d',
    backgroundEnd: '#160b09',
    glow: '#d88c71',
    liquid: '#6a2f23',
    label: '#f4dec9',
    text: '#441f17',
  },
  crystal: {
    backgroundStart: '#193447',
    backgroundEnd: '#07141f',
    glow: '#7cbad7',
    liquid: '#c7e6f1',
    label: '#eef8fc',
    text: '#1a3b49',
  },
  spice: {
    backgroundStart: '#5a2512',
    backgroundEnd: '#1c0d08',
    glow: '#ef955f',
    liquid: '#b5532b',
    label: '#f7dfc9',
    text: '#482012',
  },
  sunset: {
    backgroundStart: '#6d3d14',
    backgroundEnd: '#201108',
    glow: '#ffb058',
    liquid: '#ef8a1c',
    label: '#fce4c4',
    text: '#5a2f10',
  },
  default: {
    backgroundStart: '#23354c',
    backgroundEnd: '#0b1420',
    glow: '#caa06b',
    liquid: '#c38c48',
    label: '#f5e3c7',
    text: '#4a3015',
  },
};

function escapeSvgText(value = '') {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitName(value = '') {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 14 && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 2);
}

function createPosterLabel(name, category, accent) {
  const palette = accentPalettes[accent] || accentPalettes.default;
  const nameLines = splitName(name);
  const labelLines = nameLines
    .map(
      (line, index) =>
        `<tspan x="240" dy="${index === 0 ? 0 : 42}">${escapeSvgText(line.toUpperCase())}</tspan>`
    )
    .join('');

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 700" role="img" aria-label="${escapeSvgText(
      name
    )}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.backgroundStart}" />
          <stop offset="100%" stop-color="${palette.backgroundEnd}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="12%" r="70%">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.72" />
          <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="100%" stop-color="#f0f0f0" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="480" height="700" rx="44" fill="url(#bg)" />
      <rect width="480" height="700" rx="44" fill="url(#glow)" />
      <circle cx="130" cy="146" r="110" fill="${palette.glow}" opacity="0.12" />
      <circle cx="388" cy="564" r="132" fill="${palette.glow}" opacity="0.08" />
      <rect x="206" y="88" width="68" height="90" rx="22" fill="${palette.liquid}" opacity="0.45" />
      <rect x="185" y="62" width="110" height="54" rx="18" fill="#c49a63" opacity="0.88" />
      <rect x="159" y="148" width="162" height="406" rx="68" fill="url(#glass)" stroke="#f3ead8" stroke-opacity="0.34" stroke-width="3" />
      <rect x="173" y="214" width="134" height="312" rx="52" fill="${palette.liquid}" opacity="0.88" />
      <ellipse cx="240" cy="540" rx="116" ry="18" fill="#040607" opacity="0.26" />
      <ellipse cx="206" cy="220" rx="30" ry="150" fill="#ffffff" opacity="0.18" />
      <rect x="120" y="282" width="240" height="150" rx="26" fill="${palette.label}" opacity="0.97" />
      <rect x="120" y="282" width="240" height="150" rx="26" fill="none" stroke="#b89461" stroke-width="3" stroke-opacity="0.72" />
      <text x="240" y="256" text-anchor="middle" font-family="Georgia, serif" font-size="24" letter-spacing="4" fill="#f7ead2">MUWAS DISTILLING</text>
      <text x="240" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" letter-spacing="2" fill="${palette.text}">${labelLines}</text>
      <text x="240" y="468" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#f7ead2">${escapeSvgText(
        String(category || 'signature').toUpperCase()
      )}</text>
      <text x="240" y="618" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="5" fill="#f7ead2">FARM-LED SPIRITS</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function slugify(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function formatLabel(value = '') {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPrice(price = 0) {
  return `UGX ${Number(price || 0).toLocaleString()}`;
}

function hasCheckoutCompatibleProductId(value = '') {
  if (typeof value !== 'string') {
    return false;
  }

  return /^[a-f\d]{24}$/i.test(value) || /^fallback-/i.test(value);
}

export function isPlaceholderImage(url = '') {
  return /via\.placeholder\.com/i.test(url);
}

export function getProductImage(product = {}, index = 0) {
  const name = product.name || 'Muwas Distilling';
  const category = product.category || 'signature';
  const namedTheme = namedPresentation[name] || {};
  const categoryTheme = categoryPresentation[category] || categoryPresentation.signature;
  const accent = namedTheme.accent || categoryTheme.accent || 'default';
  const imageUrl = Array.isArray(product.images) ? product.images[index]?.url : '';

  if (imageUrl && !isPlaceholderImage(imageUrl)) {
    return imageUrl;
  }

  if (namedTheme.artwork) {
    return namedTheme.artwork;
  }

  return createPosterLabel(name, category, accent);
}

export function normalizeProduct(product = {}, index = 0) {
  const hasDatabaseId = hasCheckoutCompatibleProductId(product._id);
  const name = product.name || `Muwas Bottle ${index + 1}`;
  const namedTheme = namedPresentation[name] || {};
  const category = product.category || namedTheme.category || 'signature';
  const categoryTheme = categoryPresentation[category] || categoryPresentation.signature;
  const accent = namedTheme.accent || categoryTheme.accent || 'default';
  const imageUrl = getProductImage({ ...product, name, category }, 0);
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((image, imageIndex) => ({
          ...image,
          url:
            image?.url && !isPlaceholderImage(image.url)
              ? image.url
              : imageIndex === 0
                ? imageUrl
                : createPosterLabel(`${name} ${imageIndex + 1}`, category, accent),
          alt: image?.alt || `${name} bottle artwork`,
        }))
      : [{ url: imageUrl, alt: `${name} bottle artwork` }];

  return {
    ...product,
    _id: hasDatabaseId ? product._id : `fallback-${slugify(name) || index + 1}`,
    isPreviewOnly: !hasDatabaseId,
    name,
    category,
    shortDescription:
      product.shortDescription || product.description || namedTheme.promo || categoryTheme.promo,
    description:
      product.description || product.shortDescription || namedTheme.promo || categoryTheme.promo,
    price: Number.isFinite(product.price) ? product.price : 92000,
    wholesalePrice: Number.isFinite(product.wholesalePrice) ? product.wholesalePrice : null,
    abv: Number.isFinite(product.abv) ? product.abv : 40,
    volume: Number.isFinite(product.volume) ? product.volume : 700,
    stock: Number.isFinite(product.stock) ? product.stock : 12,
    rating: product.rating || namedTheme.rating || categoryTheme.rating || 4.6,
    badge: namedTheme.badge || categoryTheme.badge || 'Signature Bottle',
    offer: namedTheme.offer || categoryTheme.offer || 'Featured',
    accent,
    promo: namedTheme.promo || categoryTheme.promo || product.shortDescription || '',
    origin: {
      distillery: product.origin?.distillery || 'Muwas Distilling',
      location: product.origin?.location || 'Kampala, Uganda',
    },
    images,
  };
}

export function normalizeProductCatalog(products = []) {
  return products.map((product, index) => normalizeProduct(product, index));
}

export function normalizeCartItem(item = {}) {
  const productId = item.productId || item._id || '';
  const hasDatabaseId = hasCheckoutCompatibleProductId(productId);

  return {
    ...item,
    productId,
    isPreviewOnly: !hasDatabaseId,
    image: getProductImage({
      name: item.name,
      category: item.category,
      images: item.image ? [{ url: item.image }] : [],
    }),
  };
}
