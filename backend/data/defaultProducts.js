const defaultProducts = [
  {
    name: 'Kakoge Gin',
    description:
      "A vibrant botanical gin inspired by Uganda's landscape. Crisp, aromatic and unapologetically authentic.",
    shortDescription:
      "A vibrant botanical gin inspired by Uganda's landscape. Crisp, aromatic and unapologetically authentic.",
    price: 42000,
    wholesalePrice: 36000,
    images: [
      {
        url: '/images/kakoge.png',
        alt: 'Kakoge Gin Bottle',
      },
    ],
    category: 'gin',
    abv: 37.5,
    volume: 750,
    ingredients: ['Juniper Berries', 'Orange Peel', 'Coriander', 'Lemongrass', 'Orris Root'],
    stock: 150,
    isFeatured: true,
    isActive: true,
    tastingNotes: ['Crisp', 'Botanical', 'Citrus', 'Fresh finish'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Uganda',
    },
  },
  {
    name: 'Coffee Flavoured Vodka',
    description:
      'Smooth. Rich. Distinctly Ugandan. Crafted with premium vodka and locally sourced coffee beans.',
    shortDescription:
      'Smooth. Rich. Distinctly Ugandan. Crafted with premium vodka and locally sourced coffee beans.',
    price: 45000,
    wholesalePrice: 39000,
    images: [
      {
        url: '/images/vodka.png',
        alt: 'Coffee Flavoured Vodka Bottle',
      },
    ],
    category: 'vodka',
    abv: 42,
    volume: 750,
    ingredients: ['Premium Vodka', 'Roasted Coffee Beans'],
    stock: 150,
    isFeatured: true,
    isActive: true,
    tastingNotes: ['Coffee aroma', 'Rich body', 'Smooth finish'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Uganda',
    },
  },
];

function getDefaultProducts() {
  return defaultProducts.map((product) => ({
    ...product,
    images: product.images.map((image) => ({ ...image })),
    ingredients: [...product.ingredients],
    tastingNotes: [...product.tastingNotes],
    origin: { ...product.origin },
  }));
}

module.exports = {
  defaultProducts,
  getDefaultProducts,
};
