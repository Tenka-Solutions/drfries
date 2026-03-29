import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Servidor SMTP
    port: process.env.SMTP_PORT, // Puerto SMTP
    secure: true, // Usa SSL (465) o false para TLS (587)
    auth: {
        user: process.env.EMAIL_USER, // Tu correo corporativo
        pass: process.env.EMAIL_PASS, // La contraseña de cPanel
    },
});

export const sendEmail = async (to, subject, items, totalAmount, buyOrder, customer) => {
    try {
        if (!Array.isArray(items) || items.length === 0) {
            console.error("Error: items no es un array o está vacío", items);
            items = [];
        }

        // Obtener la fecha actual con formato legible
        const fecha = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        // Construcción del listado de productos
        let itemsList = items.length > 0
            ? items.map(item => `- ${item.title} (x${item.quantity}): $${item.price * item.quantity}`).join("\n") : "No se recibieron productos en la compra.";

        // Determinar si es delivery o pickup y agregar la información correspondiente
        let deliveryInfo = "";
        if (customer.deliveryType === 'delivery') {
            deliveryInfo = `- Dirección: ${customer.address}`;
        } else if (customer.deliveryType === 'pickup') {
            deliveryInfo = `- Retiro en local: ${customer.localPickup}`; // Asegúrate de que customer.localPickup contenga el nombre del local
        }

        // Mensaje con el formato solicitado, incluyendo los datos del cliente
        const message = `💰 Se ha registrado un nuevo pago.\n\n📌 Monto: $${totalAmount}\n\n🛒 Items:\n${itemsList}\n\n👤 Datos del cliente:\n- Nombre: ${customer.name}\n${deliveryInfo}\n- Teléfono: ${customer.phone}\n\n🛍️ Orden de compra: ${buyOrder}\n\n📅 Fecha: ${fecha}`;

        const info = await transporter.sendMail({
            from: `"DrFries" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message,
        });

        console.log("Correo enviado:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error enviando correo:", error);
        return { success: false, error };
    }
};

export default sendEmail;
