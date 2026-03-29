import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Contacto.css';
import backgroundImage from '/assets/prueba_contacto2.jpg'; 
import Swal from 'sweetalert2'; // Importar SweetAlert2

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    city: '', // Ciudad con selección obligatoria
    address: '', // Dirección
    dob: '', // Fecha de nacimiento
  });

  const [status, setStatus] = useState('');

  // Validación del teléfono (9 dígitos y empieza con 9)
  const validatePhone = (phone) => {
    const phonePattern = /^9\d{8}$/; // Expresión regular para un teléfono chileno válido
    return phonePattern.test(phone);
  };
  
  const validateDob = (dob) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
  
    return age >= 18;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitContact = (e) => {
    e.preventDefault();
    console.log('Form data:', formData); // Log form data

    // Verifica que todos los campos estén llenos y que el teléfono sea válido
    if (!formData.name || !formData.email || !formData.phone || !formData.city || !formData.message) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono inválido',
        html: 'Por favor, ingresa un número de teléfono válido <br> (9 dígitos, comenzando con 9).',
      });
      return;
    }

    if(!validateDob(formData.dob)) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha de nacimiento inválida',
        html: 'Por favor, ingresa una fecha de nacimiento valida.',
      });
      return;
    }

    emailjs
      .send(
        'service_dx5un5e', // Tu nuevo servicio de EmailJS
        'template_z30mt3i', // ID de la plantilla de contacto
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          city: formData.city, // Ciudad seleccionada
          address: formData.address, // Dirección
          dob: formData.dob, // Fecha de nacimiento
        },
        'PTaHa_dymb4InS8uh' // Tu nueva clave pública de EmailJS
      )
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
          Swal.fire({
            icon: 'success',
            title: '¡Solicitud enviada!',
            text: 'Tu solicitud ha sido enviada con éxito.',
          });
          setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
            city: '', // Reiniciar selección de ciudad
            address: '', // Reiniciar dirección
            dob: '', // Reiniciar fecha de nacimiento
          });
        },
        (err) => {
          console.error('FAILED...', err);
          setStatus('Ocurrió un error al enviar el correo.');
        }
      );
  };

  return (
   <div className="background-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
     <div className="contact">
       <div className="container">
         <div className="section-header">
           <h1>Trabaja con Nosotros</h1>
           <p>Por favor ingresa tus datos para contactarte.</p>
         </div>

         <div className="contact-form">
           <div className="col-md-12">
             <form onSubmit={handleSubmitContact}>
               <h3> Contacto</h3>
               <div className="control-group">
                 <input
                   type="text"
                   name="name"
                   className="form-control"
                   placeholder="Nombre Completo"
                   required
                   value={formData.name}
                   onChange={handleChange}
                 />
               </div>
               <div className="control-group">
                 <input
                   type="email"
                   name="email"
                   className="form-control"
                   placeholder="Email"
                   required
                   value={formData.email}
                   onChange={handleChange}
                 />
               </div>
               <div className="control-group">
                 <input
                   type="tel"
                   name="phone"
                   className="form-control"
                   placeholder="Teléfono"
                   required
                   value={formData.phone}
                   onChange={handleChange}
                 />
               </div>

               <div className="control-group">
                 <select
                   name="city"
                   className="form-control"
                   required
                   value={formData.city}
                   onChange={handleChange}
                   style={{
                    color: "#9b282b",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                   }}
                 >
                   <option value="">Seleccione una ciudad</option>
                   <option value="Los Ángeles">Los Ángeles</option>
                   <option value="Concepción">Concepción</option>
                 </select>
               </div>

               <div className="control-group">
                 <input
                   type="text"
                   name="address"
                   className="form-control"
                   placeholder="Dirección"
                   value={formData.address}
                   onChange={handleChange}
                 />
               </div>

               <div className="control-group">
                 <input
                   type="date"
                   name="dob"
                   className="form-control"
                   required
                   value={formData.dob}
                   onChange={handleChange}
                   style={{
                    color: "#9b282b",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "14px",
                   }}
                 />
               </div>

               <div className="control-group">
                 <textarea
                   name="message"
                   className="form-control"
                   placeholder="Cuéntanos sobre ti"
                   required
                   value={formData.message}
                   onChange={handleChange}
                 ></textarea>
               </div>

               <div>
                 <button className="btn custom-btn" type="submit">
                   Enviar Solicitud
                 </button>
               </div>
             </form>
           </div>
         </div>

         {status && (
           <div className="section-header text-center">
             <p className="status-message">{status}</p>
           </div>
         )}
       </div>
     </div>
    </div>
   );
};

export default Contacto;