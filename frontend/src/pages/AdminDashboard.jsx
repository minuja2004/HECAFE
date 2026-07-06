import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    id: '', name: '', image: '', price: '', description: '', category: 'Birthday Cakes', stock: 'Made to Order', status: 'Active'
  });
  const [productUploadLoading, setProductUploadLoading] = useState(false);
  const [productImageSource, setProductImageSource] = useState('url'); // 'url' or 'upload'

  const [flyerModalOpen, setFlyerModalOpen] = useState(false);
  const [flyerForm, setFlyerForm] = useState({
    id: '', title: '', subtitle: '', emoji: '', gradient: 'linear-gradient(135deg,#D31F1B,#8B0000)', status: 'Active'
  });
  const [flyerIconType, setFlyerIconType] = useState('emoji'); // 'emoji', 'url', 'upload'
  const [flyerUploadLoading, setFlyerUploadLoading] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '', name: '', image: ''
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'upload'

  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Chat polling
  useEffect(() => {
    let interval;
    if (selectedOrder && orderDetailModalOpen) {
      fetchChatMessages();
      interval = setInterval(fetchChatMessages, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedOrder, orderDetailModalOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Always load categories (public endpoint) independently
      const categoriesRes = await axios.get('http://localhost:5000/api/categories');
      setCategories(categoriesRes.data);

      // Admin-only endpoints - use allSettled so one failure doesn't block the rest
      const [ordersRes, productsRes, flyersRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/orders'),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/flyers/admin'),
      ]);

      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data);
      if (flyersRes.status === 'fulfilled') setFlyers(flyersRes.value.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  // Always load categories on mount (for product form dropdown even if not yet admin)
  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchChatMessages = async () => {
    if (!selectedOrder) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${selectedOrder.orderId}`);
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status });
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setChatMessages([]);
    setOrderDetailModalOpen(true);
  };

  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedOrder) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/chat/${selectedOrder.orderId}`, { text: adminChatInput });
      setChatMessages(prev => [...prev, res.data]);
      setAdminChatInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // Product CRUD Handlers
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setProductForm({
        id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        status: product.status
      });
      if (product.image && product.image.startsWith('/uploads')) {
        setProductImageSource('upload');
      } else {
        setProductImageSource('url');
      }
    } else {
      setProductForm({
        id: '', name: '', image: '', price: '', description: '', category: 'Birthday Cakes', stock: 'Made to Order', status: 'Active'
      });
      setProductImageSource('url');
    }
    setProductModalOpen(true);
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setProductUploadLoading(true);
      const res = await axios.post('http://localhost:5000/api/categories/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({ ...prev, image: res.data.imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setProductUploadLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (productForm.id) {
        // Edit
        await axios.put(`http://localhost:5000/api/products/${productForm.id}`, productForm);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/products', productForm);
      }
      setProductModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error('Save product error:', err.response?.data || err.message);
      // 401 is handled by the global interceptor (auto-logout), skip alert
      if (err.response?.status !== 401) {
        alert(err.response?.data?.message || 'Error saving product. Check the console for details.');
      }
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${prodId}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error deleting product.');
    }
  };

  // Flyer CRUD Handlers
  const handleOpenFlyerModal = (flyer = null) => {
    if (flyer) {
      setFlyerForm({
        id: flyer._id,
        title: flyer.title,
        subtitle: flyer.subtitle,
        emoji: flyer.emoji,
        gradient: flyer.gradient,
        status: flyer.status
      });
      if (flyer.emoji.startsWith('http://') || flyer.emoji.startsWith('https://')) {
        setFlyerIconType('url');
      } else if (flyer.emoji.startsWith('/uploads/')) {
        setFlyerIconType('upload');
      } else {
        setFlyerIconType('emoji');
      }
    } else {
      setFlyerForm({
        id: '', title: '', subtitle: '', emoji: '', gradient: 'linear-gradient(135deg,#D31F1B,#8B0000)', status: 'Active'
      });
      setFlyerIconType('emoji');
    }
    setFlyerModalOpen(true);
  };

  const handleFlyerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setFlyerUploadLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/flyers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFlyerForm(prev => ({ ...prev, emoji: res.data.imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      setFlyerUploadLoading(false);
    }
  };

  const handleSaveFlyer = async (e) => {
    e.preventDefault();
    try {
      if (flyerForm.id) {
        await axios.put(`http://localhost:5000/api/flyers/${flyerForm.id}`, flyerForm);
      } else {
        await axios.post('http://localhost:5000/api/flyers', flyerForm);
      }
      setFlyerModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error saving flyer.');
    }
  };

  const handleDeleteFlyer = async (flyerId) => {
    if (!window.confirm('Are you sure you want to delete this flyer?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/flyers/${flyerId}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error deleting flyer.');
    }
  };

  const handleBroadcastFlyer = async (flyerId) => {
    try {
      await axios.post(`http://localhost:5000/api/flyers/broadcast/${flyerId}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error broadcasting flyer.');
    }
  };

  // Category CRUD Handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({
        id: category._id,
        name: category.name,
        image: category.image
      });
      if (category.image && category.image.startsWith('/uploads')) {
        setImageSource('upload');
      } else {
        setImageSource('url');
      }
    } else {
      setCategoryForm({
        id: '', name: '', image: ''
      });
      setImageSource('url');
    }
    setCategoryModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadLoading(true);
      const res = await axios.post('http://localhost:5000/api/categories/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setCategoryForm(prev => ({ ...prev, image: res.data.imageUrl }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (categoryForm.id) {
        // Edit
        await axios.put(`http://localhost:5000/api/categories/${categoryForm.id}`, categoryForm);
      } else {
        // Create
        await axios.post('http://localhost:5000/api/categories', categoryForm);
      }
      setCategoryModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will delete the category but not the products under it.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/categories/${catId}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Error deleting category.');
    }
  };

  // Derived calculations
  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const activeCustomersCount = [...new Set(orders.map(o => o.phone))].length;

  // Customer Management Aggregator
  const getCustomerProfiles = () => {
    const customerProfiles = {};
    orders.forEach(o => {
      const key = o.phone;
      if (!customerProfiles[key]) {
        customerProfiles[key] = {
          name: o.customerName,
          email: o.email,
          phone: o.phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: o.date
        };
      }
      customerProfiles[key].totalOrders += 1;
      if (o.status !== 'Cancelled') {
        customerProfiles[key].totalSpent += o.total;
      }
      customerProfiles[key].lastOrderDate = o.date;
    });
    return Object.values(customerProfiles);
  };

  // Filter orders lists
  let filteredOrders = [...orders];
  if (orderFilter !== 'All') {
    filteredOrders = filteredOrders.filter(o => o.status === orderFilter);
  }
  if (orderSearch.trim() !== '') {
    const s = orderSearch.toLowerCase();
    filteredOrders = filteredOrders.filter(o => o.orderId.toLowerCase().includes(s) || o.customerName.toLowerCase().includes(s));
  }

  if (loading) return <div style={{ padding: '64px', textAlign: 'center' }}>Loading Admin Panel...</div>;

  return (
    <div id="page-admin" className="page">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #333' }}>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>HE Cafe</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>Admin Dashboard</div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>MAIN</h4>
            <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</a>
            <a className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📦 Orders</a>
            <a className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>👥 Customers</a>
            <a className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>🎂 Products</a>
            <a className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>🏷️ Categories</a>
            <a className={activeTab === 'flyers' ? 'active' : ''} onClick={() => setActiveTab('flyers')}>🖼 Flyers & Offers</a>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>SETTINGS</h4>
            <a onClick={() => navigate('/')} style={{ color: 'var(--red)' }}>← Back to Store</a>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="admin-dashboard" className="admin-main">
            <h2>Dashboard Overview</h2>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="val">{orders.length}</div>
                <div className="lbl">Total Orders</div>
              </div>
              <div className="stat-card">
                <div className="val">Rs. {totalRevenue.toLocaleString()}</div>
                <div className="lbl">Total Revenue</div>
              </div>
              <div className="stat-card">
                <div className="val">{activeCustomersCount}</div>
                <div className="lbl">Active Customers</div>
              </div>
              <div className="stat-card">
                <div className="val">{products.length}</div>
                <div className="lbl">Products Listed</div>
              </div>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o._id}>
                      <td><strong>#{o.orderId}</strong></td>
                      <td>{o.customerName}</td>
                      <td>{o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                      <td><strong style={{ color: 'var(--red)' }}>Rs. {o.total.toLocaleString()}</strong></td>
                      <td><span className={`status-badge status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                      <td>{new Date(o.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div id="admin-orders" className="admin-main">
            <h2>Manage Orders</h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <select 
                value={orderFilter} 
                onChange={(e) => setOrderFilter(e.target.value)} 
                style={{ padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px' }}
              >
                <option value="All">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="text"
                placeholder="Search by order ID or customer..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                style={{ flex: 1, padding: '9px 14px', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o._id}>
                      <td><strong>#{o.orderId}</strong></td>
                      <td>{o.customerName}</td>
                      <td>{o.phone}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td><strong style={{ color: 'var(--red)' }}>Rs. {o.total.toLocaleString()}</strong></td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          style={{ border: '1px solid var(--border)', background: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          style={{ background: 'var(--black)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                          onClick={() => handleOpenOrderDetail(o)}
                        >
                          View & Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div id="admin-customers" className="admin-main">
            <h2>Customer Profiles</h2>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {getCustomerProfiles().map((c, index) => (
                    <tr key={index}>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.totalOrders}</td>
                      <td><strong style={{ color: 'var(--red)' }}>Rs. {c.totalSpent.toLocaleString()}</strong></td>
                      <td>{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div id="admin-products" className="admin-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Product Management</h2>
              <button 
                style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => handleOpenProductModal()}
              >
                + Add Product
              </button>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {p.image ? (
                          <img src={p.image.startsWith('/uploads') ? `http://localhost:5000${p.image}` : p.image} alt={p.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                        ) : (
                          <span style={{ fontSize: '22px' }}>🍰</span>
                        )}
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.category}</td>
                      <td><strong style={{ color: 'var(--red)' }}>Rs. {p.price.toLocaleString()}</strong></td>
                      <td>{p.stock}</td>
                      <td><span className="status-badge status-delivered">{p.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            style={{ background: 'var(--black)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                            onClick={() => handleOpenProductModal(p)}
                          >
                            Edit
                          </button>
                          <button 
                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div id="admin-categories" className="admin-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Category Management</h2>
              <button 
                style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => handleOpenCategoryModal()}
              >
                + Add Category
              </button>
            </div>
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c._id}>
                      <td>
                        {c.image ? (
                          <img 
                            src={c.image.startsWith('/uploads') ? `http://localhost:5000${c.image}` : c.image} 
                            alt={c.name} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                          />
                        ) : (
                          '🍰'
                        )}
                      </td>
                      <td><strong>{c.name}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            style={{ background: 'var(--black)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                            onClick={() => handleOpenCategoryModal(c)}
                          >
                            Edit
                          </button>
                          <button 
                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                            onClick={() => handleDeleteCategory(c._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Flyers Tab */}
        {activeTab === 'flyers' && (
          <div id="admin-flyers" className="admin-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Flyers & Offers</h2>
              <button 
                style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => handleOpenFlyerModal()}
              >
                + Upload Flyer
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {flyers.map(f => (
                <div key={f._id} style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.08)', border: f.isBroadcast ? '2px solid var(--red)' : '2px solid transparent' }}>
                  <div style={{ 
                    height: '160px', 
                    background: f.emoji.startsWith('/') || f.emoji.startsWith('http')
                      ? `url(${f.emoji.startsWith('/') ? `http://localhost:5000${f.emoji}` : f.emoji}) no-repeat center center / cover`
                      : f.gradient, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff', 
                    gap: '8px', 
                    padding: '10px' 
                  }}>
                    {!(f.emoji.startsWith('/') || f.emoji.startsWith('http')) && (
                      <>
                        <div style={{ fontSize: '36px' }}>{f.emoji}</div>
                        <div style={{ fontWeight: '900', fontSize: '16px' }}>{f.title}</div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>{f.subtitle}</div>
                      </>
                    )}
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{f.status}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                          onClick={() => handleBroadcastFlyer(f._id)}
                          disabled={f.isBroadcast}
                        >
                          {f.isBroadcast ? 'Broadcasted' : 'Broadcast'}
                        </button>
                        <button 
                          style={{ background: 'var(--black)', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer' }}
                          onClick={() => handleOpenFlyerModal(f)}
                        >
                          Edit
                        </button>
                        <button 
                          style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '8px', fontSize: '10px', cursor: 'pointer' }}
                          onClick={() => handleDeleteFlyer(f._id)}
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT ADD/EDIT MODAL */}
      {productModalOpen && (
        <div className="modal-backdrop show">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setProductModalOpen(false)}>×</button>
            <div className="modal-header">
              <h3>{productForm.id ? 'Edit Product Details' : 'Add New Product'}</h3>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat._id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input 
                    type="number" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              {/* Image Source Toggle */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Product Image *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--black)' }}>
                    <input type="radio" name="productImageSource" value="url" checked={productImageSource === 'url'} onChange={() => setProductImageSource('url')} />
                    Image URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--black)' }}>
                    <input type="radio" name="productImageSource" value="upload" checked={productImageSource === 'upload'} onChange={() => setProductImageSource('upload')} />
                    Local Upload
                  </label>
                </div>
              </div>
              {productImageSource === 'url' ? (
                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    required={productImageSource === 'url'}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload Image File *</label>
                  <input type="file" accept="image/*" onChange={handleProductImageUpload} required={productImageSource === 'upload' && !productForm.image} />
                  {productUploadLoading && <span style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '4px', display: 'block' }}>Uploading...</span>}
                </div>
              )}
              {productForm.image && (
                <div className="form-group" style={{ marginTop: '8px' }}>
                  <label>Image Preview</label>
                  <div style={{ marginTop: '6px' }}>
                    <img src={productForm.image.startsWith('/uploads') ? `http://localhost:5000${productForm.image}` : productForm.image} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--border)' }} />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label>Stock Status *</label>
                <select
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                >
                  <option>Made to Order</option>
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} 
                  style={{ height: '60px' }} 
                  required
                />
              </div>
              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* FLYER ADD/EDIT MODAL */}
      {flyerModalOpen && (
        <div className="modal-backdrop show">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setFlyerModalOpen(false)}>×</button>
            <div className="modal-header">
              <h3>{flyerForm.id ? 'Edit Promotional Flyer' : 'Upload Promotional Flyer'}</h3>
            </div>
            <form onSubmit={handleSaveFlyer}>
              <div className="form-group">
                <label>Flyer Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. BIRTHDAY SPECIAL" 
                  value={flyerForm.title} 
                  onChange={(e) => setFlyerForm({ ...flyerForm, title: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Subtitle/Offer Text *</label>
                <input 
                  type="text" 
                  placeholder="e.g. 20% OFF this weekend" 
                  value={flyerForm.subtitle} 
                  onChange={(e) => setFlyerForm({ ...flyerForm, subtitle: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Icon / Image Type</label>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="radio" 
                      name="flyerIconType" 
                      value="emoji" 
                      checked={flyerIconType === 'emoji'} 
                      onChange={() => { setFlyerIconType('emoji'); setFlyerForm({ ...flyerForm, emoji: '' }); }} 
                    /> Emoji
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="radio" 
                      name="flyerIconType" 
                      value="url" 
                      checked={flyerIconType === 'url'} 
                      onChange={() => { setFlyerIconType('url'); setFlyerForm({ ...flyerForm, emoji: '' }); }} 
                    /> Image URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                    <input 
                      type="radio" 
                      name="flyerIconType" 
                      value="upload" 
                      checked={flyerIconType === 'upload'} 
                      onChange={() => { setFlyerIconType('upload'); setFlyerForm({ ...flyerForm, emoji: '' }); }} 
                    /> Upload File
                  </label>
                </div>
              </div>

              <div className="form-row">
                {flyerIconType === 'emoji' && (
                  <div className="form-group">
                    <label>Emoji Icon *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 🎂" 
                      value={flyerForm.emoji} 
                      onChange={(e) => setFlyerForm({ ...flyerForm, emoji: e.target.value })} 
                      required 
                    />
                  </div>
                )}
                {flyerIconType === 'url' && (
                  <div className="form-group">
                    <label>Image URL *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://example.com/image.png" 
                      value={flyerForm.emoji} 
                      onChange={(e) => setFlyerForm({ ...flyerForm, emoji: e.target.value })} 
                      required 
                    />
                  </div>
                )}
                {flyerIconType === 'upload' && (
                  <div className="form-group">
                    <label>Upload Image *</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFlyerImageUpload}
                        required={!flyerForm.emoji}
                      />
                      {flyerUploadLoading && <span style={{ fontSize: '12px', color: 'var(--gray)' }}>Uploading...</span>}
                    </div>
                    {flyerForm.emoji && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: 'green', wordBreak: 'break-all' }}>
                        Uploaded: {flyerForm.emoji}
                      </div>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label>Theme Gradient</label>
                  <select 
                    value={flyerForm.gradient} 
                    onChange={(e) => setFlyerForm({ ...flyerForm, gradient: e.target.value })}
                  >
                    <option value="linear-gradient(135deg,#D31F1B,#8B0000)">Red Velvet (Red)</option>
                    <option value="linear-gradient(135deg,#1D1D1D,#444)">Dark Chocolate (Black)</option>
                    <option value="linear-gradient(135deg,#FF69B4,#FF1493)">Sweet Strawberry (Pink)</option>
                    <option value="linear-gradient(135deg,#FFA500,#FF8C00)">Caramel Honey (Orange)</option>
                    <option value="linear-gradient(135deg,#20B2AA,#008B8B)">Mint Fresh (Teal)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Save Flyer</button>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAIL & CUSTOMER CHAT MODAL */}
      {orderDetailModalOpen && selectedOrder && (
        <div className="modal-backdrop show">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setOrderDetailModalOpen(false)}>×</button>
            <div className="modal-header">
              <h3>Order Details & Customer Chat</h3>
            </div>
            <div style={{ fontSize: '13.5px', maxHeight: '200px', overflowY: 'auto', background: 'var(--offwhite)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <div><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.phone})</div>
              <div><strong>Delivery Address:</strong> {selectedOrder.address}</div>
              <div><strong>Order Date:</strong> {new Date(selectedOrder.date).toLocaleString()}</div>
              
              <div style={{ marginTop: '12px', fontWeight: '700', borderBottom: '1.5px solid var(--border)', paddingBottom: '4px' }}>Ordered Items:</div>
              {selectedOrder.items.map((i, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dashed #eee' }}>
                  <span>{i.emoji} {i.name} (x{i.quantity})</span>
                  <span>Rs. {(i.price * i.quantity).toLocaleString()}</span>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontWeight: '700', color: 'var(--red)' }}>
                <span>Grand Total:</span>
                <span>Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>

              {selectedOrder.type === 'Custom' && selectedOrder.customDetails && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1.5px solid var(--border)', color: 'var(--gray)' }}>
                  <strong style={{ color: 'var(--black)' }}>Customization Specs:</strong>
                  <div style={{ marginTop: '4px' }}>Cake Type: {selectedOrder.customDetails.cakeType}</div>
                  <div>Size: {selectedOrder.customDetails.size}</div>
                  <div>Flavour: {selectedOrder.customDetails.flavour}</div>
                  <div>Frosting: {selectedOrder.customDetails.frosting}</div>
                  <div>Message: "{selectedOrder.customDetails.message}"</div>
                  <div>Requested Date: {selectedOrder.customDetails.deliveryDate}</div>
                  <div>Special Instructions: {selectedOrder.customDetails.specialRequests || 'None'}</div>
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '13.5px', fontWeight: '700' }}>Customer Contact Chat</h4>
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map((m, index) => (
                  <div key={m._id || index} className={`chat-bubble ${m.sender === 'admin' ? 'customer' : 'admin'}`}>
                    <div><strong>{m.sender === 'admin' ? 'Admin' : 'Customer'}:</strong> {m.text}</div>
                    <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendAdminMessage} className="chat-input-row">
                <input
                  type="text"
                  placeholder="Type a message to the customer..."
                  value={adminChatInput}
                  onChange={(e) => setAdminChatInput(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY ADD/EDIT MODAL */}
      {categoryModalOpen && (
        <div className="modal-backdrop show">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setCategoryModalOpen(false)}>×</button>
            <div className="modal-header">
              <h3>{categoryForm.id ? 'Edit Category' : 'Add Category'}</h3>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input 
                  type="text" 
                  value={categoryForm.name} 
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Image Source *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--black)' }}>
                    <input 
                      type="radio" 
                      name="imageSource" 
                      value="url" 
                      checked={imageSource === 'url'} 
                      onChange={() => setImageSource('url')} 
                    />
                    Image URL
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--black)' }}>
                    <input 
                      type="radio" 
                      name="imageSource" 
                      value="upload" 
                      checked={imageSource === 'upload'} 
                      onChange={() => setImageSource('upload')} 
                    />
                    Local Upload
                  </label>
                </div>
              </div>

              {imageSource === 'url' ? (
                <div className="form-group">
                  <label>Image URL *</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    value={categoryForm.image} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} 
                    required={imageSource === 'url'}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Upload Image File *</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    required={imageSource === 'upload' && !categoryForm.image}
                  />
                  {uploadLoading && <span style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '4px', display: 'block' }}>Uploading...</span>}
                </div>
              )}

              {categoryForm.image && (
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Image Preview</label>
                  <div style={{ marginTop: '6px' }}>
                    <img 
                      src={categoryForm.image.startsWith('/uploads') ? `http://localhost:5000${categoryForm.image}` : categoryForm.image} 
                      alt="Category Preview" 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--border)' }} 
                    />
                  </div>
                </div>
              )}
              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Save Category</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
