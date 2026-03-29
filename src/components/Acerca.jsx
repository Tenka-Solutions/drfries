import React from 'react';
import './Acerca.css';
import { FaHeart, FaBullseye, FaEye, FaStar } from 'react-icons/fa';

const VALUES = ['Integridad', 'Calidad', 'Innovación', 'Compromiso', 'Trabajo en equipo'];

const CARDS = [
  {
    icon: <FaHeart />,
    title: 'Nuestra Historia',
    content: (
      <p>
        Dr. Fries nació en 2019, fundado por dos apasionados del pollo frito con una visión clara:
        crear una experiencia gastronómica superior. Desde el principio nos comprometimos a usar
        los mejores ingredientes, viajando a distintos países para traer lo mejor de sus culturas
        al sur de Chile.
      </p>
    ),
  },
  {
    icon: <FaBullseye />,
    title: 'Nuestra Misión',
    content: (
      <p>
        Deleitar a nuestros clientes con cada bocado, creando momentos memorables y fomentando
        la conexión a través de la comida. Cada plato que preparamos lleva el mismo cuidado y
        pasión desde el primer día.
      </p>
    ),
  },
  {
    icon: <FaEye />,
    title: 'Nuestra Visión',
    content: (
      <p>
        Ser reconocidos como referentes de la industria de la comida rápida artesanal,
        destacándonos por calidad y compromiso con la excelencia. Aspiramos a expandirnos
        a nuevos mercados manteniendo siempre nuestra esencia.
      </p>
    ),
  },
  {
    icon: <FaStar />,
    title: 'Nuestros Valores',
    content: (
      <ul className="ac-values-list">
        {VALUES.map((v) => (
          <li key={v}>
            <span className="ac-values-dot" />
            {v}
          </li>
        ))}
      </ul>
    ),
  },
];

const Acerca = () => (
  <div className="ac-page">

    {/* ── Hero ── */}
    <section className="ac-hero">
      <div className="ac-hero-overlay" />
      <div className="ac-hero-content">
        <span className="ac-hero-eyebrow">Dr. Fries</span>
        <h1 className="ac-hero-title">Acerca de</h1>
        <p className="ac-hero-sub">La entrada al sur de Chile</p>
      </div>
    </section>

    {/* ── Cards ── */}
    <section className="ac-section">
      <div className="ac-grid">
        {CARDS.map((card, i) => (
          <div className="ac-card" key={i}>
            <div className="ac-card-icon">{card.icon}</div>
            <h2 className="ac-card-title">{card.title}</h2>
            <div className="ac-card-body">{card.content}</div>
          </div>
        ))}
      </div>
    </section>

  </div>
);

export default Acerca;
