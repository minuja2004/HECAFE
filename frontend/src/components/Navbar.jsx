import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = ({ onOpenTracking, onSearch, onOpenCart }) => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
    navigate('/products');
    setMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* UTILITY BAR */}
      <div className="util-bar">
        <span className="util-delivery">🎂 Free delivery in Colombo for orders over Rs. 5,000</span>
        <span className="util-links">
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
        <Link to="/" className="logo" onClick={closeMenu}>
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

        {/* Hamburger Button - mobile only */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Desktop Nav Icons */}
        <div className="nav-icons">
          <Link to="/">Home</Link>
          <Link to="/custom-order">Custom Order</Link>
          <a onClick={onOpenTracking} style={{ cursor: 'pointer' }}>Track Order</a>

          {user && user.role === 'admin' && (
            <Link to="/admin" className="admin-btn">🛡️ Admin Panel</Link>
          )}

          <button className="cart-btn" onClick={onOpenCart}>
            🛒 Cart ({getCartCount()})
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="logo-text">HE <span style={{ color: 'var(--red)' }}>Cafe</span></div>
          <button className="mobile-menu-close" onClick={closeMenu}>✕</button>
        </div>

        <form onSubmit={handleSearchSubmit} className="mobile-search-bar">
          <input
            type="text"
            placeholder="Search cakes, pastries..."
            value={searchVal}
            onChange={handleSearchChange}
          />
          <button type="submit">🔍</button>
        </form>

        <nav className="mobile-nav-links">
          <Link to="/" onClick={closeMenu}>🏠 Home</Link>
          <Link to="/products" onClick={closeMenu}>🛍️ All Products</Link>
          <Link to="/custom-order" onClick={closeMenu}>🎂 Custom Order</Link>
          <a onClick={() => { onOpenTracking(); closeMenu(); }} style={{ cursor: 'pointer' }}>📦 Track Order</a>
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu}>🛡️ Admin Panel</Link>
          )}
        </nav>

        <div className="mobile-menu-footer">
          <button className="cart-btn" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={() => { onOpenCart(); closeMenu(); }}>
            🛒 Cart ({getCartCount()})
          </button>
          {user ? (
            <div className="mobile-user-info">
              <span>Hi, <strong>{user.name}</strong> ({user.role})</span>
              <button className="mobile-logout-btn" onClick={() => { logout(); closeMenu(); }}>Logout</button>
            </div>
          ) : (
            <Link to="/auth" className="mobile-login-btn" onClick={closeMenu}>Login / Register</Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
