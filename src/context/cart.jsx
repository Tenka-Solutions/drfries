import { createContext, useState } from 'react';

export const CartContext = createContext();

function normalizeCartProduct(product = {}) {
  const productId = product.productId
    ? String(product.productId)
    : product.id !== undefined && product.id !== null
      ? String(product.id)
      : '';
  const title = product.title || product.name || 'Producto';
  const price = Number(product.price) || 0;
  const cartKey = product.cartKey || (product.selections ? `${productId}:${product.selections}` : productId);

  return {
    ...product,
    id: product.id ?? productId,
    productId,
    name: product.name || title,
    title,
    price,
    cartKey,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const addToCart = (product) => {
    if (!product) return;
    const normalizedProduct = normalizeCartProduct(product);

    setCart(currentCart => {
      const existingProduct = currentCart.find(item => item.cartKey === normalizedProduct.cartKey);

      if (existingProduct) {
        return currentCart.map(item => 
          item.cartKey === normalizedProduct.cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...normalizedProduct, quantity: 1, uniqueId: Date.now() }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart(currentCart => currentCart.filter(item => item.cartKey !== cartKey));
  };

  const decreaseQuantity = (product) => {
    setCart(currentCart => {
      return currentCart.map(item => {
        if (item.cartKey === product.cartKey) {
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
