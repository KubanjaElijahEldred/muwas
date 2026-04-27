const defaultProducts = [
  {
    name: 'Muwas Premium Gin',
    description:
      'A premium craft gin made with the finest Ugandan botanicals, including locally sourced juniper, citrus peels, and a secret blend of East African spices. Perfect for classic cocktails or enjoyed neat.',
    shortDescription: 'Premium craft gin with Ugandan botanicals',
    price: 45000,
    wholesalePrice: 35000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Premium+Gin',
        alt: 'Muwas Premium Gin Bottle',
      },
    ],
    category: 'gin',
    abv: 42,
    volume: 750,
    ingredients: ['Juniper', 'Ugandan Citrus', 'Coriander', 'Cardamom', 'Cinnamon'],
    stock: 150,
    isFeatured: true,
    isActive: true,
    tastingNotes: ['Citrus', 'Spicy', 'Herbal', 'Smooth Finish'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
    },
  },
  {
    name: 'Muwas Coffee Liqueur',
    description:
      'Rich and indulgent liqueur made with premium Ugandan Arabica coffee beans from Mount Elgon. Perfect as an after-dinner drink or in coffee-based cocktails.',
    shortDescription: 'Premium coffee liqueur with Ugandan Arabica',
    price: 38000,
    wholesalePrice: 28000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Coffee+Liqueur',
        alt: 'Muwas Coffee Liqueur Bottle',
      },
    ],
    category: 'liqueur',
    abv: 25,
    volume: 750,
    ingredients: ['Ugandan Arabica Coffee', 'Vanilla', 'Caramel', 'Spices'],
    stock: 100,
    isFeatured: true,
    isActive: true,
    tastingNotes: ['Coffee', 'Sweet', 'Vanilla', 'Rich'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
    },
  },
  {
    name: 'Muwas Citrus Vodka',
    description:
      'Smooth and crisp vodka infused with natural Ugandan citrus fruits. Distilled multiple times for exceptional purity and finished with a hint of local orange and lemon zest.',
    shortDescription: 'Smooth vodka with natural citrus infusion',
    price: 32000,
    wholesalePrice: 24000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Citrus+Vodka',
        alt: 'Muwas Citrus Vodka Bottle',
      },
    ],
    category: 'vodka',
    abv: 40,
    volume: 750,
    ingredients: ['Ugandan Wheat', 'Citrus Fruits', 'Spring Water'],
    stock: 200,
    isFeatured: false,
    isActive: true,
    tastingNotes: ['Citrus', 'Clean', 'Smooth', 'Refreshing'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
    },
  },
  {
    name: 'Muwas Spiced Rum',
    description:
      'A bold spiced rum inspired by East African flavors. Aged in oak barrels and infused with local spices including cinnamon, vanilla, and a hint of Ugandan chili.',
    shortDescription: 'Bold spiced rum with East African flavors',
    price: 42000,
    wholesalePrice: 32000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Spiced+Rum',
        alt: 'Muwas Spiced Rum Bottle',
      },
    ],
    category: 'rum',
    abv: 37.5,
    volume: 750,
    ingredients: ['Sugarcane', 'Cinnamon', 'Vanilla', 'Nutmeg', 'Ugandan Chili'],
    stock: 120,
    isFeatured: true,
    isActive: true,
    tastingNotes: ['Spicy', 'Sweet', 'Oak', 'Warm Finish'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
    },
  },
  {
    name: 'Muwas Orange Gin',
    description:
      'A refreshing gin variation featuring prominent Ugandan orange notes. Made with sun-ripened oranges from central Uganda combined with traditional gin botanicals.',
    shortDescription: 'Refreshing gin with Ugandan oranges',
    price: 48000,
    wholesalePrice: 36000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Orange+Gin',
        alt: 'Muwas Orange Gin Bottle',
      },
    ],
    category: 'gin',
    abv: 42,
    volume: 750,
    ingredients: ['Juniper', 'Ugandan Oranges', 'Coriander', 'Angelica Root'],
    stock: 80,
    isFeatured: false,
    isActive: true,
    tastingNotes: ['Orange', 'Citrus', 'Floral', 'Juniper'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
    },
  },
  {
    name: 'Muwas Premium Whiskey',
    description:
      'A smooth, mellow whiskey aged in American oak barrels with a Ugandan twist. Notes of caramel, vanilla, and subtle tropical fruit.',
    shortDescription: 'Smooth aged whiskey with tropical notes',
    price: 65000,
    wholesalePrice: 50000,
    images: [
      {
        url: 'https://via.placeholder.com/400x600/1a1a1a/FFD700?text=Muwas+Premium+Whiskey',
        alt: 'Muwas Premium Whiskey Bottle',
      },
    ],
    category: 'whiskey',
    abv: 43,
    volume: 750,
    ingredients: ['Malted Barley', 'Ugandan Tropical Fruits', 'Oak'],
    stock: 60,
    isFeatured: false,
    isActive: true,
    tastingNotes: ['Caramel', 'Vanilla', 'Tropical Fruit', 'Oak'],
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Kampala, Uganda',
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
