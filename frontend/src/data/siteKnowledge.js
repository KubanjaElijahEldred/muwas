const fallbackProducts = [
  {
    name: 'Muwas Premium Gin',
    category: 'gin',
    shortDescription: 'Premium craft gin with Ugandan botanicals.',
    description:
      'A premium craft gin made with locally sourced juniper, citrus peels, and a layered East African spice finish.',
    tastingNotes: ['Citrus', 'Spicy', 'Herbal', 'Smooth finish'],
    ingredients: ['Juniper', 'Ugandan citrus', 'Coriander', 'Cardamom', 'Cinnamon'],
    price: 45000,
    wholesalePrice: 35000,
    abv: 42,
    volume: 750,
    stock: 150,
  },
  {
    name: 'Muwas Coffee Liqueur',
    category: 'liqueur',
    shortDescription: 'Premium coffee liqueur with Ugandan Arabica.',
    description:
      'Rich and indulgent liqueur made with premium Ugandan Arabica coffee beans from Mount Elgon.',
    tastingNotes: ['Coffee', 'Sweet', 'Vanilla', 'Rich'],
    ingredients: ['Ugandan Arabica Coffee', 'Vanilla', 'Caramel', 'Spices'],
    price: 38000,
    wholesalePrice: 28000,
    abv: 25,
    volume: 750,
    stock: 100,
  },
  {
    name: 'Muwas Citrus Vodka',
    category: 'vodka',
    shortDescription: 'Smooth vodka with natural citrus infusion.',
    description:
      'Smooth and crisp vodka infused with natural Ugandan citrus fruits for a brighter service pour.',
    tastingNotes: ['Citrus', 'Clean', 'Smooth', 'Refreshing'],
    ingredients: ['Ugandan Wheat', 'Citrus Fruits', 'Spring Water'],
    price: 32000,
    wholesalePrice: 24000,
    abv: 40,
    volume: 750,
    stock: 200,
  },
  {
    name: 'Muwas Spiced Rum',
    category: 'rum',
    shortDescription: 'Bold spiced rum with East African flavors.',
    description:
      'A bold spiced rum aged in oak barrels and infused with vanilla, cinnamon, and a hint of Ugandan chili.',
    tastingNotes: ['Spicy', 'Sweet', 'Oak', 'Warm finish'],
    ingredients: ['Sugarcane', 'Cinnamon', 'Vanilla', 'Nutmeg', 'Ugandan Chili'],
    price: 42000,
    wholesalePrice: 32000,
    abv: 37.5,
    volume: 750,
    stock: 120,
  },
  {
    name: 'Muwas Orange Gin',
    category: 'gin',
    shortDescription: 'Refreshing gin with Ugandan oranges.',
    description:
      'A refreshing orange-led gin made with sun-ripened citrus from central Uganda and classic gin botanicals.',
    tastingNotes: ['Orange', 'Citrus', 'Floral', 'Juniper'],
    ingredients: ['Juniper', 'Ugandan Oranges', 'Coriander', 'Angelica Root'],
    price: 48000,
    wholesalePrice: 36000,
    abv: 42,
    volume: 750,
    stock: 80,
  },
  {
    name: 'Muwas Premium Whiskey',
    category: 'whiskey',
    shortDescription: 'Smooth aged whiskey with tropical notes.',
    description:
      'A smooth mellow whiskey aged in American oak with caramel, vanilla, and subtle tropical fruit notes.',
    tastingNotes: ['Caramel', 'Vanilla', 'Tropical Fruit', 'Oak'],
    ingredients: ['Malted Barley', 'Ugandan Tropical Fruits', 'Oak'],
    price: 65000,
    wholesalePrice: 50000,
    abv: 43,
    volume: 750,
    stock: 60,
  },
];

