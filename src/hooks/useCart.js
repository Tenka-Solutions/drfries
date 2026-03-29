import { useContext } from 'react';
import { CartContext } from '../context/cart.jsx';

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }

  return {
    cart: context.cart,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    decreaseQuantity: context.decreaseQuantity,
    clearCart: context.clearCart,
    discountApplied: context.discountApplied,
    applyDiscount: context.applyDiscount,
    clearDiscount: context.clearDiscount,
    totalPrice: context.totalPrice,
    finalPrice: context.finalPrice,
    discountCode: context.discountCode
  };
};
