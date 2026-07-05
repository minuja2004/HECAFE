import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CategoryNav from './components/CategoryNav';
import TrackingModal from './components/TrackingModal';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import Cart from './pages/Cart';
import AuthPortal from './pages/AuthPortal';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            {/* Global Navbar */}
            <Navbar 
              onOpenTracking={() => setTrackingOpen(true)} 
              onSearch={(query) => setSearchQuery(query)}
            />

            {/* Global Category Nav */}
            <CategoryNav 
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
            />

            {/* Main Application Routes */}
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
              <Routes>
                <Route path="/" element={<Home onCategorySelect={(cat) => setActiveCategory(cat)} />} />
                <Route path="/products" element={<Products searchQuery={searchQuery} onCategorySelect={(cat) => setActiveCategory(cat)} />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/custom-order" element={<CustomOrder />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<AuthPortal />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Global Tracking Modal */}
            <TrackingModal isOpen={trackingOpen} onClose={() => setTrackingOpen(false)} />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