const siteEntries = [
  {
    id: 'home',
    type: 'page',
    label: 'Home',
    path: '/',
    description:
      'The landing page introduces Muwas Distilling, the featured online shop, story highlights, and payment options.',
    keywords: ['home', 'landing', 'hero', 'shop', 'payment', 'featured'],
  },
  {
    id: 'story',
    type: 'page',
    label: 'Story',
    path: '/story',
    description:
      'The Story page explains the brand background, Masaka roots, field notes, timeline, and botanicals.',
    keywords: ['story', 'origins', 'brand', 'journey', 'masaka', 'botanicals'],
  },
  {
    id: 'products',
    type: 'page',
    label: 'Products',
    path: '/products',
    description:
      'Browse the current collection, product details, tasting notes, ingredients, pricing, and categories.',
    keywords: ['products', 'shop', 'buy', 'collection', 'bottles', 'catalog'],
  },
  {
    id: 'contact',
    type: 'page',
    label: 'Contact & Tours',
    path: '/contact',
    description:
      'Contact Muwas, send a message, or book a farm or distillery tour from the contact page.',
    keywords: ['contact', 'tour', 'visit', 'book', 'email', 'phone', 'message'],
  },
  {
    id: 'cart',
    type: 'page',
    label: 'Cart',
    path: '/cart',
    description: 'Review selected bottles and continue to checkout.',
    keywords: ['cart', 'checkout', 'basket', 'order'],
  },
  {
    id: 'wholesale',
    type: 'page',
    label: 'Wholesale Login',
    path: '/login',
    description:
      'The wholesale and account entry point gives access to the wholesale portal for approved users.',
    keywords: ['wholesale', 'portal', 'login', 'account', 'admin'],
  },
  {
    id: 'payments',
    type: 'info',
    label: 'Payment Options',
    path: '/#featured-shop',
    description:
      'The featured shop highlights three payment methods: Mobile Money, Credit Card, and Bank Transfer.',
    keywords: ['payment', 'mobile money', 'credit card', 'bank transfer', 'pay'],
  },
  {
    id: 'contact-info',
    type: 'info',
    label: 'Visit & Contact Details',
    path: '/contact',
    description:
      'Muwas Distilling is presented as based in Kampala and the Masaka Road corridor, with email, phone, and tours contact options.',
    keywords: ['address', 'location', 'kampala', 'masaka', 'phone', 'email', 'visit'],
  },
];

const assistantSuggestions = [
  'Show me the products',
  'How do I book a tour?',
  'What payment options do you support?',
  'Tell me the Muwas story',
];

const defaultAssistantLinks = [
  { label: 'Open Products', path: '/products' },
  { label: 'Read The Story', path: '/story' },
  { label: 'Book A Tour', path: '/contact' },
];

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getProductPath(product) {
  return product?._id
    ? `/product/${product._id}`
    : `/products?search=${encodeURIComponent(product?.name || '')}`;
}

function getProducts(products) {
  return Array.isArray(products) && products.length > 0 ? products : fallbackProducts;
}

function buildProductEntries(products = []) {
  return getProducts(products).map((product) => {
    const tastingNotes = Array.isArray(product.tastingNotes) ? product.tastingNotes.join(', ') : '';
    const ingredients = Array.isArray(product.ingredients) ? product.ingredients.join(', ') : '';

    return {
      id: `product-${product._id || product.name}`,
      type: 'product',
      label: product.name,
      path: getProductPath(product),
      description:
        product.shortDescription ||
        product.description ||
        [tastingNotes, ingredients].filter(Boolean).join('. '),
      keywords: [
        product.name,
        product.category,
        product.shortDescription,
        product.description,
        tastingNotes,
        ingredients,
      ]
        .filter(Boolean)
        .join(' ')
        .split(/\s+/),
      product,
    };
  });
}

