import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CustomOrder = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    cakeType: 'Birthday Cake',
    size: '6 inch (8-10 persons)',
    flavour: 'Red Velvet',
    frosting: 'Cream Cheese',
    message: '',
    deliveryDate: '',
    specialRequests: ''
  });

  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address || !formData.deliveryDate) {
      alert('Please fill in all required fields.');
      return;
    }

    // Set custom order simulated pricing
    const subtotal = 8500; 
    const tax = Math.round(subtotal * 0.05);
    const delivery = 350;
    const total = subtotal + tax + delivery;

    const payload = {
      customerName: formData.customerName,
      email: user ? user.email : 'guest@example.com',
      phone: formData.phone,
      address: formData.address,
      type: 'Custom',
      items: [{
        productId: 'custom',
        name: `Custom ${formData.cakeType}`,
        emoji: '💍',
        price: subtotal,
        quantity: 1,
        size: formData.size,
        flavour: formData.flavour
      }],
      customDetails: {
        cakeType: formData.cakeType,
        size: formData.size,
        flavour: formData.flavour,
        frosting: formData.frosting,
        message: formData.message,
        deliveryDate: formData.deliveryDate,
        specialRequests: formData.specialRequests
      },
      subtotal,
      delivery,
      tax,
      total
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders', payload);
      setCreatedOrder(res.data);
    } catch (err) {
      console.error(err);
      alert('Error creating custom order. Please try again.');
    }
  };

  if (createdOrder) {
    return (
      <div className="custom-wrap" style={{ textAlign: 'center', padding: '64px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2>Custom Order Submitted Successfully!</h2>
        <p style={{ margin: '16px 0', fontSize: '15px', color: 'var(--gray)' }}>
          Thank you for choosing HE Cafe. We have received your specifications.
        </p>
        <div style={{ background: 'var(--offwhite)', padding: '20px', borderRadius: '12px', display: 'inline-block', margin: '16px 0', textAlign: 'left' }}>
          <div><strong>Order ID:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{createdOrder.orderId}</span></div>
          <div style={{ marginTop: '6px' }}><strong>Est. Total:</strong> Rs. {createdOrder.total.toLocaleString()}</div>
          <div style={{ marginTop: '6px' }}><strong>Delivery Date:</strong> {createdOrder.customDetails.deliveryDate}</div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--gray)' }}>
          Please note down your Order ID. You can use it in the <strong>Track Order</strong> tab to monitor progress and message our decorators.
        </p>
        <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div id="page-custom" className="page">
      <div className="custom-wrap">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
        <h1>Design Your Custom Cake</h1>
        <p className="sub">Tell us exactly what you'd like and we'll create your dream cake.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Your Name *</label>
              <input type="text" id="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. Minuja" required />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} placeholder="+94 7X XXX XXXX" required />
            </div>
          </div>
          <div className="form-group">
            <label>Delivery Address *</label>
            <input type="text" id="address" value={formData.address} onChange={handleChange} placeholder="Full address in Colombo" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cake Type</label>
              <select id="cakeType" value={formData.cakeType} onChange={handleChange}>
                <option>Birthday Cake</option>
                <option>Wedding Cake</option>
                <option>Anniversary</option>
                <option>Corporate Cake</option>
                <option>Baby Shower</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cake Size</label>
              <select id="size" value={formData.size} onChange={handleChange}>
                <option>6 inch (8-10 persons)</option>
                <option>8 inch (12-15 persons)</option>
                <option>10 inch (20+ persons)</option>
                <option>Tiered / Custom</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Flavour</label>
              <select id="flavour" value={formData.flavour} onChange={handleChange}>
                <option>Red Velvet</option>
                <option>Chocolate</option>
                <option>Vanilla</option>
                <option>Strawberry</option>
                <option>Lemon</option>
                <option>Black Forest</option>
                <option>Butterscotch</option>
              </select>
            </div>
            <div className="form-group">
              <label>Frosting</label>
              <select id="frosting" value={formData.frosting} onChange={handleChange}>
                <option>Cream Cheese</option>
                <option>Buttercream</option>
                <option>Whipped Cream</option>
                <option>Fondant</option>
                <option>Ganache</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Message on Cake</label>
            <input type="text" id="message" value={formData.message} onChange={handleChange} placeholder="e.g. Happy Birthday Nimal! 🎂" />
          </div>
          <div className="form-group">
            <label>Delivery Date *</label>
            <input type="date" id="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Special Requests</label>
            <textarea id="specialRequests" value={formData.specialRequests} onChange={handleChange} placeholder="Any additional decoration requests, allergies, dietary restrictions or design references..."></textarea>
          </div>
          <button type="submit" className="submit-btn">📦 Submit Custom Order</button>
        </form>
      </div>
    </div>
  );
};

export default CustomOrder;
