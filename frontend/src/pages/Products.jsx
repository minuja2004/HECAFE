import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const Products = ({ searchQuery, onCategorySelect }) => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const { quickAddToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products', err);
    }
  };

  // Filter products locally for search & category
  let filtered = products.filter(p => p.status === 'Active');

  if (categoryParam !== 'all') {
    filtered = filtered.filter(p => p.category === categoryParam);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }

  return (
    <div id="page-products" className="page">
      <div style={{ padding: '48px 64px' }}>
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        <div className="section-header">
          <h2>{categoryParam === 'all' ? 'All Products' : categoryParam}</h2>
          <span style={{ fontSize: '13px', color: 'var(--gray)' }}>
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray)', gridColumn: 'span 4' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧁</div>
            <h3>No products found match your search criteria.</h3>
            <button 
              className="btn-primary" 
              style={{ marginTop: '14px', padding: '10px 20px', fontSize: '13px' }} 
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
                    <img src={p.image.startsWith('/uploads') ? `http://localhost:5000${p.image}` : p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
