import { Client } from '@zenvia/sdk';

const client = new Client(process.env.ZENVIA_API_TOKEN);
const whatsapp = client.getChannel('whatsapp');

export const sendWhatsAppMessage = async (order) => {
    try {
        const message = `
🍟 *NUEVO PEDIDO DR. FRIES* 🍔

*Cliente:* ${order.customerName}
*Teléfono:* ${order.phone}
*Dirección:* ${order.address}

*PRODUCTOS:*
${order.items.map(item => `• ${item.quantity}x ${item.name} - $${item.price}`).join('\n')}

*Total:* $${order.total}

*Estado:* ✅ Pagado`;

        const response = await whatsapp.sendMessage(
            process.env.ZENVIA_SENDER_ID,
            process.env.BUSINESS_PHONE_NUMBER,
            { type: 'text', content: message }
        );

        console.log('✅ WhatsApp enviado:', response);
        return response;
    } catch (error) {
        console.error('❌ Error enviando WhatsApp:', error);
        throw error;
    }
};