function scoreEntry(entry, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return 0;
  }

  const label = normalize(entry.label);
  const description = normalize(entry.description || '');
  const keywords = normalize((entry.keywords || []).join(' '));

  let score = 0;

  if (label.includes(normalizedQuery)) {
    score += 12;
  }

  if (keywords.includes(normalizedQuery)) {
    score += 9;
  }

  if (description.includes(normalizedQuery)) {
    score += 5;
  }

  normalizedQuery.split(' ').forEach((token) => {
    if (!token) {
      return;
    }

    if (label.includes(token)) {
      score += 4;
    }

    if (keywords.includes(token)) {
      score += 3;
    }

    if (description.includes(token)) {
      score += 1;
    }
  });

  return score;
}

function buildKnowledgeEntries(products = []) {
  return [...siteEntries, ...buildProductEntries(products)];
}

function searchKnowledge(query, products = [], limit = 6) {
  return buildKnowledgeEntries(products)
    .map((entry) => ({ ...entry, score: scoreEntry(entry, query) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function formatProductAnswer(products = []) {
  const currentProducts = getProducts(products).slice(0, 4);
  const names = currentProducts.map((product) => product.name).join(', ');

  return {
    text: `The current collection highlights ${names}. You can browse the full catalog, view tasting notes, and open individual product pages from the shop.`,
    links: currentProducts.map((product) => ({
      label: product.name,
      path: getProductPath(product),
    })),
  };
}

function getAssistantResponse(query, products = [], pathname = '/') {
  const normalizedQuery = normalize(query);
  const matches = searchKnowledge(query, products, 4);

  if (!normalizedQuery) {
    return {
      text:
        'I can help with products, the Muwas story, tours, contact details, payments, and account or wholesale navigation.',
      links: defaultAssistantLinks,
    };
  }

  if (/(tour|visit|book|farm|distillery)/.test(normalizedQuery)) {
    return {
      text:
        'Tours are handled from the Contact page, where visitors can send a message or use the dedicated tour booking form for farm or distillery visits.',
      links: [
        { label: 'Book A Tour', path: '/contact' },
        { label: 'Read The Story', path: '/story' },
      ],
    };
  }

  if (/(payment|pay|mobile money|card|bank)/.test(normalizedQuery)) {
    return {
      text:
        'The website currently presents three payment options in the featured shop: Mobile Money, Credit Card, and Bank Transfer.',
      links: [{ label: 'Open Shop', path: '/products' }],
    };
  }

  if (/(contact|email|phone|address|location|kampala|masaka)/.test(normalizedQuery)) {
    return {
      text:
        'The site directs visitors to the Contact page for messages and tours. It also lists phone support, email contacts, and a Kampala or Masaka-area visit context for the brand.',
      links: [{ label: 'Contact Muwas', path: '/contact' }],
    };
  }

  if (/(story|origin|brand|journey|editor|atlas|timeline)/.test(normalizedQuery)) {
    return {
      text:
        'The Story page is the editorial brand journey for MUWAS. It covers the brand background, Masaka roots, field notes, key events, and the local botanical foundation of the spirits.',
      links: [{ label: 'Open Story', path: '/story' }],
    };
  }

  if (/(wholesale|login|account|register|profile|orders)/.test(normalizedQuery)) {
    return {
      text:
        'Account access starts from Login or Register, and approved wholesale or admin users can continue into the wholesale portal after signing in.',
      links: [
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ],
    };
  }

  if (/(product|shop|buy|gin|whisk|loquat|farm gin|select|reserve|bottle)/.test(normalizedQuery)) {
    return formatProductAnswer(products);
  }

  if (matches.length > 0) {
    return {
      text: `I found the closest MUWAS website matches for "${query}".`,
      links: matches.map((match) => ({
        label: match.label,
        path: match.path,
      })),
    };
  }

  return {
    text:
      `I couldn't find an exact answer for "${query}", but I can still help you navigate the products, story, tours, payments, and contact sections.`,
    links: defaultAssistantLinks,
  };
}

export {
  assistantSuggestions,
  buildKnowledgeEntries,
  defaultAssistantLinks,
  fallbackProducts,
  getAssistantResponse,
  searchKnowledge,
};
