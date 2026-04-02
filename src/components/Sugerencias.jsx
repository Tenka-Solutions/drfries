import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './Sugerenciasnew.css';
import backgroundImage from '/assets/eventos/eventoprime.jpg'; // Import the image
import Swal from 'sweetalert2';

export function Sugerencias() {
  const [suggestionName, setSuggestionName] = useState('');
  const [suggestionPhone, setSuggestionPhone] = useState('');
  const [selectedLocal, setSelectedLocal] = useState('');
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Validación del teléfono (9 dígitos y empieza con 9)
  const validatePhone = (phone) => {
    const phonePattern = /^9\d{8}$/; // Expresión regular para un teléfono chileno válido
    return phonePattern.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', {
      suggestionName,
      suggestionPhone,
      selectedLocal,
      suggestionMessage,
    }); // Log form data

    // Verifica que todos los campos estén llenos y que el teléfono sea válido
    if (!suggestionName || !suggestionPhone || !selectedLocal || !suggestionMessage) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!validatePhone(suggestionPhone)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        html: 'Por favor, ingresa un número de teléfono válido <br> (9 dígitos, comenzando con 9).',
      });
      return;
    }

    const templateParams = {
      from_name: suggestionName,
      phone: suggestionPhone,
      local: selectedLocal,
      message: suggestionMessage,
    };

    setLoading(true);

    try {
      const response = await emailjs.send(
        'service_dx5un5e',            
        'template_djoq3vo',           
        templateParams,               
        'PTaHa_dymb4InS8uh'           
      );
      console.log('SUCCESS!', response);
      Swal.fire({
        icon: 'success',
        title: '¡Muchas Gracias!',
        html: 'Tu sugerencia ha sido enviada con éxito.<br>¡Gracias por tu aporte!.',
      });
    } catch (error) {
      console.error('FAILED...', error);
      alert('Ocurrió un error al enviar la sugerencia');
    } finally {
      setLoading(false);
      setSuggestionName('');
      setSuggestionPhone('');
      setSelectedLocal('');
      setSuggestionMessage('');
    }
  };

  return (
    <div className="background-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="contact-sugerencias">
        <div className="section-header">
          <h1>Formulario de Sugerencias</h1>
          <p>Por favor, llena el formulario con tus sugerencias.</p>
        </div>
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="suggestionName">Nombre:</label>
            <input
              type="text"
              id="suggestionName"
              value={suggestionName}
              onChange={(e) => setSuggestionName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="suggestionPhone">Teléfono:</label>
            <input
              type="tel"
              id="suggestionPhone"
              value={suggestionPhone}
              onChange={(e) => setSuggestionPhone(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="selectedLocal">Local Seleccionado:</label>
            <select
              id="selectedLocal"
              value={selectedLocal}
              onChange={(e) => setSelectedLocal(e.target.value)}
              className="form-control select-dropdown"
              required
              style={{
                maxWidth: "100%",
                width: "100%",
                boxSizing: "border-box",
                color: "#9b282b",
                fontSize: "14px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              <option value="">Selecciona un local</option>
              <option value="01 Caupolicán">01 Caupolicán</option>
              <option value="02 Las Azaleas">02 Las Azaleas</option>
              <option value="03 Alcazar">03 Alcazar</option>
              <option value="04 Ricardo Vicuña">04 Ricardo Vicuña</option>
              <option value="05 Concepción">05 Concepción</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="suggestionMessage">Sugerencia:</label>
            <textarea
              id="suggestionMessage"
              value={suggestionMessage}
              onChange={(e) => setSuggestionMessage(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn custom-btn" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Sugerencia'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Sugerencias;
