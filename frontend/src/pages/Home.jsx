import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import heroImg from '../assets/hero.png';

const Home = ({ onCategorySelect }) => {
  const [products, setProducts] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [activeFlyer, setActiveFlyer] = useState(0);
  const [categories, setCategories] = useState([
    { name: 'Birthday Cakes', emoji: '🎂' },
    { name: 'Wedding Cakes', emoji: '💍' },
    { name: 'Cupcakes', emoji: '🧁' },
    { name: 'Pastries', emoji: '🥐' },
    { name: 'Baking Tools', emoji: '🍰' },
    { name: 'Ingredients', emoji: '🌾' }
  ]);
  const { quickAddToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const autoSlideRef = useRef(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Auto-slide flyers
  useEffect(() => {
    if (flyers.length <= 1) return;
    autoSlideRef.current = setInterval(() => {
      setActiveFlyer(prev => (prev + 1) % flyers.length);
    }, 3500);
    return () => clearInterval(autoSlideRef.current);
  }, [flyers]);

  const fetchHomeData = async () => {
    try {
      const prodRes = await axios.get('http://localhost:5000/api/products');
      const activeProducts = prodRes.data.filter(p => p.status === 'Active');
      setProducts(activeProducts);

      const flyerRes = await axios.get('http://localhost:5000/api/flyers');
      const activeFlyers = flyerRes.data.filter(f => f.status === 'Active');
      setFlyers(activeFlyers);

      const catRes = await axios.get('http://localhost:5000/api/categories');
      if (catRes.data && Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }
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

  const goToFlyer = (index) => {
    clearInterval(autoSlideRef.current);
    setActiveFlyer(index);
    // Restart auto-slide after manual click
    autoSlideRef.current = setInterval(() => {
      setActiveFlyer(prev => (prev + 1) % flyers.length);
    }, 3500);
  };

  return (
    <div id="page-home" className="page active">

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

        {/* FLYER CAROUSEL */}
        <div className="hero-flyer-carousel">
          {flyers.length > 0 ? (
            <>
              <div className="hero-flyer-track">
                {flyers.map((flyer, i) => {
                  const isImageFlyer = flyer.emoji && (flyer.emoji.startsWith('/') || flyer.emoji.startsWith('http'));
                  const bgImage = isImageFlyer 
                    ? `url(${flyer.emoji.startsWith('/') ? `http://localhost:5000${flyer.emoji}` : flyer.emoji})`
                    : (flyer.gradient || 'linear-gradient(135deg,#D31F1B,#8B0000)');
                  return (
                    <div
                      key={flyer._id}
                      className={`hero-flyer-slide ${i === activeFlyer ? 'active' : ''}`}
                      style={{ 
                        background: bgImage,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate('/products')}
                    >
                      {!isImageFlyer && (
                        <>
                          <div className="hero-flyer-emoji">{flyer.emoji}</div>
                          <div className="hero-flyer-title">{flyer.title}</div>
                          <div className="hero-flyer-subtitle">{flyer.subtitle}</div>
                          <button
                            className="hero-flyer-cta"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/products');
                            }}
                          >
                            Grab Offer →
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              {flyers.length > 1 && (
                <div className="hero-flyer-dots">
                  {flyers.map((_, i) => (
                    <button
                      key={i}
                      className={`flyer-dot ${i === activeFlyer ? 'active' : ''}`}
                      onClick={() => goToFlyer(i)}
                      aria-label={`Go to flyer ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Fallback if no flyers */
            <div className="hero-flyer-slide active" style={{ background: 'linear-gradient(135deg,#D31F1B,#8B0000)' }}>
              <div className="hero-flyer-emoji">🎂</div>
              <div className="hero-flyer-title">HE CAFE</div>
              <div className="hero-flyer-subtitle">Handcrafted with love</div>
            </div>
          )}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="cat-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <a onClick={() => navigate('/products')}>View All →</a>
        </div>
        <div className="cat-grid">
          {categories.map(cat => (
            <div
              key={cat._id || cat.name}
              className="cat-card"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="cat-icon">
                {cat.image ? (
                  <img
                    src={cat.image.startsWith('/uploads') ? `http://localhost:5000${cat.image}` : cat.image}
                    alt={cat.name}
                  />
                ) : (
                  '🍰'
                )}
              </div>
              <p>{cat.name === 'Ingredients' ? 'Ingredients' : cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY PRODUCTS SECTIONS */}
      {categories.map(cat => {
        const catProducts = products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).slice(0, 4);
        if (catProducts.length === 0) return null;
        return (
          <div key={cat._id || cat.name} className="prod-section" style={{ marginBottom: '48px' }}>
            <div className="section-header">
              <h2>{cat.name}</h2>
              <a onClick={() => handleCategoryClick(cat.name)}>View All →</a>
            </div>
            <div className="prod-grid">
              {catProducts.map(p => (
                <div key={p._id} className="prod-card" onClick={() => navigate(`/product/${p._id}`)}>
                  <div className="prod-img">
                    {p.image ? (
                      <img src={p.image.startsWith('/uploads') ? `http://localhost:5000${p.image}` : p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '48px' }}>🍰</span>
                    )}
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
        );
      })}

      {/* CTA BANNER */}
      <div className="cta-banner">
        <div className="cta-copy">
          <h3>Planning a celebration?</h3>
          <p>Design your own custom cake — choose flavour, size, layers &amp; toppings. We make it perfect.</p>
        </div>
        <button className="btn-white" onClick={() => navigate('/custom-order')}>Start Custom Order →</button>
      </div>
    </div>
  );
};

export default Home;
