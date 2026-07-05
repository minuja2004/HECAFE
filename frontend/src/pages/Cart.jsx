import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    payment: 'Cash on Delivery',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setCheckoutForm({
      ...checkoutForm,
      [e.target.id]: e.target.value
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.email || !checkoutForm.phone || !checkoutForm.address || !checkoutForm.date) {
      alert('Please fill in all required fields.');
      return;
    }

    const subtotal = getCartTotal();
    const delivery = subtotal > 5000 ? 0 : 350; // free delivery over 5000
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + delivery + tax;

    const payload = {
      customerName: checkoutForm.name,
      email: checkoutForm.email,
      phone: checkoutForm.phone,
      address: checkoutForm.address,
      type: 'Regular',
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        flavour: item.flavour
      })),
      subtotal,
      delivery,
      tax,
      total,
      notes: checkoutForm.notes
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders', payload);
      setCreatedOrder(res.data);
      clearCart();
      setCheckoutModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    }
  };

  if (createdOrder) {
    return (
      <div className="custom-wrap" style={{ textAlign: 'center', padding: '64px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛍️</div>
        <h2>Order Placed Successfully!</h2>
        <p style={{ margin: '16px 0', fontSize: '15px', color: 'var(--gray)' }}>
          Thank you for shopping with HE Cafe. We have received your order details and started processing it.
        </p>
        <div style={{ background: 'var(--offwhite)', padding: '20px', borderRadius: '12px', display: 'inline-block', margin: '16px 0', textAlign: 'left' }}>
          <div><strong>Order ID:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{createdOrder.orderId}</span></div>
          <div style={{ marginTop: '6px' }}><strong>Grand Total:</strong> Rs. {createdOrder.total.toLocaleString()}</div>
          <div style={{ marginTop: '6px' }}><strong>Est. Delivery:</strong> {checkoutForm.date}</div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--gray)' }}>
          Write down your Order ID. You can check its delivery status and contact our support agents using the <strong>Track Order</strong> portal.
        </p>
        <button className="btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>
          Back to Store
        </button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const delivery = subtotal === 0 ? 0 : (subtotal > 5000 ? 0 : 350);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  return (
    <div id="page-cart" className="page">
      {cart.length === 0 ? (
        <div style={{ padding: '80px 64px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🛒</div>
          <h2>Your Cart is Empty</h2>
          <p style={{ color: 'var(--gray)', margin: '12px 0 24px' }}>Looks like you haven't added anything to your cart yet.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>Shop Our Cakes</button>
        </div>
      ) : (
        <div className="cart-wrap">
          <div className="cart-items">
            <h2>Your Shopping Cart</h2>
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img">{item.emoji}</div>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>Option: {item.size} | Flavour: {item.flavour}</p>
                  <div className="qty-row" style={{ margin: '8px 0 0 0' }}>
                    <div className="qty-ctrl">
                      <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span style={{ fontSize: '13px', minWidth: '24px' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
                <div className="cart-item-price">Rs. {(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{delivery === 0 ? 'Free' : `Rs. ${delivery}`}</span>
            </div>
            <div className="summary-row">
              <span>Estimated Tax (5%)</span>
              <span>Rs. {tax.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--red)' }}>Rs. {total.toLocaleString()}</span>
            </div>

            <button className="checkout-btn" onClick={() => setCheckoutModalOpen(true)}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutModalOpen && (
        <div className="modal-backdrop show">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setCheckoutModalOpen(false)}>×</button>
            <div className="modal-header">
              <h3>Checkout Details</h3>
            </div>
            <form onSubmit={handleCheckoutSubmit}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input type="text" id="name" value={checkoutForm.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" id="email" value={checkoutForm.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" id="phone" value={checkoutForm.phone} onChange={handleInputChange} placeholder="+94 7X XXX XXXX" required />
              </div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <input type="text" id="address" value={checkoutForm.address} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Date *</label>
                  <input type="date" id="date" value={checkoutForm.date} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select id="payment" value={checkoutForm.payment} onChange={handleInputChange}>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Card Payment (Simulation)">Card Payment (Simulation)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Special Notes (Allergies, Messages, etc.)</label>
                <textarea id="notes" value={checkoutForm.notes} onChange={handleInputChange} style={{ height: '60px' }}></textarea>
              </div>
              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>Confirm Order & Place</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
