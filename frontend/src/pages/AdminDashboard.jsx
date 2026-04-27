import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  Package,
  PhoneCall,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatLabel, formatPrice } from '../utils/productPresentation';

const orderStatusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];
const productCategories = ['gin', 'vodka', 'rum', 'whiskey', 'liqueur', 'other'];
const contactStatusOptions = ['new', 'in_progress', 'resolved'];

const createEmptyProductForm = () => ({
  name: '',
  shortDescription: '',
  description: '',
  category: 'gin',
  price: '',
  wholesalePrice: '',
  abv: '40',
  volume: '750',
  stock: '0',
  isFeatured: false,
  imageUrl: '',
  imageAlt: '',
  ingredients: '',
  tastingNotes: '',
});

const parseListField = (value = '') =>
  String(value || '')
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const mapProductToForm = (product = {}) => ({
  name: product.name || '',
  shortDescription: product.shortDescription || '',
  description: product.description || '',
  category: product.category || 'gin',
  price: product.price === 0 ? '0' : String(product.price || ''),
  wholesalePrice:
    product.wholesalePrice === 0 || product.wholesalePrice
      ? String(product.wholesalePrice)
      : '',
  abv: product.abv === 0 ? '0' : String(product.abv || ''),
  volume: product.volume === 0 ? '0' : String(product.volume || ''),
  stock: product.stock === 0 ? '0' : String(product.stock || ''),
  isFeatured: Boolean(product.isFeatured),
  imageUrl: product.images?.[0]?.url || '',
  imageAlt: product.images?.[0]?.alt || '',
  ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : '',
  tastingNotes: Array.isArray(product.tastingNotes) ? product.tastingNotes.join(', ') : '',
});

const buildProductPayload = (form = {}) => {
  const name = String(form.name || '').trim();
  const shortDescription = String(form.shortDescription || '').trim();
  const description = String(form.description || '').trim();
  const category = String(form.category || '').trim().toLowerCase();
  const price = Number(form.price);
  const abv = Number(form.abv);
  const volume = Number(form.volume);
  const stock = Number(form.stock);
  const wholesalePriceValue = String(form.wholesalePrice || '').trim();
  const wholesalePrice =
    wholesalePriceValue === '' ? null : Number(wholesalePriceValue);
  const imageUrl = String(form.imageUrl || '').trim();
  const imageAlt = String(form.imageAlt || '').trim();
  const ingredients = parseListField(form.ingredients);
  const tastingNotes = parseListField(form.tastingNotes);

  if (!name || !shortDescription || !description) {
    throw new Error('Name, short description, and full description are required.');
  }

  if (!productCategories.includes(category)) {
    throw new Error('Please choose a valid category.');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Price must be a valid non-negative number.');
  }

  if (!Number.isFinite(abv) || abv < 0) {
    throw new Error('ABV must be a valid non-negative number.');
  }

  if (!Number.isFinite(volume) || volume <= 0) {
    throw new Error('Volume must be greater than zero.');
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('Stock must be a valid non-negative number.');
  }

  if (wholesalePrice !== null && (!Number.isFinite(wholesalePrice) || wholesalePrice < 0)) {
    throw new Error('Wholesale price must be blank or a valid non-negative number.');
  }

  const payload = {
    name,
    shortDescription,
    description,
    category,
    price,
    abv,
    volume,
    stock,
    isFeatured: Boolean(form.isFeatured),
    ingredients,
    tastingNotes,
    origin: {
      distillery: 'Muwas Distilling',
      location: 'Uganda',
    },
  };

  if (wholesalePrice !== null) {
    payload.wholesalePrice = wholesalePrice;
  }

  if (imageUrl) {
    payload.images = [
      {
        url: imageUrl,
        alt: imageAlt || `${name} bottle`,
      },
    ];
  } else {
    payload.images = [];
  }

  return payload;
};

const getNoticeType = (type = 'info') => {
  if (type === 'success' || type === 'error' || type === 'warning') {
    return type;
  }

  return 'info';
};

