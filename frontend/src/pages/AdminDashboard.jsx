import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  Image,
  Inbox,
  LineChart,
  Loader2,
  LogOut,
  Package,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatLabel, formatPrice } from '../utils/productPresentation';
import brandLogo from '../assets/logo muwas.jpg';

const orderStatusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['pending', 'paid', 'failed', 'refunded'];
const productCategories = ['gin', 'vodka', 'rum', 'whiskey', 'liqueur', 'other'];
const contactStatusOptions = ['new', 'in_progress', 'resolved'];

const adminNavigationItems = [
  { id: 'overview', label: 'Overview', hint: 'Global dashboard', icon: Home },
  { id: 'orders', label: 'Order Management', hint: 'Customer orders', icon: ShoppingCart },
  { id: 'products', label: 'Product Catalog', hint: 'Stock and pricing', icon: Store },
  { id: 'contacts', label: 'Requests', hint: 'Messages and tours', icon: Bell },
  { id: 'analytics', label: 'Reports & Analytics', hint: 'Business intelligence', icon: BarChart3 },
];

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
  imageUploadMethod: 'url', // 'url', 'upload', 'camera'
  uploadedImage: null,
  imagePreview: null,
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
  imageUploadMethod: 'url',
  uploadedImage: null,
  imagePreview: product.images?.[0]?.url || null,
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
  const uploadedImage = form.uploadedImage;
  const imageUploadMethod = form.imageUploadMethod;

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

  const resolvedImageUrl =
    imageUploadMethod === 'url'
      ? imageUrl
      : String(form.imagePreview || form.imageUrl || '').trim();

  if (resolvedImageUrl) {
    payload.images = [
      {
        url: resolvedImageUrl,
        alt: imageAlt || `${name} bottle`,
      },
    ];
  } else if (uploadedImage) {
    throw new Error('Image is still processing. Please wait a moment and save again.');
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

const countByValue = (items = [], getValue) =>
  items.reduce((counts, item) => {
    const value = getValue(item) || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});

const AdminDashboard = () => {
  const { api, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeInsight, setActiveInsight] = useState('orders');
  const [adminSearch, setAdminSearch] = useState('');
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
  const productImageInputRef = useRef(null);

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

  const searchQuery = adminSearch.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!searchQuery) {
      return orders;
    }

    return orders.filter((order) => {
      const searchable = [
        order.orderNumber,
        order.status,
        order.paymentStatus,
        order.trackingNumber,
        order.userId?.name,
        order.userId?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(searchQuery);
    });
  }, [orders, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.category,
        product.shortDescription,
        product.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(searchQuery);
    });
  }, [products, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return contacts;
    }

    return contacts.filter((contact) => {
      const searchable = [
        contact.name,
        contact.email,
        contact.phone,
        contact.subject,
        contact.message,
        contact.status,
        contact.requestType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(searchQuery);
    });
  }, [contacts, searchQuery]);

  const pendingRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.paymentStatus !== 'paid')
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    [orders]
  );

  const analyticsData = useMemo(() => {
    const orderStatusCounts = countByValue(orders, (order) => order.status || 'pending');
    const paymentStatusCounts = countByValue(orders, (order) => order.paymentStatus || 'pending');
    const productCategoryCounts = countByValue(products, (product) => product.category || 'other');
    const contactStatusCounts = countByValue(contacts, (contact) => contact.status || 'new');

    const buildBars = (counts) =>
      Object.entries(counts)
        .sort(([, first], [, second]) => second - first)
        .map(([label, value]) => ({ label: formatLabel(label), value }));

    if (activeInsight === 'revenue') {
      return {
        title: 'Revenue Analytics',
        icon: Wallet,
        value: formatPrice(totalRevenue),
        subtitle: `${formatPrice(pendingRevenue)} still awaiting payment`,
        bars: buildBars(paymentStatusCounts),
        actionLabel: 'Manage Orders',
        actionTab: 'orders',
      };
    }

    if (activeInsight === 'products') {
      return {
        title: 'Catalog Analytics',
        icon: Package,
        value: products.length.toLocaleString(),
        subtitle: `${lowStockProductsCount} products need stock attention`,
        bars: buildBars(productCategoryCounts),
        actionLabel: 'Open Catalog',
        actionTab: 'products',
      };
    }

    if (activeInsight === 'contacts') {
      return {
        title: 'Request Analytics',
        icon: Inbox,
        value: contacts.length.toLocaleString(),
        subtitle: `${unresolvedContactsCount} requests are unresolved`,
        bars: buildBars(contactStatusCounts),
        actionLabel: 'Review Requests',
        actionTab: 'contacts',
      };
    }

    return {
      title: 'Order Analytics',
      icon: ShoppingCart,
      value: orders.length.toLocaleString(),
      subtitle: `${pendingOrdersCount} orders are awaiting processing`,
      bars: buildBars(orderStatusCounts),
      actionLabel: 'Manage Orders',
      actionTab: 'orders',
    };
  }, [
    activeInsight,
    contacts,
    lowStockProductsCount,
    orders,
    pendingOrdersCount,
    pendingRevenue,
    products,
    totalRevenue,
    unresolvedContactsCount,
  ]);

  const analyticsMaxValue = Math.max(...analyticsData.bars.map((bar) => bar.value), 1);

  const handleSectionChange = (sectionId) => {
    setActiveTab(sectionId);
  };

  const handleMetricSelect = (insightId) => {
    setActiveInsight(insightId);
    setActiveTab('analytics');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProductFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUploadMethodChange = (method) => {
    setProductForm((current) => ({
      ...current,
      imageUploadMethod: method,
      imageUrl: method === 'url' ? current.imageUrl : '',
      uploadedImage: null,
      imagePreview: method === 'url' && current.imageUrl ? current.imageUrl : null,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        pushNotice('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        pushNotice('Image size should be less than 5MB', 'error');
        return;
      }

      setProductForm((current) => ({
        ...current,
        uploadedImage: file,
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setProductForm((current) => ({
          ...current,
          imageUrl: dataUrl,
          imagePreview: dataUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Create input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleImageUpload;
    input.click();
  };

  const removeProductImage = () => {
    setProductForm((current) => ({
      ...current,
      uploadedImage: null,
      imagePreview: null,
      imageUrl: '',
    }));
    if (productImageInputRef.current) {
      productImageInputRef.current.value = '';
    }
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
      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label="Admin dashboard navigation">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__mark" aria-hidden="true">
              <img src={brandLogo} alt="" />
            </div>
            <div>
              <strong>MUWAS</strong>
              <span>Admin Dashboard</span>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            {adminNavigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'is-active' : ''}
                onClick={() => handleSectionChange(item.id)}
              >
                <span className="admin-sidebar__icon">
                  {React.createElement(item.icon, { size: 17, strokeWidth: 1.8 })}
                </span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
                <ChevronRight size={15} strokeWidth={1.8} />
              </button>
            ))}
          </nav>

          <div className="admin-sidebar__panel">
            <p>Operations</p>
            <strong>{orders.length + products.length + contacts.length}</strong>
            <span>live records loaded</span>
          </div>

          <div className="admin-sidebar__actions">
            <button
              type="button"
              onClick={() => fetchDashboardData({ silent: false })}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'is-spin' : ''} />
              {refreshing ? 'Syncing' : 'Sync data'}
            </button>
            <button type="button" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <div className="admin-hub__inner">
        <section className="admin-hub__hero">
          <div>
            <p className="admin-hub__eyebrow">Admin Control Center</p>
            <h1>Welcome back, {user?.name || 'Admin'}.</h1>
            <span>Manage catalog, orders, and contact requests from one place.</span>
          </div>

          <div className="admin-hub__toolbar">
            <label className="admin-hub__search">
              <Search size={17} strokeWidth={1.8} />
              <input
                type="search"
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
                placeholder="Search dashboard..."
              />
            </label>

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
          </div>
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
          <button
            type="button"
            className={activeInsight === 'orders' ? 'is-active' : ''}
            onClick={() => handleMetricSelect('orders')}
          >
            <span>
              <ShoppingCart size={18} />
              Total orders
            </span>
            <strong>{orders.length}</strong>
            <small>{pendingOrdersCount} awaiting processing</small>
          </button>

          <button
            type="button"
            className={activeInsight === 'revenue' ? 'is-active' : ''}
            onClick={() => handleMetricSelect('revenue')}
          >
            <span>
              <Wallet size={18} />
              Revenue
            </span>
            <strong>{formatPrice(totalRevenue)}</strong>
            <small>Paid orders only</small>
          </button>

          <button
            type="button"
            className={activeInsight === 'products' ? 'is-active' : ''}
            onClick={() => handleMetricSelect('products')}
          >
            <span>
              <Package size={18} />
              Products
            </span>
            <strong>{products.length}</strong>
            <small>{lowStockProductsCount} low stock alerts</small>
          </button>

          <button
            type="button"
            className={activeInsight === 'contacts' ? 'is-active' : ''}
            onClick={() => handleMetricSelect('contacts')}
          >
            <span>
              <Inbox size={18} />
              Contact requests
            </span>
            <strong>{contacts.length}</strong>
            <small>{unresolvedContactsCount} unresolved</small>
          </button>
        </section>

        <nav className="admin-hub__tabs" aria-label="Dashboard sections">
          {adminNavigationItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSectionChange(tab.id)}
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
                <button type="button" onClick={() => handleSectionChange('orders')}>
                  View all
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <p className="admin-empty">No orders available yet.</p>
              ) : (
                <div className="admin-list">
                  {filteredOrders.slice(0, 6).map((order) => (
                    <div key={order._id} className="admin-list__row">
                      <div>
                        <strong>{order.orderNumber || 'Order'}</strong>
                        <small>{order.userId?.name || order.userId?.email || 'Unknown customer'}</small>
                      </div>
                      <div>
                        <strong>{formatPrice(order.totalAmount || 0)}</strong>
                        <small>{order.status}</small>
                      </div>
                      <button type="button" onClick={() => handleSectionChange('orders')}>
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Low Stock</h2>
                <button type="button" onClick={() => handleMetricSelect('products')}>
                  Analyze
                </button>
              </div>

              {filteredProducts.filter((product) => Number(product.stock || 0) <= 10).length === 0 ? (
                <p className="admin-empty">No low-stock items right now.</p>
              ) : (
                <div className="admin-list">
                  {filteredProducts
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
                        <button type="button" onClick={() => handleEditProduct(product)}>
                          Edit
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </article>

            <article className="admin-panel admin-analytics-card">
              <div className="admin-panel__heading">
                <h2>Live Analytics</h2>
                <button type="button" onClick={() => handleSectionChange('analytics')}>
                  Open report
                </button>
              </div>

              <div className="admin-analytics-card__summary">
                <span>{React.createElement(analyticsData.icon, { size: 20 })}</span>
                <div>
                  <strong>{analyticsData.value}</strong>
                  <small>{analyticsData.title}</small>
                </div>
              </div>

              <div className="admin-analytics-bars">
                {analyticsData.bars.slice(0, 5).map((bar) => (
                  <button
                    key={bar.label}
                    type="button"
                    onClick={() => handleSectionChange(analyticsData.actionTab)}
                  >
                    <span>{bar.label}</span>
                    <strong>{bar.value}</strong>
                    <em style={{ width: `${Math.max(8, (bar.value / analyticsMaxValue) * 100)}%` }} />
                  </button>
                ))}
              </div>
            </article>

            <article className="admin-panel">
              <div className="admin-panel__heading">
                <h2>Requests</h2>
                <button type="button" onClick={() => handleSectionChange('contacts')}>
                  Review
                </button>
              </div>

              {filteredContacts.length === 0 ? (
                <p className="admin-empty">No contact requests yet.</p>
              ) : (
                <div className="admin-list">
                  {filteredContacts.slice(0, 5).map((contact) => (
                    <div key={contact._id} className="admin-list__row">
                      <div>
                        <strong>{contact.name}</strong>
                        <small>{contact.email}</small>
                      </div>
                      <div>
                        <strong>{formatLabel(contact.status || 'new')}</strong>
                        <small>{formatLabel(contact.requestType || 'contact')}</small>
                      </div>
                      <button type="button" onClick={() => handleSectionChange('contacts')}>
                        Open
                      </button>
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

            {filteredOrders.length === 0 ? (
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
                    {filteredOrders.map((order) => (
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

                <div className="admin-form__image-upload">
                  <span>Product Image</span>
                  
                  {/* Upload Method Selection */}
                  <div className="admin-image-methods">
                    <button
                      type="button"
                      className={`admin-image-method ${productForm.imageUploadMethod === 'url' ? 'is-active' : ''}`}
                      onClick={() => handleImageUploadMethodChange('url')}
                    >
                      <Image size={16} strokeWidth={1.8} />
                      URL
                    </button>
                    <button
                      type="button"
                      className={`admin-image-method ${productForm.imageUploadMethod === 'upload' ? 'is-active' : ''}`}
                      onClick={() => handleImageUploadMethodChange('upload')}
                    >
                      <Upload size={16} strokeWidth={1.8} />
                      Upload
                    </button>
                    <button
                      type="button"
                      className={`admin-image-method ${productForm.imageUploadMethod === 'camera' ? 'is-active' : ''}`}
                      onClick={() => handleImageUploadMethodChange('camera')}
                    >
                      <Camera size={16} strokeWidth={1.8} />
                      Camera
                    </button>
                  </div>

                  {/* URL Input */}
                  {productForm.imageUploadMethod === 'url' && (
                    <div className="admin-image-url">
                      <input
                        type="url"
                        name="imageUrl"
                        value={productForm.imageUrl}
                        onChange={handleProductFieldChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {productForm.imageUploadMethod === 'upload' && (
                    <div className="admin-image-file">
                      <input
                        ref={productImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => productImageInputRef.current?.click()}
                        className="admin-image-upload-btn"
                      >
                        <Upload size={16} strokeWidth={1.8} />
                        Choose Image File
                      </button>
                    </div>
                  )}

                  {/* Camera Capture */}
                  {productForm.imageUploadMethod === 'camera' && (
                    <div className="admin-image-camera">
                      <button
                        type="button"
                        onClick={handleCameraCapture}
                        className="admin-image-camera-btn"
                      >
                        <Camera size={16} strokeWidth={1.8} />
                        Take Photo
                      </button>
                    </div>
                  )}

                  {/* Image Preview */}
                  {productForm.imagePreview && (
                    <div className="admin-image-preview">
                      <div className="admin-image-preview__container">
                        <img
                          src={productForm.imagePreview}
                          alt="Product preview"
                          className="admin-image-preview__img"
                        />
                        <button
                          type="button"
                          onClick={removeProductImage}
                          className="admin-image-preview__remove"
                        >
                          <X size={14} strokeWidth={1.8} />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
                <span>{filteredProducts.length} active products</span>
              </div>

              {filteredProducts.length === 0 ? (
                <p className="admin-empty">No products found.</p>
              ) : (
                <div className="admin-cards">
                  {filteredProducts.map((product) => (
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
    </div>
  );
};

export default AdminDashboard;
