import { useState, useEffect, useRef } from 'react';
import './Cart.css';
import { useCart } from '../hooks/useCart.js';
import { useNavigate } from 'react-router-dom';
import { PaymentService } from '../services/api/paymentService.js';

function CartItem({ price, title, quantity, selectedOption, onAdd, onDecrease }) {
  return (
    <li className="cart-item">
      <div className="cart-item-details">
        <strong className="cart-item-title">{title}</strong>
        {selectedOption && <small className="cart-item-option">Opción: {selectedOption}</small>}
        <div className="cart-item-quantity-price">
          <span className="cart-item-quantity">Cantidad: {quantity}</span>
          <span className="cart-item-price">Precio: ${price}</span>
          <div className="quantity-controls extra-item-buttons">
            <button className="cart-item-remove-btn" onClick={onDecrease}>-</button>
            <span className="cart-item-quantity" >{quantity}</span>
            <button className="cart-item-add-btn" onClick={onAdd}>+</button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function Cart({ isOpen, toggleCart }) {
  const { cart, clearCart, addToCart, decreaseQuantity, totalPrice, finalPrice, applyDiscount, discountApplied } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '+569 ', // Teléfono con formato chileno
    email: '', // Agregar campo de email
    deliveryType: '',
    localPickup: '',
    address: '',
    comment: '' // Agregar campo para comentarios
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? value.replace(/[^0-9+]/g, '') : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
        setError('El nombre es requerido');
        return false;
    }

    if (!formData.phone.match(/^\+569\d{8}$/)) {
        setError('El teléfono debe tener formato +569 XXXXXXXX');
        return false;
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError('Email inválido');
        return false;
    }

    if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
        setError('La dirección es requerida para delivery');
        return false;
    }

    if (formData.deliveryType === 'pickup' && !formData.localPickup) {
        setError('Debe seleccionar un local para retiro');
        return false;
    }

    return true;
};

