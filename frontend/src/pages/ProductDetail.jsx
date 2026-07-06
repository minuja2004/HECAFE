import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeAddon, setSizeAddon] = useState(0);
  const [sizeText, setSizeText] = useState('6 inch (serves 8-10)');
  const [flavourText, setFlavourText] = useState('Red Velvet');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      const found = res.data.find(p => p._id === id);
      if (found) {
        setProduct(found);
      }
    } catch (err) {
      console.error('Error fetching product details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '64px', textAlign: 'center' }}>Loading product...</div>;
  if (!product) return <div style={{ padding: '64px', textAlign: 'center' }}>Product not found.</div>;

  const isBakeryItem = ["Birthday Cakes", "Wedding Cakes", "Cupcakes", "Pastries"].includes(product.category);

  const handleSizeChange = (e) => {
    const addon = parseInt(e.target.value);
    setSizeAddon(addon);
    const selectedText = e.target.options[e.target.selectedIndex].text.split(" — ")[0];
    setSizeText(selectedText);
  };

  const handleAdd = () => {
    const finalPrice = product.price + sizeAddon;
    const finalSize = isBakeryItem ? sizeText : 'Standard';
    const finalFlavour = isBakeryItem ? flavourText : 'Standard';
    
    addToCart(product, qty, finalSize, finalFlavour, finalPrice);
    navigate('/cart');
  };

  const currentTotal = (product.price + sizeAddon) * qty;

  return (
    <div id="page-detail" className="page">
      <div className="detail-wrap">
        <div className="detail-img">
          {product.image ? (
            <img src={product.image.startsWith('/uploads') ? `http://localhost:5000${product.image}` : product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
          ) : (
            <span style={{ fontSize: '80px' }}>🍰</span>
          )}
        </div>
        <div className="detail-body">
          <button className="back-btn" onClick={() => navigate('/products')}>← Back to Shop</button>
          <h1>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '12px 0' }}>
            <span style={{ color: '#f5a623', fontSize: '14px' }}>★★★★★</span>
            <span style={{ fontSize: '13px', color: 'var(--gray)' }}>4.9 (128 reviews)</span>
          </div>
          <div className="detail-price">Rs. {product.price.toLocaleString()}</div>
          <p className="detail-desc">{product.description}</p>

          {isBakeryItem && (
            <div className="detail-options">
              <label>Select Size</label>
              <select onChange={handleSizeChange}>
                <option value="0">6 inch (serves 8-10) — Base Price</option>
                <option value="1200">8 inch (serves 12-15) — +Rs. 1,200</option>
                <option value="2800">10 inch (serves 20+) — +Rs. 2,800</option>
              </select>
              <label>Select Flavour</label>
              <select value={flavourText} onChange={(e) => setFlavourText(e.target.value)}>
                <option value="Red Velvet">Red Velvet</option>
                <option value="Chocolate Fudge">Chocolate Fudge</option>
                <option value="Classic Vanilla">Classic Vanilla</option>
                <option value="Strawberry cream">Strawberry cream</option>
              </select>
            </div>
          )}

          <div className="qty-row">
            <label>Quantity</label>
            <div className="qty-ctrl">
              <button onClick={() => setQty(prev => prev > 1 ? prev - 1 : 1)}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(prev => prev + 1)}>+</button>
            </div>
          </div>

          <button className="add-cart-btn" onClick={handleAdd}>
            🛒 Add to Cart — Rs. {currentTotal.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
