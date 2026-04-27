const { getDefaultProducts } = require('../data/defaultProducts');

const deepClone = (value) => JSON.parse(JSON.stringify(value));
const createFallbackId = (index) => `fallback-product-${index}`;

const createInitialCatalog = () =>
  getDefaultProducts().map((product, index) => ({
    ...product,
    _id: createFallbackId(index + 1),
    isActive: product.isActive !== false,
    createdAt: new Date(Date.now() - index * 1000).toISOString(),
    updatedAt: new Date(Date.now() - index * 1000).toISOString(),
  }));

let fallbackCatalog = createInitialCatalog();

const getFallbackCatalogSnapshot = () => deepClone(fallbackCatalog);

const getFallbackProductById = (id) =>
  fallbackCatalog.find((product) => String(product._id) === String(id)) || null;

const addFallbackProduct = (product) => {
  fallbackCatalog.unshift(deepClone(product));
  return deepClone(product);
};

const replaceFallbackProduct = (id, product) => {
  const index = fallbackCatalog.findIndex((item) => String(item._id) === String(id));

  if (index === -1) {
    return null;
  }

  fallbackCatalog[index] = deepClone(product);
  return deepClone(fallbackCatalog[index]);
};

const updateFallbackProductById = (id, updater) => {
  const index = fallbackCatalog.findIndex((item) => String(item._id) === String(id));

  if (index === -1) {
    return null;
  }

  const currentSnapshot = deepClone(fallbackCatalog[index]);
  const nextValue =
    typeof updater === 'function'
      ? updater(currentSnapshot)
      : { ...currentSnapshot, ...(updater || {}) };

  fallbackCatalog[index] = deepClone(nextValue);
  return deepClone(fallbackCatalog[index]);
};

module.exports = {
  createFallbackId,
  getFallbackCatalogSnapshot,
  getFallbackProductById,
  addFallbackProduct,
  replaceFallbackProduct,
  updateFallbackProductById,
};