const handleCheckout = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);

    try {
        const paymentData = {
            amount: Math.round(finalPrice),
            buyOrder: `ORDEN${Date.now()}`,
            returnUrl: 'https://drfries.cl/confirmacion',
            items: cart.map(item => ({
              ...item
            })),
            customer: {
                name: formData.name,
                phone: formData.phone.replace(/\s/g, ''),
                email: formData.email || 'pagosweb@drfries.cl',
                deliveryType: formData.deliveryType,
                address: formData.deliveryType === 'delivery' ? formData.address : '',
                localPickup: formData.deliveryType === 'pickup' ? formData.localPickup : ''
            }
        };

        console.log('Enviando datos:', paymentData);
        const response = await PaymentService.createTransaction(paymentData);
        console.log('Respuesta recibida:', response);

        if (!response?.url || !response?.token) {
            throw new Error('Respuesta inválida del servidor');
        }

        localStorage.setItem('pendingOrder', JSON.stringify({
            items: cart,
            customer: formData,
            total: finalPrice,
            token: response.token
        }));

        window.location.href = `${response.url}?token_ws=${response.token}`;

    } catch (error) {
        console.error("Error detallado:", error);
        setError(error.message);
    } finally {
        setIsLoading(false);
    }
};

  const handleApplyDiscount = () => {
    if (discountCode.trim() === '') {
      setDiscountError('Ingrese un código de descuento');
      return;
    }

    if (applyDiscount(discountCode)) {
      setDiscountError('');
      setDiscountCode('');
    } else {
      setDiscountError('Código inválido o ya utilizado');
    }
  };

  // Función para verificar horarios
  const getAvailableLocations = () => {
    const now = new Date();
    const day = now.getDay(); // 0 es domingo
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Lista base de locales
    const allLocations = [
        { id: '01', name: 'Caupolican 654', address: 'Los Angeles' },
        { id: '02', name: 'Azaleas, Supermercadp aCuenta', address: 'Los Angeles' },
        { id: '03', name: 'Alcazar 635, Lider Express', address: 'Los Angeles' },
        { id: '04', name: 'Ricardo Vicuña 284 , Hiper Lider', address: 'Los Angeles' },
        { id: '05', name: 'MallPlaza Trebol', address: 'Concepcion' }
    ];

    if (day === 0) { // Domingo
        const time1100 = 11 * 60;  // 11:00
        const time1830 = 18 * 60 + 30;  // 18:30
        return allLocations.filter(() => currentTime >= time1100 && currentTime <= time1830);
    } else { // Lunes a Sábado
        const time1030 = 10* 60;  // 10:00 todo
        const time1230 = 12 * 60 + 30;  // 12:30
        const time1930 = 19* 60 + 30;  // 19:30

        return allLocations.filter(location => {
            if (location.id === '01') {
                return currentTime >= time1230 && currentTime <= time1930;
            } else {
                return currentTime >= time1030 && currentTime <= time1930;
            }
        });
    }
};

  // Función para verificar si el delivery está disponible
  const isDeliveryAvailable = () => {
    const now = new Date();
    const day = now.getDay(); // 0 es domingo
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    if (day === 0) { // Domingo
        const time1100 = 13 * 60;  // 11:00
        const time1830 = 18 * 60 + 30;  // 18:30
        return currentTime >= time1100 && currentTime <= time1830;
    } else { // Lunes a Sábado
        const time1230 = 12 * 60 + 30;  // 12:30
        const time1930 = 19 * 60 + 30;  // 19:30
        return currentTime >= time1230 && currentTime <= time1930;
    }
};

  return (
    <>
      {isOpen && (
        <div className="modal-cart" onClick={toggleCart}>
          <div className="modal-cart-content" onClick={(e) => e.stopPropagation()}>
            <header className="cart-header">
              <h2>Carrito de Compras</h2>
              <button className="cart-close-btn" onClick={toggleCart}>&times;</button>
            </header>
            
            {cart.length === 0 ? (
              <div className="empty-cart-message">
                <p><strong onClick={toggleCart}>Tu carrito está vacío</strong></p>
                <br />
                <button className="continue-shopping" onClick={toggleCart}>
                  Seguir comprando
                </button>
              </div>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.map((product) => (
                    <CartItem
                      key={product.uniqueId}
                      onAdd={() => addToCart(product)}
                      onDecrease={() => decreaseQuantity(product)}
                      {...product}
                    />
                  ))}
                </ul>
                
                <footer className="cart-footer">
                  <div className="discount-section">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Código de descuento"
                      className="discount-input"
                    />
                    <button 
                      onClick={handleApplyDiscount}
                      className="apply-discount-btn"
                      disabled={discountApplied}
                    >
                      Aplicar
                    </button>
                    {discountError && <p className="discount-error">{discountError}</p>}
                    {discountApplied && <p className="discount-success">¡Descuento del 10% aplicado!</p>}
                  </div>
                  <div className="cart-total">
                    {discountApplied && (
                      <span className="original-price">Precio original: ${Math.round(totalPrice)}</span>
                    )}
                    <strong>Total: ${Math.round(finalPrice)}</strong>
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <div className="cart-buttons">
                    <button className="cart-clear-btn" onClick={clearCart}>
                      Vaciar
                    </button>
                    <button
                      className="cart-checkout-btn"
                      onClick={() => setShowSummary(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Procesando...' : 'Ir a Pagar'}
                    </button>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}

      {showSummary && (
        <div className="modal-cart" onClick={() => setShowSummary(false)}>
          <div className="modal-cart-content" onClick={(e) => e.stopPropagation()}>
            <header className="cart-header">
              <h2>Datos del Comprador</h2>
              <button className="cart-close-btn" onClick={() => setShowSummary(false)}>
                &times;
              </button>
            </header>
            
            <form onSubmit={handleCheckout} className="checkout-form">
              <div className="form-group">
                <label>Tipo de Entrega:</label>
                <div className="delivery-options">
                  {isDeliveryAvailable() && (
                    <label>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={formData.deliveryType === 'delivery'}
                        onChange={handleInputChange}
                        required
                      />
                      Delivery
                    </label>
                  )}
                  <label>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={formData.deliveryType === 'pickup'}
                      onChange={handleInputChange}
                      required
                    />
                    Retiro Local
                  </label>
                </div>
              </div>

              {formData.deliveryType === 'pickup' && (
                <div className="form-group">
                  <label htmlFor="localPickup">Seleccione Local:</label>
                  <select
                    id="localPickup"
                    name="localPickup"
                    value={formData.localPickup}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un local</option>
                    {getAvailableLocations().map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mostrar el campo de dirección solo si es delivery */}
              {formData.deliveryType === 'delivery' && (
                <div className="form-group">
                  <label htmlFor="address">Dirección de Entrega:</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Nombre Completo:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Teléfono de Contacto:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  pattern="^\+569\d{8}$"
                  required
                />
                <small className="phone-format">Formato: <strong>+569 </strong>12345678</small>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comentarios adicionales:</label>
                <input
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Comentarios especiales para el pedido"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="confirm-payment-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Procesando Pago...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;