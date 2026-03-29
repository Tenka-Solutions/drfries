import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contacto.css';
import Swal from 'sweetalert2';
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const Contacto = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validatePhone = (phone) => /^9\d{8}$/.test(phone);

  const handleSubmitContact = (e) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        html: 'Por favor, ingresa un número válido<br>(9 dígitos, comenzando con 9).',
        confirmButtonColor: '#9b282b',
      });
      return;
    }

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { name: formData.name, email: formData.email, phone: formData.phone, message: formData.message },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          Swal.fire({ icon: 'success', title: '¡Enviado!', text: 'Tu mensaje fue enviado con éxito.', confirmButtonColor: '#9b282b' });
          setFormData({ name: '', email: '', phone: '', message: '' });
        },
        () => {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo enviar el mensaje. Intenta de nuevo.', confirmButtonColor: '#9b282b' });
        }
      );
  };

  return (
    <div className="ct-page">

      {/* ── Hero ── */}
      <section className="ct-hero">
        <div className="ct-hero-overlay" />
        <div className="ct-hero-content">
          <span className="ct-hero-eyebrow">Dr. Fries</span>
          <h1 className="ct-hero-title">Contacto</h1>
          <p className="ct-hero-sub">Estamos aquí para ayudarte</p>
        </div>
      </section>

      {/* ── Main ── */}
      <section className="ct-main">
        <div className="ct-grid">

          {/* Info sidebar */}
          <div className="ct-info">
            <h2 className="ct-info-title">Hablemos</h2>
            <p className="ct-info-desc">
              ¿Tienes dudas, quieres hacer una reserva o dejarnos un comentario?
              Escríbenos y te respondemos a la brevedad.
            </p>
            <ul className="ct-info-list">
              <li>
                <span className="ct-info-icon wa"><FaWhatsapp /></span>
                <span>+56 9 4182 3881</span>
              </li>
              <li>
                <span className="ct-info-icon ig"><FaInstagram /></span>
                <span>@drfries.cl</span>
              </li>
              <li>
                <span className="ct-info-icon pin"><FaMapMarkerAlt /></span>
                <span>Los Ángeles &amp; Concepción, Chile</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="ct-form-wrap">
            <form onSubmit={handleSubmitContact} className="ct-form" noValidate>
              <div className="ct-row">
                <div className="ct-field">
                  <label htmlFor="ct-name">Nombre completo</label>
                  <input id="ct-name" type="text" name="name" placeholder="Tu nombre" required value={formData.name} onChange={handleChange} />
                </div>
                <div className="ct-field">
                  <label htmlFor="ct-email">Correo electrónico</label>
                  <input id="ct-email" type="email" name="email" placeholder="tu@email.com" required value={formData.email} onChange={handleChange} />
                </div>
              </div>
              <div className="ct-field">
                <label htmlFor="ct-phone">Teléfono</label>
                <input id="ct-phone" type="tel" name="phone" placeholder="9XXXXXXXX" required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="ct-field">
                <label htmlFor="ct-msg">Mensaje</label>
                <textarea id="ct-msg" name="message" placeholder="¿Cómo podemos ayudarte?" required rows={5} value={formData.message} onChange={handleChange} />
              </div>
              <button type="submit" className="ct-submit">
                <FaPaperPlane /> Enviar mensaje
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Contacto;
