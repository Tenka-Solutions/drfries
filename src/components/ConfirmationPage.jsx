import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from '../hooks/useCart.js';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token_ws");
  const [status, setStatus] = useState(token ? "Verificando pago..." : "Falta token de pago");
  const [isSuccess, setIsSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [buyOrder, setBuyOrder] = useState(null);
  const [amount, setAmount] = useState(null);
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [redirigiendo, setRedirigiendo] = useState(false);
  
  useEffect(() => {
    const confirmPayment = async () => {
      if (!token || isProcessing) {
        if (!token && !redirigiendo) {
          setRedirigiendo(true)
          setTimeout(() => navigate('/'), 3000); // Redirige si no hay token
        }
        return;
      }
      
      setIsProcessing(true);

      try {
        console.log("Enviando token para confirmación:", token);
        const response = await fetch(`https://drfries.cl/api/commit-transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) { // Maneja errores HTTP
          const errorText = await response.text();
          console.error("Error en la respuesta HTTP:", errorText);
          throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data.status === 'AUTHORIZED') {
          setStatus("¡Pago Aprobado!");
          setIsSuccess(true);
          setBuyOrder(data.buyOrder);
          setAmount(data.amount);
          clearCart();
          
          // Envía datos al servidor para registro
          await fetch(`https://drfries.cl/api/payment-success`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              buyOrder: data.buyOrder,
              amount: data.amount,
              token
            }),
          });
          
        } else if (data.status === 'FAILED') {
          setStatus("Pago Rechazado ❌");
          setIsSuccess(false);
        } else {
          setStatus(`Error: ${data.message || 'Respuesta inesperada del servidor'}`);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Error en confirmación:", error);
        setStatus(`Error al verificar el pago: ${error.message}`);
        setIsSuccess(false);
      } finally {
        //setIsProcessing(false);
      }
    };

    confirmPayment();
  }, [token, clearCart, isProcessing, navigate]);

  const handleBackToMenu = () => navigate('/');
  const handleRetryPayment = () => navigate('/checkout');

  return (
    <div className={`confirmation-page ${isSuccess ? 'success' : 'failure'}`}>
      <div className="confirmation-box">
        <h2>{status}</h2>
        
        {isSuccess !== null && (
          <div className="status-icon">
            {isSuccess ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="fas fa-times-circle"></i>
            )}
          </div>
        )}

        {isSuccess ? (
          <div className="payment-details">
            <p>¡Gracias por tu compra! Nos pondremos en contacto contigo.</p>
            <p><strong>Orden de compra:</strong> {buyOrder}</p>
            <p>(Guarda este número para cualquier consulta)</p>
            <p><strong>Total:</strong> ${amount?.toLocaleString()}</p>
          </div>
        ) : (
          token && <p className="error-message">Por favor revisa los datos de tu tarjeta e intenta nuevamente</p>
        )}

        <div className="button-group">
          {!isSuccess && token && (
            <button 
              className="retry-button"
              onClick={handleRetryPayment}
            >
              Reintentar Pago
            </button>
          )}
          
          <button 
            className={`back-button ${isSuccess ? 'success' : 'failure'}`}
            onClick={handleBackToMenu}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
