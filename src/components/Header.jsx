import { useState, useEffect, useRef } from 'react';
import './Header.css';
import logo from '/assets/12.png';
import bolsa from '/assets/bolsa.svg';
import { useCart } from '../hooks/useCart.js';
import { useNavigate } from 'react-router-dom';

export function Header({ onNavigate, onSearchTextChange, toggleCart }) {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      closeMenu();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (link) => {
    closeMenu();
    onNavigate(link);
    navigate(`/${link}`);
  };

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    onSearchTextChange(text);
    onNavigate('products');
    navigate('/products');
  };

  return (
    <header className="header" ref={menuRef}>
      <div className="navbar">
        <button
          type="button"
          className={`navbar-toggler${menuOpen ? ' open' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleMenu(); }}
          aria-label="Abrir menú"
        >
          <span />
          <span />
          <span />
        </button>
        <a
          href="#"
          className="navbar-brand"
          onClick={(e) => { e.preventDefault(); handleLinkClick('inicio'); }}
        >
          <img src={logo} alt="Dr. Fries" className="logo-image" />
        </a>
        <div className={`navbar-collapse${menuOpen ? ' show' : ''}`} onClick={(e) => e.stopPropagation()}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleLinkClick('inicio')}>Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleLinkClick('products')}>Menú</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleLinkClick('eventos')}>Eventos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleLinkClick('contacto')}>Contacto</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => handleLinkClick('acerca')}>Acerca de</a>
            </li>
          </ul>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
        <button className="cart-button" onClick={toggleCart}>
          <img src={bolsa} alt="Cart" className="cart-icon" />
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </button>
      </div>
    </header>
  );
}

export default Header;
