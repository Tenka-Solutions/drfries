import express from 'express';
const router = express.Router();

// Validación del token de webhook
const validateWebhook = (req, res, next) => {
    const token = req.headers['x-zenvia-signature'];
    if (token !== process.env.ZENVIA_WEBHOOK_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Manejador de mensajes entrantes
router.post('/webhook/message', validateWebhook, async (req, res) => {
    try {
        const { message, from } = req.body;
        console.log('🔔 Mensaje recibido:', {
            from: from,
            message: message
        });
        
        // Procesar mensaje recibido
        res.status(200).json({ 
            success: true, 
            message: 'Mensaje recibido correctamente' 
        });
    } catch (error) {
        console.error('❌ Error en webhook de mensaje:', error);
        res.status(500).json({ error: error.message });
    }
});

// Manejador de estados de mensajes
router.post('/webhook/status', validateWebhook, async (req, res) => {
    try {
        const { messageId, status } = req.body;
        console.log('📬 Estado de mensaje actualizado:', {
            messageId: messageId,
            status: status
        });
        
        // Procesar actualización de estado
        res.status(200).json({ 
            success: true, 
            message: 'Estado actualizado correctamente' 
        });
    } catch (error) {
        console.error('❌ Error en webhook de estado:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;