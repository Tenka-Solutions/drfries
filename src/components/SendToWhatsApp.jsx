import React from 'react';
import './SendToWhatsApp.css';

export function SendToWhatsApp() {
  const phoneNumber = '56941823881'; // Verifica que este número tiene WhatsApp
  const message = encodeURIComponent(
    "Hola, estoy visitando la página web de Dr. Fries y quiero reservar un evento. ¿Podrían darme más información?"
  );

  const sendMessage = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button className="btn send-whatsapp-btn" onClick={sendMessage}>
      <span>📅 Reserva tu evento</span>
    </button>
  );
}
