import axios from 'axios';
import { TOTEAT_CONFIG } from '../toteat.config.js';

export const sendOrderToToteat = async (orderData, customer, cart) => {
    try {
        const localId = customer.deliveryType === 'delivery' ? '01' : customer.localPickup?.split('-')[0];
        const localConfig = TOTEAT_CONFIG.locations[localId];

        if (!localConfig) {
            throw new Error(`Local no encontrado: ${localId}`);
        }

        const toteatOrder = formatOrderForToteat(orderData, customer, cart, localConfig);

        // Log detallado para debug
        console.log('URL Toteat:', localConfig.orderUrl);
        console.log('Orden a enviar:', JSON.stringify(toteatOrder, null, 2));

        const response = await axios({
            method: 'post',
            url: localConfig.orderUrl, // Usa la URL completa del config
            data: toteatOrder,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Respuesta Toteat:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error Toteat:', error.response?.data || error.message);
        throw error;
    }
};

export const createToteatOrder = async (orderData, customer, cart, localId) => {
    try {
        const localConfig = TOTEAT_CONFIG.locations[localId];

        if (!localConfig) {
            throw new Error(`Local no encontrado: ${localId}`);
        }

        const toteatOrderData = formatOrderForToteat(orderData, customer, cart, localConfig);

        const response = await axios.post(
            `${TOTEAT_CONFIG.apiUrl}/external/orders`,
            toteatOrderData,
            {
                headers: {
                    'Authorization': `Bearer ${localConfig.xapitoken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Respuesta Toteat:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating order in Toteat:', error.response?.data || error.message);
        throw error;
    }
};

const formatOrderForToteat = (orderData, customer, cart, localConfig) => {
    const now = new Date().toISOString().split('.')[0]; // Formato ISO 8601 sin milisegundos
    const lineItems = formatLineItems(cart);

    return {
        restaurantId: parseInt(TOTEAT_CONFIG.restaurantId),
        localNumber: parseInt(localConfig.localNumber),
        orderReference: orderData.buyOrder.toString(),
        status: "new",
        type: customer.deliveryType === 'delivery' ? 'delivery' : 'pickup',
        channel: "webstore",
        comment: customer.comment || "",
        document: {
            payments: [{
                id: 0,
                ref: orderData.buyOrder.toString(),
                amount: parseInt(orderData.amount),
                amountPaid: parseInt(orderData.amount),
                paymentType: 50005 // Código específico para WebPay
            }],
            line: lineItems,
            customer: {
                name: customer.name,
                phoneNumber: parseInt(customer.phone.replace(/[^0-9]/g, '')),
                email: customer.email || 'dr.fries.la@gmail.com',
                delivery: customer.deliveryType === 'delivery' ? {
                    address: customer.address,
                    city: customer.city || 'Los Angeles'
                } : undefined
            }
        },
        operationDate: now,
        modifiedDate: now
    };
};

const formatLineItems = (cart) => {
    return cart.map((item, index) => {
        const basePrice = Math.round(item.price / 1.19); // Precio sin IVA
        return {
            lineNumber: index + 1,
            quantity: parseInt(item.quantity),
            productCode: item.toteatData?.productCode || item.productCode,
            comment: formatItemComments(item) || "",
            amountBeforeTax: basePrice,
            amountAfterTax: parseInt(item.price)
        };
    });
};

const formatItemComments = (item) => {
    const comments = [];
    comments.push(item.title)
    if (item.comment) {
        comments.push(item.comment);
    }

    return comments.join(' | ');
};