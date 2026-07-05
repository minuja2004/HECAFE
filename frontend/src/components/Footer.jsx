import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>HE <span>Cafe</span></h3>
          <p>Sri Lanka's premier online bakery delivering handcrafted cakes and pastries to your doorstep. Quality ingredients, baked with love.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li onClick={() => navigate('/')}>Home</li>
            <li onClick={() => navigate('/products')}>Shop</li>
            <li onClick={() => navigate('/custom-order')}>Custom Order</li>
            <li>About Us</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li onClick={() => navigate('/products?category=Birthday Cakes')}>Birthday Cakes</li>
            <li onClick={() => navigate('/products?category=Wedding Cakes')}>Wedding Cakes</li>
            <li onClick={() => navigate('/products?category=Cupcakes')}>Cupcakes</li>
            <li onClick={() => navigate('/products?category=Pastries')}>Pastries</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>+94 70 408 4540</li>
            <li>zeezlabs@gmail.com</li>
            <li>Colombo, Sri Lanka</li>
            <li>Mon–Sat: 8am–8pm</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 HE Cafe. All rights reserved.</span>
        <span>Privacy Policy · Terms of Service</span>
      </div>
    </footer>
  );
};

export default Footer;
