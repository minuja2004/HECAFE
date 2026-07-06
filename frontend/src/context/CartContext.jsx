import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const localData = localStorage.getItem('he_cafe_cart');
    return localData ? JSON.parse(localData) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('he_cafe_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity, size = 'Standard', flavour = 'Standard', customPrice = null) => {
    const price = customPrice !== null ? customPrice : product.price;
    const cartId = "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    const newCartItem = {
      id: cartId,
      productId: product._id || product.id,
      name: product.name,
      image: product.image,
      price,
      quantity,
      size,
      flavour
    };

    setCart(prevCart => [...prevCart, newCartItem]);
    setCartOpen(true);
  };

  const quickAddToCart = (product) => {
    addToCart(product, 1, 'Default Size', 'Classic Flavor');
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== cartId));
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === cartId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartOpen,
      setCartOpen,
      addToCart,
      quickAddToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