const AdminDashboard = () => {
  const { api, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [editingProductId, setEditingProductId] = useState('');
  const [productForm, setProductForm] = useState(createEmptyProductForm());
  const [orderDrafts, setOrderDrafts] = useState({});
  const [contactDrafts, setContactDrafts] = useState({});
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productDeletingId, setProductDeletingId] = useState('');
  const [orderSavingId, setOrderSavingId] = useState('');
  const [orderDeletingId, setOrderDeletingId] = useState('');
  const [contactSavingId, setContactSavingId] = useState('');
  const [contactDeletingId, setContactDeletingId] = useState('');

  const pushNotice = (text, type = 'info') => {
    if (!text) {
      setNotice({ type: '', text: '' });
      return;
    }

    setNotice({
      type: getNoticeType(type),
      text,
    });
  };

  const primeOrderDrafts = (nextOrders = []) => {
    const nextDrafts = {};

    nextOrders.forEach((order) => {
      nextDrafts[order._id] = {
        status: order.status || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        trackingNumber: order.trackingNumber || '',
      };
    });

    setOrderDrafts(nextDrafts);
  };

  const primeContactDrafts = (nextContacts = []) => {
    const nextDrafts = {};

    nextContacts.forEach((contact) => {
      nextDrafts[contact._id] = {
        status: contact.status || 'new',
        adminNotes: contact.adminNotes || '',
      };
    });

    setContactDrafts(nextDrafts);
  };

  const fetchDashboardData = async ({ initial = false, silent = false } = {}) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [ordersResult, productsResult, contactsResult] = await Promise.allSettled([
        api.get('/orders?limit=200'),
        api.get('/products?limit=200'),
        api.get('/contact?limit=200'),
      ]);

      const nextOrders =
        ordersResult.status === 'fulfilled'
          ? ordersResult.value?.data?.orders || []
          : [];
      const nextProducts =
        productsResult.status === 'fulfilled'
          ? productsResult.value?.data?.products || []
          : [];
      const nextContacts =
        contactsResult.status === 'fulfilled'
          ? contactsResult.value?.data?.contacts || []
          : [];

      const failedSegments = [];
      if (ordersResult.status === 'rejected') failedSegments.push('orders');
      if (productsResult.status === 'rejected') failedSegments.push('products');
      if (contactsResult.status === 'rejected') failedSegments.push('contacts');

      setOrders(nextOrders);
      setProducts(nextProducts);
      setContacts(nextContacts);
      primeOrderDrafts(nextOrders);
      primeContactDrafts(nextContacts);

      if (!silent) {
        if (failedSegments.length > 0) {
          pushNotice(`Some data failed to load: ${failedSegments.join(', ')}.`, 'warning');
        } else {
          pushNotice('Dashboard synced successfully.', 'success');
        }
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      pushNotice('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData({ initial: true, silent: true });
  }, []);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.paymentStatus === 'paid')
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders]
  );

  const lowStockProductsCount = useMemo(
    () => products.filter((product) => Number(product.stock || 0) <= 10).length,
    [products]
  );

  const unresolvedContactsCount = useMemo(
    () => contacts.filter((contact) => contact.status !== 'resolved').length,
    [contacts]
  );

  const handleProductFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOrderDraftChange = (orderId, field, value) => {
    setOrderDrafts((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [field]: value,
      },
    }));
  };

  const handleContactDraftChange = (contactId, field, value) => {
    setContactDrafts((current) => ({
      ...current,
      [contactId]: {
        ...current[contactId],
        [field]: value,
      },
    }));
  };

  const resetProductForm = () => {
    setEditingProductId('');
    setProductForm(createEmptyProductForm());
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm(mapProductToForm(product));
    setActiveTab('products');
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setProductSubmitting(true);
    pushNotice('', 'info');

    try {
      const payload = buildProductPayload(productForm);

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
        pushNotice('Product updated successfully.', 'success');
      } else {
        await api.post('/products', payload);
        pushNotice('Product created successfully.', 'success');
      }

      resetProductForm();
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to save product.';
      pushNotice(message, 'error');
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    const confirmed = window.confirm(`Delete "${productName}" from active catalog?`);
    if (!confirmed) {
      return;
    }

    setProductDeletingId(productId);

    try {
      await api.delete(`/products/${productId}`);
      if (editingProductId === productId) {
        resetProductForm();
      }
      pushNotice('Product deleted successfully.', 'success');
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product.';
      pushNotice(message, 'error');
    } finally {
      setProductDeletingId('');
    }
  };

  const handleSaveOrder = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) {
      return;
    }

    setOrderSavingId(orderId);

    try {
      await api.put(`/orders/${orderId}/status`, {
        status: draft.status,
        paymentStatus: draft.paymentStatus,
        trackingNumber: draft.trackingNumber,
      });
      pushNotice('Order updated successfully.', 'success');
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update order.';
      pushNotice(message, 'error');
    } finally {
      setOrderSavingId('');
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    const confirmed = window.confirm(
      `Delete ${orderNumber || 'this order'}? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setOrderDeletingId(orderId);

    try {
      await api.delete(`/orders/${orderId}`);
      pushNotice('Order deleted successfully.', 'success');
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete order.';
      pushNotice(message, 'error');
    } finally {
      setOrderDeletingId('');
    }
  };

  const handleSaveContact = async (contactId) => {
    const draft = contactDrafts[contactId];
    if (!draft) {
      return;
    }

    setContactSavingId(contactId);

    try {
      await api.put(`/contact/${contactId}`, {
        status: draft.status,
        adminNotes: draft.adminNotes,
      });
      pushNotice('Contact request updated successfully.', 'success');
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update contact request.';
      pushNotice(message, 'error');
    } finally {
      setContactSavingId('');
    }
  };

  const handleDeleteContact = async (contactId) => {
    const confirmed = window.confirm('Delete this contact request?');
    if (!confirmed) {
      return;
    }

    setContactDeletingId(contactId);

    try {
      await api.delete(`/contact/${contactId}`);
      pushNotice('Contact request deleted successfully.', 'success');
      await fetchDashboardData({ silent: true });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete contact request.';
      pushNotice(message, 'error');
    } finally {
      setContactDeletingId('');
    }
  };

  if (loading) {
    return (
      <div className="admin-hub admin-hub--loading">
        <Loader2 className="admin-hub__loader" />
      </div>
    );
  }

  return (
    <div className="admin-hub">
      <div className="admin-hub__inner">
        <section className="admin-hub__hero">
          <div>
            <p className="admin-hub__eyebrow">Admin Control Center</p>
            <h1>Welcome back, {user?.name || 'Admin'}.</h1>
            <span>Manage catalog, orders, and contact requests from one place.</span>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData({ silent: false })}
            className="admin-hub__refresh"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Loader2 size={16} className="is-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Refresh data
              </>
            )}
          </button>
        </section>

        {notice.text && (
          <div className={`admin-hub__notice is-${notice.type || 'info'}`}>
            {notice.type === 'success' && <CheckCircle2 size={17} />}
            {notice.type === 'warning' && <AlertTriangle size={17} />}
            {notice.type === 'error' && <AlertTriangle size={17} />}
            {!notice.type && <Clock3 size={17} />}
            <span>{notice.text}</span>
          </div>
        )}

        <section className="admin-hub__metrics">
          <article>
            <span>
              <ShoppingCart size={18} />
              Total orders
            </span>
            <strong>{orders.length}</strong>
            <small>{pendingOrdersCount} awaiting processing</small>
          </article>

          <article>
            <span>
              <Wallet size={18} />
              Revenue
            </span>
            <strong>{formatPrice(totalRevenue)}</strong>
            <small>Paid orders only</small>
          </article>

          <article>
            <span>
              <Package size={18} />
              Products
            </span>
            <strong>{products.length}</strong>
            <small>{lowStockProductsCount} low stock alerts</small>
          </article>

          <article>
            <span>
              <Inbox size={18} />
              Contact requests
            </span>
            <strong>{contacts.length}</strong>
            <small>{unresolvedContactsCount} unresolved</small>
          </article>
        </section>

        <nav className="admin-hub__tabs" aria-label="Dashboard sections">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'products', label: 'Products' },
            { id: 'contacts', label: 'Contacts' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'is-active' : ''}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'overview' && (
          <section className="admin-hub__panel-grid">
            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Recent Orders</h2>
                <span>Latest {Math.min(orders.length, 6)} records</span>
              </div>

              {orders.length === 0 ? (
                <p className="admin-empty">No orders available yet.</p>
              ) : (
                <div className="admin-list">
                  {orders.slice(0, 6).map((order) => (
                    <div key={order._id} className="admin-list__row">
                      <div>
                        <strong>{order.orderNumber || 'Order'}</strong>
                        <small>{order.userId?.name || order.userId?.email || 'Unknown customer'}</small>
                      </div>
                      <div>
                        <strong>{formatPrice(order.totalAmount || 0)}</strong>
                        <small>{order.status}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Low Stock</h2>
                <span>Products at 10 or below</span>
              </div>

              {products.filter((product) => Number(product.stock || 0) <= 10).length === 0 ? (
                <p className="admin-empty">No low-stock items right now.</p>
              ) : (
                <div className="admin-list">
                  {products
                    .filter((product) => Number(product.stock || 0) <= 10)
                    .slice(0, 6)
                    .map((product) => (
                      <div key={product._id} className="admin-list__row">
                        <div>
                          <strong>{product.name}</strong>
                          <small>{formatLabel(product.category || 'other')}</small>
                        </div>
                        <div>
                          <strong>{Number(product.stock || 0)} in stock</strong>
                          <small>{formatPrice(product.price || 0)}</small>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </article>
          </section>
        )}

        {activeTab === 'orders' && (
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <h2>Order Operations</h2>
              <span>Update status, payment state, and tracking number</span>
            </div>

            {orders.length === 0 ? (
              <p className="admin-empty">No orders found.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Tracking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong>{order.orderNumber || 'Order'}</strong>
                          <small>{new Date(order.createdAt).toLocaleString()}</small>
                        </td>
                        <td>
                          <div className="admin-table__stack">
                            <span>{order.userId?.name || 'Unknown'}</span>
                            <small>{order.userId?.email || ''}</small>
                          </div>
                        </td>
                        <td>{formatPrice(order.totalAmount || 0)}</td>
                        <td>
                          <select
                            value={orderDrafts[order._id]?.status || 'pending'}
                            onChange={(event) =>
                              handleOrderDraftChange(order._id, 'status', event.target.value)
                            }
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatLabel(status)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={orderDrafts[order._id]?.paymentStatus || 'pending'}
                            onChange={(event) =>
                              handleOrderDraftChange(order._id, 'paymentStatus', event.target.value)
                            }
                          >
                            {paymentStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {formatLabel(status)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={orderDrafts[order._id]?.trackingNumber || ''}
                            onChange={(event) =>
                              handleOrderDraftChange(order._id, 'trackingNumber', event.target.value)
                            }
                            placeholder="Tracking #"
                          />
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              type="button"
                              className="admin-table__action"
                              onClick={() => handleSaveOrder(order._id)}
                              disabled={orderSavingId === order._id}
                            >
                              {orderSavingId === order._id ? 'Saving...' : 'Save'}
                            </button>

                            <button
                              type="button"
                              className="admin-table__action is-danger"
                              onClick={() => handleDeleteOrder(order._id, order.orderNumber)}
                              disabled={orderDeletingId === order._id}
                            >
                              {orderDeletingId === order._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'products' && (
          <section className="admin-hub__panel-grid admin-hub__panel-grid--products">
            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>{editingProductId ? 'Edit Product' : 'Create Product'}</h2>
                <span>Full product CRUD is enabled</span>
              </div>

              <form className="admin-form" onSubmit={handleProductSubmit}>
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Short Description</span>
                  <input
                    type="text"
                    name="shortDescription"
                    value={productForm.shortDescription}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label className="admin-form__full">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFieldChange}
                    rows={4}
                    required
                  />
                </label>

                <label>
                  <span>Category</span>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFieldChange}
                  >
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {formatLabel(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Price (UGX)</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={productForm.price}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Wholesale Price (UGX)</span>
                  <input
                    type="number"
                    name="wholesalePrice"
                    min="0"
                    value={productForm.wholesalePrice}
                    onChange={handleProductFieldChange}
                  />
                </label>

                <label>
                  <span>ABV</span>
                  <input
                    type="number"
                    name="abv"
                    min="0"
                    value={productForm.abv}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Volume (ml)</span>
                  <input
                    type="number"
                    name="volume"
                    min="1"
                    value={productForm.volume}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Stock</span>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductFieldChange}
                    required
                  />
                </label>

                <label className="admin-form__toggle">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={handleProductFieldChange}
                  />
                  <span>Feature this product</span>
                </label>

                <label>
                  <span>Image URL</span>
                  <input
                    type="url"
                    name="imageUrl"
                    value={productForm.imageUrl}
                    onChange={handleProductFieldChange}
                    placeholder="https://..."
                  />
                </label>

                <label>
                  <span>Image Alt Text</span>
                  <input
                    type="text"
                    name="imageAlt"
                    value={productForm.imageAlt}
                    onChange={handleProductFieldChange}
                  />
                </label>

                <label className="admin-form__full">
                  <span>Ingredients (comma or new line separated)</span>
                  <textarea
                    name="ingredients"
                    value={productForm.ingredients}
                    onChange={handleProductFieldChange}
                    rows={2}
                  />
                </label>

                <label className="admin-form__full">
                  <span>Tasting Notes (comma or new line separated)</span>
                  <textarea
                    name="tastingNotes"
                    value={productForm.tastingNotes}
                    onChange={handleProductFieldChange}
                    rows={2}
                  />
                </label>

                <div className="admin-form__actions">
                  <button type="submit" disabled={productSubmitting}>
                    {productSubmitting
                      ? 'Saving...'
                      : editingProductId
                        ? 'Update Product'
                        : 'Create Product'}
                  </button>

                  {editingProductId && (
                    <button type="button" className="is-secondary" onClick={resetProductForm}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Catalog</h2>
                <span>{products.length} active products</span>
              </div>

              {products.length === 0 ? (
                <p className="admin-empty">No products found.</p>
              ) : (
                <div className="admin-cards">
                  {products.map((product) => (
                    <article key={product._id} className="admin-product-card">
                      <div className="admin-product-card__media">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                          />
                        ) : (
                          <div className="admin-product-card__placeholder">
                            <Package size={20} />
                          </div>
                        )}
                      </div>

                      <div className="admin-product-card__body">
                        <h3>{product.name}</h3>
                        <p>{formatLabel(product.category || 'other')}</p>
                        <strong>{formatPrice(product.price || 0)}</strong>
                        <small>{Number(product.stock || 0)} in stock</small>
                      </div>

                      <div className="admin-product-card__actions">
                        <button type="button" onClick={() => handleEditProduct(product)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          disabled={productDeletingId === product._id}
                        >
                          {productDeletingId === product._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        )}

        {activeTab === 'contacts' && (
          <section className="admin-panel">
            <div className="admin-panel__heading">
              <h2>Contact Requests</h2>
              <span>Messages and tour bookings</span>
            </div>

            {contacts.length === 0 ? (
              <p className="admin-empty">No contact requests yet.</p>
            ) : (
              <div className="admin-contact-list">
                {contacts.map((contact) => (
                  <article key={contact._id} className="admin-contact-card">
                    <header>
                      <div>
                        <strong>{contact.name}</strong>
                        <small>{new Date(contact.createdAt).toLocaleString()}</small>
                      </div>
                      <span className={`admin-contact-card__type is-${contact.requestType}`}>
                        {contact.requestType === 'tour' ? (
                          <>
                            <PhoneCall size={14} />
                            Tour
                          </>
                        ) : (
                          <>
                            <UserRound size={14} />
                            Contact
                          </>
                        )}
                      </span>
                    </header>

                    <div className="admin-contact-card__meta">
                      <span>{contact.email}</span>
                      {contact.phone && <span>{contact.phone}</span>}
                      {contact.subject && <span>{contact.subject}</span>}
                      {contact.requestType === 'tour' && (
                        <span>
                          {formatLabel(contact.tourType || 'tour')} | {contact.tourDate || 'No date'} |{' '}
                          {contact.tourTime || 'No time'} | Guests {contact.numberOfGuests || 1}
                        </span>
                      )}
                    </div>

                    {contact.message && <p>{contact.message}</p>}

                    <div className="admin-contact-card__controls">
                      <select
                        value={contactDrafts[contact._id]?.status || contact.status || 'new'}
                        onChange={(event) =>
                          handleContactDraftChange(contact._id, 'status', event.target.value)
                        }
                      >
                        {contactStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatLabel(status)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={contactDrafts[contact._id]?.adminNotes || ''}
                        onChange={(event) =>
                          handleContactDraftChange(contact._id, 'adminNotes', event.target.value)
                        }
                        placeholder="Admin note"
                      />

                      <button
                        type="button"
                        onClick={() => handleSaveContact(contact._id)}
                        disabled={contactSavingId === contact._id}
                      >
                        {contactSavingId === contact._id ? 'Saving...' : 'Save'}
                      </button>

                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => handleDeleteContact(contact._id)}
                        disabled={contactDeletingId === contact._id}
                      >
                        {contactDeletingId === contact._id ? (
                          'Deleting...'
                        ) : (
                          <>
                            <Trash2 size={14} />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <button type="button" className="admin-hub__floating-add" onClick={() => setActiveTab('products')}>
          <Plus size={16} />
          Add product
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
