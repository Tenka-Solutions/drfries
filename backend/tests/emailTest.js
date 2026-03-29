import dotenv from 'dotenv';
import sendEmail from '../services/emailService.js';

dotenv.config();

const testEmail = async () => {
    try {
        await sendEmail(
            'pagosweb@drfries.cl', // correo de prueba
            '🍔 Prueba de Correo Dr. Fries',
            [
                {name: 'Hamburguesa Test', quantity: 1, price: 1000}
            ],
            1000,
            'TEST-001',
            {
                name: 'Cliente Prueba',
                phone: '941823881',
                address: 'Dirección Prueba'
            }
        );
        console.log('✅ Email de prueba enviado correctamente');
    } catch (error) {
        console.error('❌ Error en prueba de email:', error);
    }
    process.exit(0);
};

testEmail();