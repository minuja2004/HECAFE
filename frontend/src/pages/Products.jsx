import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const categoryDetails = {
  all: {
    title: "Our Full Collection",
    subtitle: "Browse through our wide selection of premium cakes, delicious pastries, organic baking ingredients, and professional tools.",
    emoji: "🍰",
    gradient: "linear-gradient(135deg, #1D1D1D 0%, #2D1010 100%)"
  },
  "birthday cakes": {
    title: "Celebration & Birthday Cakes",
    subtitle: "Make your birthdays and special celebrations extra sweet with our premium, gourmet cream cakes made to order.",
    emoji: "🎂",
    gradient: "linear-gradient(135deg, #2A0845 0%, #6441A5 100%)"
  },
  "wedding cakes": {
    title: "Elegant Wedding Cakes",
    subtitle: "Beautifully styled multi-tiered masterpieces, handcrafted laces, and premium sponges designed for your dream wedding day.",
    emoji: "💍",
    gradient: "linear-gradient(135deg, #1A3C40 0%, #407088 100%)"
  },
  cupcakes: {
    title: "Gourmet Cupcakes",
    subtitle: "Perfect little portions of delight, frosted with silky cream cheese, buttercream swirls, and fresh toppers.",
    emoji: "🧁",
    gradient: "linear-gradient(135deg, #D31F1B 0%, #FF69B4 100%)"
  },
  pastries: {
    title: "Handcrafted Pastries",
    subtitle: "French butter croissants, chocolate éclairs, danishes, and pastries baked fresh daily by our master chefs.",
    emoji: "🥐",
    gradient: "linear-gradient(135deg, #8A2387 0%, #E94057 100%)"
  },
  ingredients: {
    title: "Baking Ingredients",
    subtitle: "Premium organic flour, organic caster sugar, pure vanilla extract, Belgian chocolate chips, and premium supplies.",
    emoji: "🌾",
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
  },
  "baking tools": {
    title: "Professional Baking Tools",
    subtitle: "High-grade piping sets, loose-base non-stick pans, silicone spatulas, and digital scales to elevate your baking craft.",
    emoji: "🍰",
    gradient: "linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)"
  }
};

const Products = ({ searchQuery, onCategorySelect }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const { quickAddToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category') || 'all';

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Sync active category in parent (CategoryNav highlight) whenever URL param changes
  useEffect(() => {
    if (onCategorySelect) {
      onCategorySelect(categoryParam);
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  // Filter products locally for search & category
  let filtered = products.filter(p => p.status === 'Active');

  if (categoryParam !== 'all') {
    filtered = filtered.filter(p =>
      p.category?.toLowerCase() === categoryParam.toLowerCase()
    );
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  const currentCategoryObj = categories.find(c => c.name.toLowerCase() === categoryParam.toLowerCase());
  const catImage = currentCategoryObj ? currentCategoryObj.image : null;

  const detail = categoryDetails[categoryParam.toLowerCase()] || {
    title: categoryParam,
    subtitle: `Browse through our selection of ${categoryParam.toLowerCase()} products at HE Cafe.`,
    emoji: "🍰",
    gradient: "linear-gradient(135deg, #1D1D1D 0%, #2D1010 100%)"
  };

  return (
    <div id="page-products" className="page">
      {/* Category Hero Banner */}
      <div className="category-banner" style={{ 
        background: detail.gradient,
        padding: '48px 64px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '40px',
        borderRadius: '24px',
        margin: '32px 64px 40px 64px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Giant faded background emoji */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          fontSize: '200px',
          opacity: 0.08,
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {detail.emoji}
        </div>

        <div style={{ flex: 1, zIndex: 1 }}>
          <button 
            className="back-btn" 
            onClick={() => navigate('/')} 
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              fontSize: '12px', 
              fontWeight: '700',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.2s'
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: '40px', fontWeight: '900', margin: '0 0 10px 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {detail.title}
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.9, maxWidth: '600px', lineHeight: '1.5', margin: 0 }}>
            {detail.subtitle}
          </p>
        </div>

        <div style={{ zIndex: 1, flexShrink: 0 }}>
          {catImage ? (
            <img 
              src={catImage.startsWith('/uploads') ? `http://localhost:5000${catImage}` : catImage} 
              alt={categoryParam} 
              style={{ 
                width: '240px', 
                height: '150px', 
                objectFit: 'cover', 
                borderRadius: '16px', 
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: '3px solid rgba(255, 255, 255, 0.25)',
                display: 'block'
              }} 
            />
          ) : (
            <div style={{
              fontSize: '56px',
              background: 'rgba(255,255,255,0.18)',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              {detail.emoji}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '0 64px 60px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--lgray)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--black)' }}>Discover Listings</h3>
          <span style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: '600' }}>
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧁</div>
            <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>No products found</h3>
            <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '20px' }}>
              We couldn't find any active listings matching your selection.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                if (onCategorySelect) onCategorySelect('all');
                navigate('/products');
              }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="prod-grid">
            {filtered.map(p => (
              <div key={p._id} className="prod-card" onClick={() => navigate(`/product/${p._id}`)}>
                <div className="prod-img">
                  {p.image ? (
                    <img
                      src={p.image.startsWith('/uploads') ? `http://localhost:5000${p.image}` : p.image}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>🍰</span>
                  )}
                  {p.stock !== 'In Stock' && (
                    <div className="prod-badge" style={{ background: '#555' }}>{p.stock}</div>
                  )}
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
        )}
      </div>
    </div>
  );
};

export default Products;
