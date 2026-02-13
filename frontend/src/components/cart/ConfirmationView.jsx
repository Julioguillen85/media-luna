import React from 'react';
import { CheckCircle, MessageCircle } from 'lucide-react';

const BUSINESS_PHONE = "523123099318";

export default function ConfirmationView({ order, onBack }) {
    const itemsText = (order.items || []).map(i => { let text = `- ${i.name}`; if (i.customization) { const sizeLabel = i.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'; text += ` (${sizeLabel})\n     Base: ${i.customization.bases.join(", ")}\n     Comp: ${i.customization.complements.join(", ")}\n     Top: ${i.customization.toppings.join(", ")}`; } return text; }).join('\n\n');
    const waMessage = `Hola Media Luna! 🌙🍉\n*Solicito cotización para este pedido:*\n\nCliente: ${order.customer}\nPersonas: ${order.peopleCount}\nFecha: ${order.date} ${order.time}\n\n*Detalle de Solicitud:*\n${itemsText}`;
    const waLink = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${encodeURIComponent(waMessage)}`;

    return (
        <div className="flex flex-col items-center justify-center pt-10 px-4">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border-t-8 border-rose-500">
                <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                <h2 className="text-3xl font-extrabold mb-2 text-slate-900">¡Solicitud Enviada!</h2>
                <p className="text-slate-600 mb-6">Gracias {order.customer}. Hemos recibido tu solicitud. Un asesor de Media Luna revisará disponibilidad y te contactará al {order.phone} para enviarte la cotización.</p>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#25D366] text-white font-bold py-3 rounded-xl mt-6 flex justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><MessageCircle /> Agilizar por WhatsApp (Opcional)</a>
                <button onClick={onBack} className="mt-4 text-slate-400 underline">Volver</button>
            </div>
        </div>
    );
}
