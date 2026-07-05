import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TrackingModal = ({ isOpen, onClose }) => {
  const [orderIdSearch, setOrderIdSearch] = useState('');
  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    let interval;
    if (order) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for updates
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [order]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderIdSearch.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderIdSearch.trim()}`);
      setOrder(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Order ID not found. E.g. ORD-1042');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!order) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${order.orderId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !order) return;
    try {
      const res = await axios.post(`http://localhost:5000/api/chat/${order.orderId}`, { text: chatInput });
      setMessages(prev => [...prev, res.data]);
      setChatInput('');
      // Immediately refetch in case of quick auto-reply trigger
      setTimeout(fetchMessages, 1600);
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  if (!isOpen) return null;

  // Stepper calculations
  let stepperWidth = '0%';
  if (order) {
    if (order.status === 'Processing') stepperWidth = '50%';
    else if (order.status === 'Delivered') stepperWidth = '100%';
  }

  return (
    <div className="modal-backdrop show">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-header">
          <h3>Track Your Order</h3>
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Enter Order ID (e.g. ORD-1042)"
            value={orderIdSearch}
            onChange={(e) => setOrderIdSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1.5px solid var(--border)',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button type="submit" className="add-btn" style={{ padding: '0 24px', borderRadius: '10px', fontSize: '13px' }} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {order && (
          <div id="tracking-result">
            <div style={{ background: 'var(--offwhite)', padding: '14px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Order ID:</strong> {order.orderId}</div>
              <div style={{ marginTop: '4px' }}><strong>Order Type:</strong> {order.type === 'Custom' ? 'Custom Design Order' : 'Store Catalog Order'}</div>
              <div style={{ marginTop: '4px' }}>
                <strong>Items:</strong> {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
              </div>
              <div style={{ marginTop: '4px' }}><strong>Total Amount:</strong> Rs. {order.total.toLocaleString()}</div>
            </div>

            {/* Stepper */}
            <div className="stepper">
              <div className="stepper-line-active" style={{ width: stepperWidth }}></div>
              <div className={`step ${order.status === 'Pending' ? 'active' : 'completed'}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Pending</div>
              </div>
              <div className={`step ${order.status === 'Processing' ? 'active' : order.status === 'Delivered' ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">Processing</div>
              </div>
              <div className={`step ${order.status === 'Delivered' ? 'active completed' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">Delivered</div>
              </div>
            </div>

            {/* Chat Simulator */}
            <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginTop: '24px' }}>Chat with HE Cafe</h4>
            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((m, index) => (
                  <div key={m._id || index} className={`chat-bubble ${m.sender === 'admin' ? 'admin' : 'customer'}`}>
                    <div>{m.text}</div>
                    <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="chat-input-row">
                <input
                  type="text"
                  placeholder="Type a message to HE Cafe..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingModal;
