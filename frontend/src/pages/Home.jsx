import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const Home = ({ onCategorySelect }) => {
  const [products, setProducts] = useState([]);
  const [broadcastFlyer, setBroadcastFlyer] = useState(null);
  const { quickAddToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const activeProducts = prodRes.data.filter(p => p.status === 'Active');
      setProducts(activeProducts.slice(0, 4));

      const flyerRes = await axios.get('http://localhost:5000/api/flyers');
      const broadcast = flyerRes.data.find(f => f.isBroadcast);
      setBroadcastFlyer(broadcast);
    } catch (err) {
      console.error('Error fetching home details', err);
    }
  };

  const handleCategoryClick = (catName) => {
    if (onCategorySelect) {
      onCategorySelect(catName);
    }
    navigate(`/products?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div id="page-home" className="page active">
      {/* Broadcast Banner */}
      {broadcastFlyer && (
        <div className="broadcast-banner" style={{ background: broadcastFlyer.gradient }}>
          <span>{broadcastFlyer.emoji} {broadcastFlyer.title} — {broadcastFlyer.subtitle}</span>
          <button onClick={() => navigate('/products')}>Grab Offer</button>
        </div>
      )}

      {/* HERO */}
      <div className="hero">
        <div className="hero-copy">
          <div className="hero-tag">FRESHLY BAKED • SAME DAY DELIVERY</div>
          <h1>Custom Cakes &<br />Bakery Favourites,<br /><span>Made With Love</span></h1>
          <p>Order birthday cakes, cupcakes, pastries, and all your baking essentials from HE Cafe — Sri Lanka's home of handcrafted sweetness.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => navigate('/products')}>Shop Cakes</button>
            <button className="btn-outline" onClick={() => navigate('/custom-order')}>Custom Order</button>
          </div>
        </div>
        <div className="hero-img">
          <div className="hero-img-inner">
            <div className="hero-cake-emoji">🎂</div>
            <div className="hero-cake-label">Handcrafted with love</div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="cat-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <a onClick={() => navigate('/products')}>View All →</a>
        </div>
        <div className="cat-grid">
          <div className="cat-card" onClick={() => handleCategoryClick('Birthday Cakes')}><div className="cat-icon">🎂</div><p>Birthday Cakes</p></div>
          <div className="cat-card" onClick={() => handleCategoryClick('Wedding Cakes')}><div className="cat-icon">💍</div><p>Wedding Cakes</p></div>
          <div className="cat-card" onClick={() => handleCategoryClick('Cupcakes')}><div className="cat-icon">🧁</div><p>Cupcakes</p></div>
          <div className="cat-card" onClick={() => handleCategoryClick('Pastries')}><div className="cat-icon">🥐</div><p>Pastries</p></div>
          <div className="cat-card" onClick={() => handleCategoryClick('Baking Tools')}><div className="cat-icon">🍰</div><p>Baking Tools</p></div>
          <div className="cat-card" onClick={() => handleCategoryClick('Ingredients')}><div className="cat-icon">🌾</div><p>Ingredients</p></div>
        </div>
      </div>

      {/* BESTSELLERS */}
      <div className="prod-section">
        <div className="section-header">
          <h2>Best Selling Cakes</h2>
          <a onClick={() => navigate('/products')}>View All →</a>
        </div>
        <div className="prod-grid">
          {products.map(p => (
            <div key={p._id} className="prod-card" onClick={() => navigate(`/product/${p._id}`)}>
              <div className="prod-img">
                {p.emoji}
                <div className="prod-badge">{p.stock === 'Made to Order' ? 'FRESH' : 'BESTSELLER'}</div>
              </div>
              <div className="prod-body">
                <div className="prod-name">{p.name}</div>
                <div className="prod-footer">
                  <span className="prod-price">Rs. {p.price.toLocaleString()}</span>
                  <button className="add-btn" onClick={(e) => {
                    e.stopPropagation();
                    quickAddToCart(p);
                  }}>Add +</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="cta-banner">
        <div className="cta-copy">
          <h3>Planning a celebration?</h3>
          <p>Design your own custom cake — choose flavour, size, layers & toppings. We make it perfect.</p>
        </div>
        <button className="btn-white" onClick={() => navigate('/custom-order')}>Start Custom Order →</button>
      </div>
    </div>
  );
};

export default Home;
