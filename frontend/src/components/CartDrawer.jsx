import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [checkoutMode, setCheckoutMode] = useState(false);
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

  // Reset states when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCheckoutMode(false);
      setCreatedOrder(null);
    }
  }, [isOpen]);

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
        image: item.image,
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
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    }
  };

  const subtotal = getCartTotal();
  const delivery = subtotal === 0 ? 0 : (subtotal > 5000 ? 0 : 350);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  return (
    <>
      {/* Backdrop */}
      <div className={`cart-drawer-backdrop ${isOpen ? 'show' : ''}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? 'show' : ''}`}>
        <div className="cart-drawer-header">
          <h3>
            {createdOrder 
              ? 'Order Success 🎉' 
              : checkoutMode 
                ? 'Checkout Details 📝' 
                : `Shopping Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)}) 🛒`
            }
          </h3>
          <button className="cart-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-drawer-body">
          {createdOrder ? (
            /* SUCCESS PANEL */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🍰</div>
              <h3 style={{ fontWeight: '800', marginBottom: '8px' }}>Order Placed!</h3>
              <p style={{ fontSize: '13px', color: 'var(--gray)', lineHeight: '1.5', marginBottom: '20px' }}>
                Thank you for ordering with HE Cafe! We have registered your cake & bakery request.
              </p>
              <div style={{ background: 'var(--offwhite)', padding: '16px', borderRadius: '12px', textAlign: 'left', fontSize: '13px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                <div><strong>Order ID:</strong> <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{createdOrder.orderId}</span></div>
                <div style={{ marginTop: '6px' }}><strong>Grand Total:</strong> Rs. {createdOrder.total.toLocaleString()}</div>
                <div style={{ marginTop: '6px' }}><strong>Est. Delivery:</strong> {checkoutForm.date}</div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--gray)', lineHeight: '1.4', marginBottom: '20px' }}>
                Make sure to copy the Order ID to track status in our **Track Order** panel!
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%' }} 
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
              >
                Back to Storefront
              </button>
            </div>
          ) : checkoutMode ? (
            /* CHECKOUT FORM */
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Customer Name *</label>
                <input type="text" id="name" value={checkoutForm.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Email *</label>
                <input type="email" id="email" value={checkoutForm.email} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Phone Number *</label>
                <input type="tel" id="phone" value={checkoutForm.phone} onChange={handleInputChange} placeholder="+94 7X XXX XXXX" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Delivery Address *</label>
                <input type="text" id="address" value={checkoutForm.address} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Delivery Date *</label>
                  <input type="date" id="date" value={checkoutForm.date} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Payment Method</label>
                  <select id="payment" value={checkoutForm.payment} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Card Payment (Simulation)">Card Payment (Simulation)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Special Notes</label>
                <textarea id="notes" value={checkoutForm.notes} onChange={handleInputChange} style={{ width: '100%', height: '50px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1, padding: '12px', color: 'var(--black)', borderColor: 'var(--border)' }} onClick={() => setCheckoutMode(false)}>
                  ← Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>
                  Place Order
                </button>
              </div>
            </form>
          ) : cart.length === 0 ? (
            /* EMPTY STATE */
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧁</div>
              <h3 style={{ fontWeight: '800' }}>Your Cart is Empty</h3>
              <p style={{ color: 'var(--gray)', fontSize: '13px', margin: '12px 0 24px', lineHeight: '1.4' }}>
                Add some of our premium cakes and bakery items to start!
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%' }} 
                onClick={() => {
                  onClose();
                  navigate('/products');
                }}
              >
                Browse Shop Catalog
              </button>
            </div>
          ) : (
            /* CART ITEMS LIST */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--lgray)' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image ? (
                      <img src={item.image.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--offwhite)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍰</div>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 4px 0' }}>{item.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--gray)', margin: 0 }}>
                        Size: {item.size} {item.flavour && `| Flavour: ${item.flavour}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <div className="qty-ctrl" style={{ padding: '2px 6px', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ fontSize: '12px', width: '20px', height: '20px' }}>−</button>
                        <span style={{ fontSize: '12px', minWidth: '16px' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ fontSize: '12px', width: '20px', height: '20px' }}>+</button>
                      </div>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#ff4d4f', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', alignSelf: 'center', color: 'var(--black)' }}>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!createdOrder && cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray)' }}>
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray)' }}>
                <span>Delivery Fee</span>
                <span>{delivery === 0 ? 'Free' : `Rs. ${delivery}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray)' }}>
                <span>Tax (5%)</span>
                <span>Rs. {tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--red)' }}>Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {!checkoutMode && (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '14px' }} 
                onClick={() => setCheckoutMode(true)}
              >
                Proceed to Checkout →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
