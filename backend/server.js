import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pkg from "transbank-sdk";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from 'dotenv';
import sendEmail from "./services/emailService.js";
import { handlePaymentSuccess } from './controllers/paymentController.js';
import https from "https";
import fs from "fs";
import { sendOrderToToteat } from "./services/toteatService.js";
import { TOTEAT_CONFIG } from "./toteat.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno del backend
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const { WebpayPlus, Options } = pkg;

// Configura Webpay Plus Para Producción
WebpayPlus.configureForProduction(
    process.env.TBK_API_KEY_ID,
    process.env.TBK_API_KEY_SECRET
);

// Middleware para redirigir HTTP a HTTPS en producción
app.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV === 'production') {
        const secureUrl = `https://${req.headers.host}${req.url}`;
        console.log(`Redirigiendo ${req.protocol}://${req.headers.host}${req.url} a ${secureUrl}`);
        return res.redirect(301, secureUrl);
    }
    next();
});

// Logging básico: solo método y ruta, sin datos sensibles
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configuración de CORS más permisiva
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Debe ser 'https://drfries.cl'
    credentials: true
}));

// Middleware para parsear JSON
app.use(bodyParser.json());

// Almacenar transacciones confirmadas para evitar duplicaciones
const confirmedTransactions = new Set();

// Limpiar transacciones antiguas cada 24 horas
setInterval(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    confirmedTransactions.clear();
    console.log('Limpieza de transacciones completada');
}, 24 * 60 * 60 * 1000);

// Almacenar temporalmente los productos de cada transacción
const transactionsData = {};

// BODY
// const paymentData = {
//     amount: Math.round(finalPrice),
//     buyOrder: `ORDEN${Date.now()}`,
//     returnUrl: 'https://drfries.cl/confirmacion',
//     items: cart.map(item => ({
//         id: item.id,
//         title: item.title,
//         quantity: item.quantity,
//         price: item.price
//     })),
//     customer: {
//         name: formData.name,
//         phone: formData.phone.replace(/\s/g, ''), // Eliminar espacios
//         email: formData.email || 'pagosweb@drfries.cl', // Email por defecto si no se proporciona
//         deliveryType: formData.deliveryType,
//         address: formData.deliveryType === 'delivery' ? formData.address : '',
//         localPickup: formData.deliveryType === 'pickup' ? formData.localPickup : '',
//         comment: formData.comment || ''
//     }
// };


app.post('/api/create-transaction', async (req, res) => {
    try {
        const { amount, buyOrder, returnUrl, items, customer, comment } = req.body;

        // Validaciones
        if (!amount || !buyOrder || !returnUrl) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        const sessionId = randomUUID();
        transactionsData[sessionId] = { items, customer };

        // Asegurarse de que amount sea número
        const parsedAmount = parseInt(amount, 10);

        const transaction = new WebpayPlus.Transaction();
        const response = await transaction.create(
            buyOrder,
            sessionId,
            parsedAmount,
            returnUrl // Usar el returnUrl recibido del frontend
        );

        // Asegurar respuesta JSON
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            token: response.token,
            url: response.url,
            sessionId: sessionId // Agregar sessionId
        });

    } catch (error) {
        console.error("Error al crear transacción:", error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: "Error al crear transacción" });
    }
});

// Endpoint para confirmar una transacción
app.post("/api/commit-transaction", async (req, res) => {
    try {
        const { token } = req.body;

        // Verificar si el token ya fue procesado
        if (confirmedTransactions.has(token)) {
            return res.status(400).json({
                status: "FAILED",
                error: "Esta transacción ya fue confirmada"
            });
        }

        const response = await new WebpayPlus.Transaction().commit(token);

        if (response.status === "AUTHORIZED") {
                        // Recuperar los items y los datos del cliente de la transacción
            // **IMPORTANTE: Usar el token como sessionId para recuperar los datos**
            confirmedTransactions.add(token);// Guardar el token como procesado
            const { items, customer } = transactionsData[response.session_id] || { items: [], customer: {} };
            delete transactionsData[response.session_id];// Limpiar el objeto temporal

            const buyOrder = response.buy_order;
            const amount = response.amount;


            // Enviar orden a Toteat
            try {
                // Validar datos antes de enviar a Toteat
                if (!items?.length || !customer?.name) {
                    console.error('Datos incompletos:', { items, customer });
                    throw new Error('Datos incompletos para Toteat');
                }
                await sendOrderToToteat(
                    {
                        buyOrder: buyOrder,
                        amount: amount,
                        paymentType: 'webpay'
                    },
                    customer,
                    items
                );
            } catch (toteatError) {
                console.error('Error al enviar orden a Toteat:', toteatError);
                // Continuar con el flujo aunque falle Toteat
            }
// Enviar el correo con el resumen de la compra y los datos del cliente
            await sendEmail(
                process.env.EMAIL_USER,
                "Nueva compra confirmada ✅",
                items,
                amount,
                buyOrder,
                customer
            );

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({
                status: "AUTHORIZED",
                buyOrder: buyOrder,
                amount: amount,
                authorizationCode: response.authorization_code,
                transactionDate: response.transaction_date,
                paymentType: response.payment_type_code,
                installmentsNumber: response.installments_number,
                last4Digits: response.card_detail.card_number.slice(-4),
                items: items,
                customer: customer
            });
        } else {
            // Asegurar respuesta JSON
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ // Cambiar status a 400 para errores
                status: "FAILED",
                error: "Transacción no autorizada",
                message: "La transacción no fue autorizada por Webpay."
            });
        }
    } catch (error) {
        console.error("Error confirmando pago:", error.message);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            status: "ERROR",
            error: "Error confirmando pago"
        });
    }
});

// Agrega esta ruta donde manejas el éxito del pago
app.post('/payment-success', handlePaymentSuccess);

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Ruta de diagnóstico
app.get("/api/health-check", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, "public_html")));

// Ruta para servir la aplicación React
app.get("  ", (req, res) => {
    res.sendFile(path.join(__dirname, "public_html", "index.html"));
});

// Ruta de prueba para verificar JSON
app.get('/api/test', (req, res) => {
    res.json({ status: 'OK' });
});

// Agregar antes de la configuración del servidor
app.use((err, req, res, next) => {
    console.error('[ERROR]', new Date().toISOString(), req.method, req.path, err.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Error interno del servidor' });
});

// Configuración condicional del servidor
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
    try {
        // Leer y limpiar certificados
        const key = fs.readFileSync("/home2/cdr51747/ssl/privkey.pem", 'utf8').trim();
        const cert = fs.readFileSync("/home2/cdr51747/ssl/cert.pem", 'utf8').trim();
        const ca = fs.readFileSync("/home2/cdr51747/ssl/fullchain.pem", 'utf8').trim();

        const sslOptions = {
            key: key,
            cert: cert,
            ca: ca
        };

        const httpsServer = https.createServer(sslOptions, app);

        httpsServer.listen(PORT, () => {
            console.log(`Servidor HTTPS iniciado en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al cargar certificados:', error);
        console.error('Detalles:', error.message);
        process.exit(1);
    }
} else {
    // Servidor HTTP para desarrollo
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
};