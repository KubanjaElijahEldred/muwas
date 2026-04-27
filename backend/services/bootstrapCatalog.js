const Product = require('../models/Product');
const { getDefaultProducts } = require('../data/defaultProducts');

async function ensureDefaultCatalog() {
  const activeProductCount = await Product.countDocuments({ isActive: true });

  if (activeProductCount > 0) {
    return {
      seeded: false,
      count: activeProductCount,
    };
  }

  const products = getDefaultProducts();
  await Product.insertMany(products);

  return {
    seeded: true,
    count: products.length,
  };
}

module.exports = {
  ensureDefaultCatalog,
};
