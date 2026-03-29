const API_BASE_URL = 'https://drfries.cl/api';

export class PaymentService {
    static async createTransaction(paymentData) {
        try {
            console.log('Enviando datos:', paymentData);
            
            const response = await fetch(`${API_BASE_URL}/create-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(paymentData),
                credentials: 'include'
            });

            // Log de la respuesta raw
            console.log('Respuesta status:', response.status);
            console.log('Respuesta headers:', [...response.headers.entries()]);

            // Verificar el tipo de contenido
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Respuesta no JSON:', text);
                throw new Error('El servidor no respondió con JSON válido');
            }

            const data = await response.json();
            console.log('Respuesta parseada:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error en la transacción');
            }

            return data;
        } catch (error) {
            console.error('Error en createTransaction:', error);
            throw error;
        }
    }
}