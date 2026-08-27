import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('nuva_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    localStorage.setItem('nuva_cart', JSON.stringify(cart));
  }, [cart]);

  const removeFlyingItem = (id) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    // Trigger cart bump animation when item arrives
    setCartBump(true);
    setTimeout(() => setCartBump(false), 550);
  };

  const triggerFlyAnimation = (product, startSource) => {
    try {
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      // Extract coordinates from click event or DOM element
      if (startSource && typeof startSource.clientX === 'number') {
        startX = startSource.clientX;
        startY = startSource.clientY;
      } else if (startSource && typeof startSource.getBoundingClientRect === 'function') {
        const rect = startSource.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      } else {
        // Fallback: search for product image in DOM
        const imgEl = document.querySelector(`[data-product-id="${product._id}"] img, [alt="${product.title}"]`);
        if (imgEl) {
          const rect = imgEl.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }
      }

      // Find cart icon destination in Navbar or Floating Cart Bar
      let endX = window.innerWidth - 60;
      let endY = 40;

      const cartIconEl = document.getElementById('navbar-cart-icon') || document.querySelector('[title="Cart"]');
      if (cartIconEl) {
        const cartRect = cartIconEl.getBoundingClientRect();
        endX = cartRect.left + cartRect.width / 2;
        endY = cartRect.top + cartRect.height / 2;
      }

      const imgUrl = product.images?.[0] || product.image || product.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';

      const newItem = {
        id: 'fly-' + Date.now() + '-' + Math.random(),
        image: imgUrl,
        startX,
        startY,
        endX,
        endY
      };

      setFlyingItems((prev) => [...prev, newItem]);
    } catch (e) {
      console.warn('Fly animation error:', e);
    }
  };

  const addToCart = (product, quantity = 1, startSource = null) => {
    // Require login/registration before adding products
    if (!user) {
      openAuthModal('login');
      return false;
    }

    // Trigger visual fly-to-cart animation
    triggerFlyAnimation(product, startSource);

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    return true;
  };

  const updateQuantity = (productId, delta) => {
    if (!user && delta > 0) {
      openAuthModal('login');
      return;
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.discountedPrice || item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isDrawerOpen,
        setIsDrawerOpen,
        subtotal,
        itemCount: cart.reduce((acc, item) => acc + item.quantity, 0),
        flyingItems,
        removeFlyingItem,
        cartBump
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

