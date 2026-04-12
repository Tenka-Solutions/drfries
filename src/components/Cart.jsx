import { useEffect, useMemo, useState } from 'react';
import './Cart.css';
import { useCart } from '../hooks/useCart.js';
import { createFudoOrder } from '../services/api/fudoOrderService.js';

function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-CL');
}

function createInitialFormData() {
  return {
    name: '',
    phone: '',
    comment: '',
  };
}

function getOrderErrorMessage(error) {
  const baseMessage = error?.message || 'No pudimos enviar tu pedido.';
  const details = error?.details?.details || error?.details || {};
  const saleId = details?.saleId;
  const createdItems = Array.isArray(details?.createdItems) ? details.createdItems.length : 0;

  if (!saleId) {
    return baseMessage;
  }

  if (createdItems > 0) {
    return `${baseMessage} La venta ${saleId} ya fue creada en Fudo y se cargaron ${createdItems} item(s) antes del error.`;
  }

  return `${baseMessage} La venta ${saleId} ya fue creada en Fudo.`;
}

function CartItem({ item, onAdd, onDecrease }) {
  const itemTitle = item.title || item.name || 'Producto';
  const selectedOption = item.selectedOption || item.selections;

  return (
    <li className="cart-item">
      <div className="cart-item-details">
        <strong className="cart-item-title">{itemTitle}</strong>
        {selectedOption && <small className="cart-item-option">Opcion: {selectedOption}</small>}
        <div className="cart-item-quantity-price">
          <span className="cart-item-quantity">Cantidad: {item.quantity}</span>
          <span className="cart-item-price">${formatPrice(item.price)}</span>
          <div className="quantity-controls extra-item-buttons">
            <button className="cart-item-remove-btn" onClick={onDecrease} type="button">
              -
            </button>
            <span className="cart-item-quantity">{item.quantity}</span>
            <button className="cart-item-add-btn" onClick={onAdd} type="button">
              +
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function Cart({ isOpen, toggleCart }) {
  const { cart, clearCart, addToCart, decreaseQuantity, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [formData, setFormData] = useState(createInitialFormData());

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart],
  );

  useEffect(() => {
    if (isOpen || showSummary) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen, showSummary]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: name === 'phone' ? value.replace(/[^\d+\s()-]/g, '') : value,
    }));
  };

  const resetCheckoutState = () => {
    setError(null);
    setOrderSuccess(null);
    setFormData(createInitialFormData());
  };

  const handleOpenSummary = () => {
    setError(null);
    setOrderSuccess(null);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    if (isSubmitting) {
      return;
    }

    setShowSummary(false);
    resetCheckoutState();
  };

  const handleCloseCart = () => {
    if (isSubmitting) {
      return;
    }

    toggleCart();
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      setError('Tu carrito esta vacio.');
      return false;
    }

    if (!formData.name.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return false;
    }

    const invalidItem = cart.find((item) => !String(item.productId || '').trim());

    if (invalidItem) {
      setError(`El producto "${invalidItem.title || invalidItem.name || 'sin nombre'}" no esta listo para enviar a Fudo.`);
      return false;
    }

    return true;
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();

    if (!validateCheckout()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createFudoOrder({
        customer: {
          name: formData.name,
          phone: formData.phone,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        comment: formData.comment,
      });

      setOrderSuccess({
        saleId: response?.saleId || null,
        itemsCount: Array.isArray(response?.items) ? response.items.length : cart.length,
      });
      clearCart();
      setFormData(createInitialFormData());
    } catch (submitError) {
      setError(getOrderErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-cart" onClick={handleCloseCart}>
          <div className="modal-cart-content" onClick={(event) => event.stopPropagation()}>
            <header className="cart-header">
              <h2>Carrito de Compras</h2>
              <button className="cart-close-btn" onClick={handleCloseCart} type="button">
                &times;
              </button>
            </header>

            {cart.length === 0 ? (
              <div className="empty-cart-message">
                <p>
                  <strong>Tu carrito esta vacio</strong>
                </p>
                <button className="continue-shopping" onClick={handleCloseCart} type="button">
                  Seguir comprando
                </button>
              </div>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.map((item) => (
                    <CartItem
                      key={item.cartKey || item.uniqueId || item.productId}
                      item={item}
                      onAdd={() => addToCart(item)}
                      onDecrease={() => decreaseQuantity(item)}
                    />
                  ))}
                </ul>

                <footer className="cart-footer">
                  <div className="cart-note">
                    El pedido se enviara directo a Dr. Fries. El pago web se integrara mas adelante.
                  </div>
                  <div className="cart-total">
                    <span>{totalItems} producto(s)</span>
                    <strong>Total: ${formatPrice(totalPrice)}</strong>
                  </div>
                  <div className="cart-buttons">
                    <button className="cart-clear-btn" onClick={clearCart} type="button">
                      Vaciar
                    </button>
                    <button
                      className="cart-checkout-btn"
                      onClick={handleOpenSummary}
                      disabled={isSubmitting}
                      type="button"
                    >
                      Finalizar pedido
                    </button>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}

      {showSummary && (
        <div className="modal-cart" onClick={handleCloseSummary}>
          <div className="modal-cart-content" onClick={(event) => event.stopPropagation()}>
            <header className="cart-header">
              <h2>Finalizar Pedido</h2>
              <button className="cart-close-btn" onClick={handleCloseSummary} type="button">
                &times;
              </button>
            </header>

            {orderSuccess ? (
              <div className="checkout-success">
                <h3>Pedido enviado</h3>
                <p>Tu orden ya fue creada correctamente en Fudo.</p>
                {orderSuccess.saleId && (
                  <p className="checkout-success-code">Venta creada: {orderSuccess.saleId}</p>
                )}
                <p>Items enviados: {orderSuccess.itemsCount}</p>
                <div className="form-actions">
                  <button className="confirm-payment-btn" onClick={handleCloseSummary} type="button">
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="checkout-form">
                <div className="checkout-summary">
                  <p>Completa tus datos y enviaremos la orden al backend para crearla en Fudo.</p>
                  <strong>Total del pedido: ${formatPrice(totalPrice)}</strong>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Nombre del cliente</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefono de contacto (opcional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="comment">Comentario del pedido (opcional)</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Ej: sin salsa, retirar mas tarde, etc."
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="confirm-payment-btn"
                    disabled={isSubmitting || cart.length === 0}
                  >
                    {isSubmitting ? 'Enviando pedido...' : 'Enviar pedido'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
