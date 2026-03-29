import dotenv from 'dotenv';
import sendEmail from '../services/emailService.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

dotenv.config();

const testOrder = {
    customerName: "Cliente Prueba",
    phone: "941823881",
    address: "Dirección de Prueba",
    items: [
        { name: "Hamburguesa Test", quantity: 1, price: 1000 }
    ],
    total: 1000
};

const runTests = async () => {
    try {
        console.log('Probando email...');
        await sendEmail(testOrder);
        
        console.log('Probando WhatsApp...');
        await sendWhatsAppMessage(testOrder);
        
        console.log('✅ Pruebas completadas con éxito');
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
    process.exit(0);
};

runTests();