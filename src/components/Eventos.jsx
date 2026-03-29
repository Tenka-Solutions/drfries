import React, { useState, useEffect } from 'react';
import './Eventos.css';
import { FaWhatsapp, FaCalendarAlt, FaUsers, FaUtensils } from "react-icons/fa";

const evento2mp4 = '/assets/eventos/evento2.mp4';
const evento2    = '/assets/eventos/evento2.jpg';
const eventoanime = '/assets/eventos/eventoanime.jpg';
const evento3    = '/assets/eventos/evento3.jpg';
const evento4    = '/assets/eventos/evento4.jpg';
const eventodepa = '/assets/eventos/eventosdepa.png';
const eventopasto = '/assets/eventos/eventopasto.jpg';

const CARDS = [
  {
    images: [evento3, eventodepa],
    title: 'Creando Recuerdos Inolvidables',
    desc: 'Cada celebración merece el sabor y la energía que solo Dr. Fries puede ofrecer.',
  },
  {
    images: [eventopasto, evento4],
    title: 'Un Equipo Comprometido con el Sabor',
    desc: 'Nuestro equipo se encarga de cada detalle para que disfrutes sin preocupaciones.',
  },
  {
    images: [eventoanime, evento2],
    title: 'La Felicidad de Compartir',
    desc: 'Desde cumpleaños hasta eventos corporativos, hacemos que cada momento sea especial.',
  },
];

const PERKS = [
  { icon: <FaCalendarAlt />, label: 'Agenda flexible', sub: 'Nos adaptamos a tu fecha y horario' },
  { icon: <FaUsers />,       label: 'Grupos grandes',  sub: 'Capacidad para eventos de cualquier tamaño' },
  { icon: <FaUtensils />,    label: 'Menú especial',   sub: 'Propuestas personalizadas para tu evento' },
];

export function Eventos() {
  const [currentImages, setCurrentImages] = useState(CARDS.map(() => 0));

  useEffect(() => {
    const intervals = CARDS.map((_, i) =>
      setInterval(() => {
        setCurrentImages(prev => {
          const next = [...prev];
          next[i] = (next[i] + 1) % CARDS[i].images.length;
          return next;
        });
      }, 3500 + i * 700)
    );
    return () => intervals.forEach(clearInterval);
  }, []);

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      "Hola, estoy visitando la página web de Dr. Fries y quiero reservar un evento. ¿Podrían darme más información?"
    );
    window.open(`https://wa.me/56941823881?text=${msg}`, '_blank');
  };

  return (
    <div className="eventos-page">

      {/* ── Hero video ── */}
      <section className="eventos-hero">
        <video autoPlay loop muted playsInline className="eventos-hero-video">
          <source src={evento2mp4} type="video/mp4" />
        </video>
        <div className="eventos-hero-overlay" />
        <div className="eventos-hero-content">
          <span className="eventos-hero-eyebrow">Dr. Fries</span>
          <h1 className="eventos-hero-title">Eventos</h1>
          <p className="eventos-hero-sub">Cada evento, una experiencia única</p>
          <button className="eventos-hero-cta" onClick={handleWhatsApp}>
            <FaWhatsapp /> Reserva tu evento
          </button>
        </div>
      </section>

      {/* ── Perks strip ── */}
      <section className="eventos-perks">
        {PERKS.map((p, i) => (
          <div className="eventos-perk" key={i}>
            <span className="eventos-perk-icon">{p.icon}</span>
            <div>
              <strong>{p.label}</strong>
              <span>{p.sub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Gallery cards ── */}
      <section className="eventos-gallery">
        <div className="eventos-gallery-header">
          <h2>Momentos que inspiran</h2>
          <p>Mira cómo transformamos cada reunión en un recuerdo que vale la pena recordar.</p>
        </div>
        <div className="eventos-cards">
          {CARDS.map((card, i) => (
            <div className="eventos-card" key={i}>
              <div className="eventos-card-img-wrap">
                {card.images.map((src, j) => (
                  <img
                    key={j}
                    src={src}
                    alt={card.title}
                    className={`eventos-card-img ${currentImages[i] === j ? 'active' : ''}`}
                  />
                ))}
                <div className="eventos-card-overlay" />
              </div>
              <div className="eventos-card-body">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA bottom ── */}
      <section className="eventos-cta">
        <div className="eventos-cta-inner">
          <h2>¿Listo para organizar tu evento?</h2>
          <p>Contáctanos por WhatsApp y te ayudamos a planificar cada detalle.</p>
          <button className="eventos-cta-btn" onClick={handleWhatsApp}>
            <FaWhatsapp />
            Escríbenos ahora
          </button>
        </div>
      </section>

    </div>
  );
}

export default Eventos;
