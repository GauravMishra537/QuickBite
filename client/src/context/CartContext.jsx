import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('quickbite-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [restaurant, setRestaurant] = useState(() => {
    const saved = localStorage.getItem('quickbite-cart-restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('quickbite-cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('quickbite-cart-restaurant', JSON.stringify(restaurant));
  }, [restaurant]);

  const addItem = (item, source) => {
    // Prevent mixing items from different restaurants
    if (restaurant && source && restaurant._id !== source._id) {
      const confirmed = window.confirm(
        `Your cart has items from ${restaurant.name}. Clear cart and add items from ${source.name}?`
      );
      if (!confirmed) return;
      setItems([]);
    }

    if (source) setRestaurant(source);

    setItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        toast.info(`Updated ${item.name} quantity`);
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success(`${item.name} added to cart`);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (itemId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i._id !== itemId);
      if (updated.length === 0) setRestaurant(null);
      return updated;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) { removeItem(itemId); return; }
    setItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal > 500 ? 0 : 30) : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + tax;

  return (
    <CartContext.Provider
      value={{
        items, restaurant, addItem, removeItem, updateQuantity, clearCart,
        itemCount, subtotal, deliveryFee, tax, total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
