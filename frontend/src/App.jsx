import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CategoryNav from './components/CategoryNav';
import TrackingModal from './components/TrackingModal';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import AuthPortal from './pages/AuthPortal';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { cartOpen, setCartOpen } = useContext(CartContext);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <Router>
      <div className="app-container">
        {/* Global Navbar */}
        <Navbar 
          onOpenTracking={() => setTrackingOpen(true)} 
          onSearch={(query) => setSearchQuery(query)}
          onOpenCart={() => setCartOpen(true)}
          searchQuery={searchQuery}
        />

        {/* Global Category Nav */}
        <CategoryNav 
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
        />

        {/* Main Application Routes */}
        <main style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            <Route path="/" element={<Home onCategorySelect={(cat) => setActiveCategory(cat)} />} />
            <Route path="/products" element={<Products searchQuery={searchQuery} onCategorySelect={(cat) => setActiveCategory(cat)} />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/custom-order" element={<CustomOrder />} />
            <Route path="/auth" element={<AuthPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global Tracking Modal */}
        <TrackingModal isOpen={trackingOpen} onClose={() => setTrackingOpen(false)} />

        {/* Global Cart Drawer */}
        <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
