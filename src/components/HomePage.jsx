import React, { useEffect, useMemo, useRef } from 'react';
import './HomePage.css';
import { useCart } from '../hooks/useCart.js';
import { useFudoCatalog } from '../hooks/useFudoCatalog.js';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaMotorcycle, FaBolt, FaClock } from 'react-icons/fa';
import { GiFrenchFries } from 'react-icons/gi';

import caupolicanImg from '/assets/Caupolican.jpg';
import azaleasImg from '/assets/Azaleas.jpg';
import ricardoVicunaImg from '/assets/RicardoVicuna.jpg';
import alcazarImg from '/assets/Alcazar.jpg';
import concepcionImg from '/assets/Concepcion.jpg';

const FEATURES = [
  { icon: <FaClock />, label: 'Ahora Tambien 24 Hrs', sub: 'Horario nocturno 22:00 a 06:00' },
  { icon: <GiFrenchFries />, label: 'Papas Naturales', sub: 'Cortadas y fritas en el local' },
  { icon: <FaBolt />, label: 'Rapido y Sabroso', sub: 'Tu pedido listo en minutos' },
  { icon: <FaMotorcycle />, label: 'Delivery', sub: 'Llegamos donde estes' },
];

const LOCATIONS = [
  { img: caupolicanImg, name: 'Caupolican', url: 'https://maps.app.goo.gl/HdBun2TxiDW3prxB9' },
  { img: azaleasImg, name: 'Las Azaleas', url: 'https://maps.app.goo.gl/qWAszxxkeLJqkSvN6' },
  { img: ricardoVicunaImg, name: 'Ricardo Vicuna', url: 'https://maps.app.goo.gl/UAGc7vHQiS5xJyYt6' },
  { img: alcazarImg, name: 'Alcazar', url: 'https://maps.app.goo.gl/cz3S2dCifcxtTiXb9' },
  {
    img: concepcionImg,
    name: 'Mall Plaza Trebol',
    url: 'https://www.google.com/maps/search/Jumbo+cerca+de+Mall+Plaza+Trebol,+Concepci%C3%B3n,+Talcahuano/@-36.790927,-73.0690575,19z?entry=ttu',
  },
];

function getPromoProducts(products = []) {
  const availableProducts = products.filter((product) => product.available);
  const promotions = availableProducts.filter((product) => product.category === 'Promociones');

  if (promotions.length > 0) {
    return promotions.slice(0, 6);
  }

  return availableProducts.slice(0, 6);
}

const HomePage = ({ onStartShopping, isCartOpen }) => {
  const { addToCart, cart } = useCart();
  const { products } = useFudoCatalog();
  const navigate = useNavigate();
  const locationsRef = useRef(null);

  const promotionProducts = useMemo(() => getPromoProducts(products), [products]);
  const promotionsTitle = promotionProducts.some((product) => product.category === 'Promociones')
    ? 'Promociones'
    : 'Destacados del menu';

  const inCart = (product) => cart.some((item) => item.productId === product.productId);

  const scrollToLocations = () => {
    locationsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 20) {
      Swal.fire({
        icon: 'info',
        title: 'Estamos cerrados',
        text: 'Nuestro horario es de 10:00 a 20:00 hrs. Te esperamos manana.',
        confirmButtonColor: '#9b282b',
      });
    }
  }, []);

  return (
    <div className="home-page">
      <section className="hp-brand-bar">
        <div className="hp-brand-overlay d-none d-lg-block" />
        <div className="hp-brand-content ">
          <span className="hp-brand-eyebrow d-none d-lg-block ">Los Angeles · Concepcion</span>
          <h1 className="hp-brand-title d-none d-lg-block">DR. FRIES</h1>
          <p className="hp-brand-sub d-none d-lg-block">El sabor que el sur se merece</p>
          <div className="hp-brand-actions d-none d-lg-block">
            <button
              className="hp-btn-primary"
              onClick={() => {
                onStartShopping();
                navigate('/products');
              }}
            >
              Ver Menu
            </button>
            <button className="hp-btn-outline" onClick={scrollToLocations}>
              Nuestros Locales
            </button>
          </div>
        </div>
      </section>

      <section className="hp-features d-none d-lg-flex">
        {FEATURES.map((feature, index) => (
          <div className="hp-feature" key={index}>
            <span className="hp-feature-icon">{feature.icon}</span>
            <div className="hp-feature-text">
              <strong>{feature.label}</strong>
              <span>{feature.sub}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="hp-promos">
        <div className="hp-section-header">
          <h2>{promotionsTitle}</h2>
          <button
            className="hp-see-all"
            onClick={() => {
              onStartShopping();
              navigate('/products');
            }}
          >
            Ver todo el menu →
          </button>
        </div>
        <div className="hp-promo-grid">
          {promotionProducts.map((product) => {
            const imageSrc = product.img || product.imageUrl || '/assets/promociones/Insuperable.png';
            const isAdded = inCart(product);

            return (
              <div className="hp-promo-card" key={product.productId}>
                <div className="hp-promo-img-wrap">
                  <img src={imageSrc} alt={product.title} />
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
                      className={`hp-promo-add${isAdded ? ' added' : ''}`}
                      onClick={() => addToCart(product)}
                      disabled={isAdded || !product.available}
                    >
                      {!product.available ? 'Sin stock' : isAdded ? '✓ Agregado' : '+ Anadir'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="hp-locations" ref={locationsRef}>
        <div className="hp-section-header centered">
          <h2>Nuestros Locales</h2>
          <p>Encuentranos en Los Angeles y Concepcion</p>
        </div>
        <div className="hp-locations-grid">
          {LOCATIONS.map((location, index) => (
            <a
              key={index}
              href={location.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hp-location-card"
            >
              <img src={location.img} alt={location.name} />
              <div className="hp-location-overlay">
                <span className="hp-location-pin">📍</span>
                <span className="hp-location-name">{location.name}</span>
                <span className="hp-location-cta">Ver en mapa →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <a
        href="https://wa.me/941823881"
        className={`whatsapp-button${isCartOpen ? ' hidden' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactanos por WhatsApp"
      >
        <span className="whatsapp-pulse" />
        <span className="whatsapp-label">Pide por WhatsApp</span>
        <i className="fab fa-whatsapp whatsapp-icon-fa" />
      </a>
    </div>
  );
};

export default HomePage;
