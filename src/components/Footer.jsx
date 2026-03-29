import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">

          {/* Dirección */}
          <div className="footer-section">
            <h2>Nuestros Locales</h2>
            <ul className="footer-list">
              <li>
                <a href="https://maps.app.goo.gl/HdBun2TxiDW3prxB9" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-map-marker-alt"></i> Caupolicán 654
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/qWAszxxkeLJqkSvN6" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-map-marker-alt"></i> Las Azaleas 604
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/UAGc7vHQiS5xJyYt6" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-map-marker-alt"></i> Ricardo Vicuña 284
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/cz3S2dCifcxtTiXb9" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-map-marker-alt"></i> Pje Alcázar 635
                </a>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/cz3S2dCifcxtTiXb9" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-map-marker-alt"></i> Mall Trébol, Concepción
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto y horario */}
          <div className="footer-section">
            <h2>Contacto</h2>
            <ul className="footer-list">
              <li>
                <a href="https://wa.me/56941823881" target="_blank" rel="noopener noreferrer">
                  <i className="fa fa-phone-alt"></i> +56 9 4182 3881
                </a>
              </li>
              <li>
                <a href="mailto:contacto@drfries.cl">
                  <i className="fa fa-envelope"></i> contacto@drfries.cl
                </a>
              </li>
            </ul>

            <h2 style={{ marginTop: '20px' }}>Horario</h2>
            <ul className="footer-list">
              <li><a href="#"><i className="fa fa-clock"></i> Lun – Sáb: 10:30 – 19:30</a></li>
              <li><a href="#"><i className="fa fa-clock"></i> Dom: 11:00 – 18:30</a></li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="footer-section">
            <h2>Síguenos</h2>
            <div className="social-icons">
              <a
                className="fb"
                href="https://web.facebook.com/dr.frieschile"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                className="ig"
                href="https://www.instagram.com/dr.frieschile/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                className="wa"
                href="https://wa.me/56941823881"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <p>Copyright &copy; <a href="https://drfries.cl">Dr. Fries</a> — Todos los derechos reservados.</p>
        <p>Diseñado por <a href="https://www.linkedin.com/in/ricardo-rojas-186178192/" target="_blank" rel="noopener noreferrer">Küpan</a></p>
      </div>
    </footer>
  );
};

export default Footer;
