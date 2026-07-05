import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AuthPortal = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false); // Toggle visual mode for staff vs customer
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // Login flow
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(res.data.token, res.data.user);
        
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Register flow (customers only)
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Check your credentials.');
    }
  };

  return (
    <div className="auth-wrap">
      <h1>{isLogin ? (isAdminMode ? 'Admin Staff Login' : 'Customer Login') : 'Create Customer Account'}</h1>
      <p className="sub">
        {isLogin 
          ? (isAdminMode ? 'Access the store backend controls' : 'Login to place orders and track delivery') 
          : 'Register for faster checkout and order history'}
      </p>

      {error && (
        <div style={{ color: 'var(--red)', fontSize: '13px', margin: '0 0 16px 0', textAlign: 'center', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {/* Mode Selector for Logins */}
      {isLogin && (
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' }}>
          <button 
            type="button" 
            style={{
              flex: 1, 
              padding: '8px', 
              background: !isAdminMode ? 'var(--red)' : '#fff', 
              color: !isAdminMode ? '#fff' : 'var(--black)',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setIsAdminMode(false)}
          >
            Customer
          </button>
          <button 
            type="button" 
            style={{
              flex: 1, 
              padding: '8px', 
              background: isAdminMode ? 'var(--black)' : '#fff', 
              color: isAdminMode ? '#fff' : 'var(--black)',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => setIsAdminMode(true)}
          >
            Store Staff
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name *</label>
            <input type="text" id="name" value={formData.name} onChange={handleChange} required />
          </div>
        )}
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" id="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input type="password" id="password" value={formData.password} onChange={handleChange} required />
        </div>
        {!isLogin && (
          <>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <input type="text" id="address" value={formData.address} onChange={handleChange} required />
            </div>
          </>
        )}
        <button type="submit" className="submit-btn" style={{ background: isLogin && isAdminMode ? 'var(--black)' : 'var(--red)' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <div className="auth-toggle">
        {isLogin ? (
          <>
            <span>Don't have an account?</span>
            <button onClick={() => { setIsLogin(false); setIsAdminMode(false); }}>Register here</button>
          </>
        ) : (
          <>
            <span>Already have an account?</span>
            <button onClick={() => setIsLogin(true)}>Login here</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPortal;
