// Ejemplo de componente React
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultadoTransaccion() {
    const location = useLocation();
    const navigate = useNavigate();
    const [transactionData, setTransactionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/commit-transaction', { // Ajusta la URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al confirmar la transacción');
                }

                const data = await response.json();
                setTransactionData(data);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [location.search]);

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!transactionData) {
        return <p>No se encontraron datos de la transacción.</p>;
    }

    return (
        <div>
            <h2>Resultado de la Transacción</h2>
            {transactionData.status === "AUTHORIZED" ? (
                <div>
                    <p><strong>Estado:</strong> Autorizada</p>
                    <p><strong>Número de Orden:</strong> {transactionData.buyOrder}</p>
                    <p><strong>Monto:</strong> {transactionData.amount}</p>
                    <p><strong>Código de Autorización:</strong> {transactionData.authorizationCode}</p>
                    <p><strong>Fecha de Transacción:</strong> {transactionData.transactionDate}</p>
                    <p><strong>Tipo de Pago:</strong> {transactionData.paymentType}</p>
                    <p><strong>Cuotas:</strong> {transactionData.installmentsNumber}</p>
                    <p><strong>Últimos 4 dígitos de la tarjeta:</strong> {transactionData.last4Digits}</p>
                    <h3>Items:</h3>
                    <ul>
                        {transactionData.items.map(item => (
                            <li key={item.id}>{item.name} - Cantidad: {item.quantity} - Precio: {item.price}</li>
                        ))}
                    </ul>
                    <h3>Datos del Cliente:</h3>
                    <p><strong>Nombre:</strong> {transactionData.customer.name}</p>
                    <p><strong>Email:</strong> {transactionData.customer.email}</p>
                    {/* Muestra otros datos del cliente */}
                </div>
            ) : (
                <div>
                    <p><strong>Estado:</strong> Rechazada</p>
                    <p><strong>Error:</strong> {transactionData.error}</p>
                    <p><strong>Mensaje:</strong> {transactionData.message}</p>
                </div>
            )}
            <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
    );
}

export default ResultadoTransaccion;