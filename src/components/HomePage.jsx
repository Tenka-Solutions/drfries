import React, { useEffect, useRef } from 'react';
import './HomePage.css';
import productsData from '../mocks/products.json';
import { useCart } from '../hooks/useCart.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaFire, FaMotorcycle, FaBolt, FaLeaf } from 'react-icons/fa';
import { GiFrenchFries } from 'react-icons/gi';

import caupolicanImg   from '/assets/Caupolican.jpg';
import azaleasImg      from '/assets/Azaleas.jpg';
import ricardoVicunaImg from '/assets/RicardoVicuna.jpg';
import alcazarImg      from '/assets/Alcazar.jpg';
import concepcionImg   from '/assets/Concepcion.jpg';

const FEATURES = [
  { icon: <FaFire />,       label: 'Siempre Fresco',     sub: 'Preparado al momento, sin congelados' },
  { icon: <GiFrenchFries />, label: 'Papas Artesanales', sub: 'Cortadas y fritas en el local' },
  { icon: <FaBolt />,       label: 'Rápido y Sabroso',   sub: 'Tu pedido listo en minutos' },
  { icon: <FaMotorcycle />, label: 'Delivery',            sub: 'Llegamos donde estés' },
];

const LOCATIONS = [
  { img: caupolicanImg,    name: 'Caupolicán',       url: 'https://maps.app.goo.gl/HdBun2TxiDW3prxB9' },
  { img: azaleasImg,       name: 'Las Azaleas',      url: 'https://maps.app.goo.gl/qWAszxxkeLJqkSvN6' },
  { img: ricardoVicunaImg, name: 'Ricardo Vicuña',   url: 'https://maps.app.goo.gl/UAGc7vHQiS5xJyYt6' },
  { img: alcazarImg,       name: 'Alcázar',          url: 'https://maps.app.goo.gl/cz3S2dCifcxtTiXb9' },
  { img: concepcionImg,    name: 'Mall Plaza Trébol', url: 'https://www.google.com/maps/search/Jumbo+cerca+de+Mall+Plaza+Trebol,+Concepci%C3%B3n,+Talcahuano/@-36.790927,-73.0690575,19z?entry=ttu' },
];

const HomePage = ({ onStartShopping, isCartOpen }) => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const locationsRef = useRef(null);

  const promotionProducts = productsData.products.filter(p => p.category === 'Promociones');

  const inCart = (product) => cart.some(item => item.id === product.id);

  const scrollToLocations = () => {
    locationsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    if (h >= 20) {
      Swal.fire({
        icon: 'info',
        title: 'Estamos cerrados',
        text: 'Nuestro horario es de 10:00 a 20:00 hrs. ¡Te esperamos mañana!',
        confirmButtonColor: '#9b282b',
      });
    }
  }, []);

  return (
    <div className="home-page">

      {/* ══ BRAND BAR ══ */}
      <section className="hp-brand-bar">
        <div className="hp-brand-overlay" />
        <div className="hp-brand-content">
          <span className="hp-brand-eyebrow">Los Ángeles · Concepción</span>
          <h1 className="hp-brand-title">DR. FRIES</h1>
          <p className="hp-brand-sub">El sabor que el sur se merece</p>
          <div className="hp-brand-actions">
            <button
              className="hp-btn-primary"
              onClick={() => { onStartShopping(); navigate('/products'); }}
            >
              Ver Menú
            </button>
            <button className="hp-btn-outline" onClick={scrollToLocations}>
              Nuestros Locales
            </button>
          </div>
        </div>
      </section>

      {/* ══ FEATURES STRIP ══ */}
      <section className="hp-features">
        {FEATURES.map((f, i) => (
          <div className="hp-feature" key={i}>
            <span className="hp-feature-icon">{f.icon}</span>
            <div className="hp-feature-text">
              <strong>{f.label}</strong>
              <span>{f.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ══ PROMOTIONS ══ */}
      <section className="hp-promos">
        <div className="hp-section-header">
          <h2>Promociones</h2>
          <button className="hp-see-all" onClick={() => { onStartShopping(); navigate('/products'); }}>
            Ver todo el menú →
          </button>
        </div>
        <div className="hp-promo-grid">
          {promotionProducts.map(product => (
            <div className="hp-promo-card" key={product.id}>
              <div className="hp-promo-img-wrap">
                <img src={product.img} alt={product.title} />
                <div className="hp-promo-img-overlay" />
              </div>
              <div className="hp-promo-body">
                <div className="hp-promo-info">
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </div>
                <div className="hp-promo-footer">
                  <span className="hp-promo-price">
                    ${product.price.toLocaleString('es-CL')}
                  </span>
                  <button
                    className={`hp-promo-add${inCart(product) ? ' added' : ''}`}
                    onClick={() => addToCart(product)}
                    disabled={inCart(product)}
                  >
                    {inCart(product) ? '✓ Agregado' : '+ Añadir'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ LOCATIONS ══ */}
      <section className="hp-locations" ref={locationsRef}>
        <div className="hp-section-header centered">
          <h2>Nuestros Locales</h2>
          <p>Encuéntranos en Los Ángeles y Concepción</p>
        </div>
        <div className="hp-locations-grid">
          {LOCATIONS.map((loc, i) => (
            <a
              key={i}
              href={loc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hp-location-card"
            >
              <img src={loc.img} alt={loc.name} />
              <div className="hp-location-overlay">
                <span className="hp-location-pin">📍</span>
                <span className="hp-location-name">{loc.name}</span>
                <span className="hp-location-cta">Ver en mapa →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ══ WHATSAPP BUTTON ══ */}
      <a
        href="https://wa.me/941823881"
        className={`whatsapp-button${isCartOpen ? ' hidden' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
      >
        <span className="whatsapp-pulse" />
        <span className="whatsapp-label">¡Pide por WhatsApp!</span>
        <i className="fab fa-whatsapp whatsapp-icon-fa" />
      </a>
    </div>
  );
};

export default HomePage;
