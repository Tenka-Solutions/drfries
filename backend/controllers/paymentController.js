import WebpayPlus from 'transbank-sdk';
import { sendOrderToToteat } from '../services/toteatService.js';

export const handlePaymentSuccess = async (req, res) => {
    try {
        const { token_ws } = req.body;

        if (!token_ws) {
            console.error('Token no recibido');
            return res.status(400).json({ status: 'error', message: 'Token no recibido' });
        }

        console.log('Token recibido:', token_ws);

        const transaction = new WebpayPlus.Transaction();
        const response = await transaction.commit(token_ws);

        console.log('Respuesta commit:', response);

        if (response.status === 'AUTHORIZED') {
            // Recuperar datos de la sesión
            const sessionData = transactionsData[response.session_id];
            
            if (!sessionData?.customer || !sessionData?.items) {
                console.error('Datos de sesión no encontrados:', response.session_id);
                throw new Error('Datos de sesión no encontrados');
            }

            const { customer, items } = sessionData;

            try {
                const toteatResponse = await sendOrderToToteat(
                    {
                        buyOrder: response.buy_order,
                        amount: response.amount,
                        paymentType: 'webpay'
                    },
                    customer,
                    items
                );
                
                console.log('Orden enviada a Toteat:', toteatResponse);

                // Limpiar datos de la sesión
                delete transactionsData[response.session_id];

                return res.status(200).json({
                    status: 'success',
                    toteatResponse,
                    transactionDetails: response
                });
            } catch (error) {
                console.error('Error enviando orden a Toteat:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error en handlePaymentSuccess:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

export default { handlePaymentSuccess };