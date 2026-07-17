import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import logoImg from '../assets/logo.png';

const Navbar = ({ onOpenTracking, onSearch, onOpenCart, searchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchVal(searchQuery || '');
  }, [searchQuery]);

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
    if (window.location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const handleHomeClick = () => {
    if (onSearch) {
      onSearch('');
    }
    closeMenu();
  };

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
        <Link to="/" className="logo" onClick={handleHomeClick}>
          <img src={logoImg} alt="HE Cafe Logo" className="logo-img" />
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
          <Link to="/" onClick={handleHomeClick}>Home</Link>
          <Link to="/custom-order">Custom Order</Link>
          <a onClick={onOpenTracking} style={{ cursor: 'pointer' }}>Track Order</a>

          {user && user.role === 'admin' && (
            <Link to="/admin" className="admin-btn">🛡️ Admin Panel</Link>
          )}

          <button className="cart-btn" onClick={onOpenCart} aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" fill="currentColor"></circle>
              <circle cx="20" cy="21" r="1" fill="currentColor"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
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
          <img src={logoImg} alt="HE Cafe Logo" className="logo-img" style={{ height: '36px' }} />
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
          <Link to="/" onClick={handleHomeClick}>🏠 Home</Link>
          <Link to="/products" onClick={closeMenu}>🛍️ All Products</Link>
          <Link to="/custom-order" onClick={closeMenu}>🎂 Custom Order</Link>
          <a onClick={() => { onOpenTracking(); closeMenu(); }} style={{ cursor: 'pointer' }}>📦 Track Order</a>
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={closeMenu}>🛡️ Admin Panel</Link>
          )}
        </nav>

        <div className="mobile-menu-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <button className="cart-btn" onClick={() => { onOpenCart(); closeMenu(); }} aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" fill="currentColor"></circle>
              <circle cx="20" cy="21" r="1" fill="currentColor"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
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
