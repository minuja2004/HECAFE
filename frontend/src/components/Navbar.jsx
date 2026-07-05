import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = ({ onOpenTracking, onSearch }) => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
    navigate('/products');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <>
      {/* UTILITY BAR */}
      <div className="util-bar">
        <span>🎂 Free delivery in Colombo for orders over Rs. 5,000</span>
        <span>
          <a onClick={onOpenTracking} style={{ cursor: 'pointer' }}>Track Order</a>
          &nbsp;|&nbsp; Help &nbsp;|&nbsp; 
          <a href="tel:+94704084540">+94 70 408 4540</a>
          &nbsp;|&nbsp;
          {user ? (
            <span style={{ color: '#fff' }}>
              Hi, {user.name} ({user.role}) &nbsp;|&nbsp; 
              <a onClick={logout} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Logout</a>
            </span>
          ) : (
            <Link to="/auth" style={{ color: '#fff', textDecoration: 'underline' }}>Login / Register</Link>
          )}
        </span>
      </div>

      {/* MAIN NAVBAR */}
      <nav className="navbar">
        <Link to="/" className="logo">
          <div className="logo-text">HE <span>Cafe</span></div>
        </Link>

        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input 
            type="text" 
            placeholder="Search cakes, pastries, baking tools..." 
            value={searchVal}
            onChange={handleSearchChange}
          />
        </form>

        <div className="nav-icons">
          <Link to="/">Home</Link>
          <Link to="/custom-order">Custom Order</Link>
          <a onClick={onOpenTracking}>Track Order</a>
          
          {user && user.role === 'admin' && (
            <Link to="/admin" style={{ color: 'var(--red)', fontWeight: 'bold' }}>Admin Panel</Link>
          )}

          <button className="cart-btn" onClick={() => navigate('/cart')}>
            🛒 Cart ({getCartCount()})
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
