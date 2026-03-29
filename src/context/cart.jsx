import { createContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const addToCart = (product) => {
    if (!product) return;
    setCart(currentCart => {
      const existingProduct = currentCart.find(item => item.id === product.id);
      if (existingProduct) {
        return currentCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: 1, uniqueId: Date.now() }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(currentCart => currentCart.filter(item => item.id !== productId));
  };

  const decreaseQuantity = (product) => {
    setCart(currentCart => {
      return currentCart.map(item => {
        if (item.id === product.id) {
          const newQuantity = item.quantity - 1;
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
    clearDiscount();
  };

  const applyDiscount = (code) => {
    switch (code) {
      case 'DRFRIES10':
        if (!discountApplied) {
          setDiscountCode(code);
          setDiscountApplied(true);
          setDiscountPercentage(0.10); // 10%
          return true;
        }
        return false;
      case 'DRFRIESIG':
        if (!discountApplied) {
          setDiscountCode(code);
          setDiscountApplied(true);
          setDiscountPercentage(0.10); // 10%
          return true;
        }
        return false;
      default:
        return false;
    }
  };

  const clearDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(false);
    setDiscountPercentage(0); // Reset discount percentage
  };

  const totalPrice = cart.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);

  const finalPrice = discountApplied 
    ? totalPrice * (1 - discountPercentage) 
    : totalPrice;

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      decreaseQuantity,
      clearCart,
      discountApplied,
      applyDiscount,
      clearDiscount,
      totalPrice,
      finalPrice,
      discountCode
    }}>
      {children}
    </CartContext.Provider>
  );
}
