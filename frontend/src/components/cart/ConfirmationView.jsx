import React from 'react';
import { CheckCircle, MessageCircle, CalendarDays, Clock, MapPin, Receipt, Gift } from 'lucide-react';
import { isDiscountActive } from '../../lunitaUtils';

const BUSINESS_PHONE = "523123099318";

export default function ConfirmationView({ order, onBack }) {
    // 15% discount only active from 8 AM to 10 PM
    const discountApplies = isDiscountActive();

    // Calculate totals
    const subtotal = (order.items || []).reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    const snackSubtotal = (order.items || []).filter(item => !item.isRental && !item.category?.includes('Renta') && item.productType !== 'RENTAL').reduce((acc, item) => acc + (item.totalPrice || 0), 0);
    const discountAmount = discountApplies ? snackSubtotal * 0.15 : 0;
    const total = subtotal - discountAmount;

    // Build items generic text for WhatsApp
    const snacks = (order.items || []).filter(item => !item.isRental && !item.category?.includes('Renta') && item.productType !== 'RENTAL');
    const rentals = (order.items || []).filter(item => item.isRental || item.category?.includes('Renta') || item.productType === 'RENTAL');

    let itemsText = '';

    if (snacks.length > 0) {
        itemsText += '🍿 *SNACKS:*\n';
        itemsText += snacks.map((item) => {
            const itemName = item.name || item.product?.name || '';
            const isRentalItem = item.isRental || item.category?.includes('Renta') || item.productType === 'RENTAL' || /tablón|tablon|mesa|silla|brincolín/i.test(itemName);

            if (item.customization) {
                let text = `• ${itemName}`;
                if (item.customization.size) {
                    const sizeText = item.customization.size === 'quarter' ? 'Bowl 1/4' : item.customization.size === 'half' ? 'Bowl 1/2' : item.customization.size;
                    text += ` (${sizeText})`;
                }
                if (item.quantity > 0) {
                    if (isRentalItem) text += ` (x${item.quantity})`;
                    else {
                        text += item.quantity === 1 ? ` (Para 1 persona)` : ` (Para ${item.quantity} personas)`;
                        const durationText = item.quantity >= 50 ? '2 horas' : '1 hora y 30 minutos';
                        text += `\n     ⏱️ Servicio de ${durationText}`;
                    }
                }
                text += '\n';
                if (item.customization.bases && item.customization.bases.length > 0) text += `     Base: ${item.customization.bases.join(', ')}\n`;
                if (item.customization.complements && item.customization.complements.length > 0) text += `     Comp: ${item.customization.complements.join(', ')}\n`;
                if (item.customization.toppings && item.customization.toppings.length > 0) text += `     Top: ${item.customization.toppings.join(', ')}\n`;
                return text.trimEnd();
            }
            if (isRentalItem) {
                return item.quantity > 1 ? `• ${itemName} (x${item.quantity}) - $${item.totalPrice}` : `• ${itemName} - $${item.totalPrice}`;
            }

            const durationText = item.quantity >= 50 ? '2 horas' : '1 hora y 30 minutos';
            return `• ${itemName} ${item.quantity === 1 ? '(Para 1 persona)' : `(Para ${item.quantity || 1} personas)`}\n     ⏱️ Servicio de ${durationText}\n     - $${item.totalPrice}`;
        }).join('\n\n');
    }

    if (rentals.length > 0) {
        itemsText += snacks.length > 0 ? '\n\n' : '';
        itemsText += '🪑 *RENTA DE EQUIPO:*\n';
        itemsText += rentals.map(item => `• ${item.name} (x${item.quantity}) - $${item.totalPrice}`).join('\n');
    }

    // Include discount in WhatsApp message if applicable
    let pricingText = `\n\n💰 *Total regular:* $${subtotal.toLocaleString('es-MX')}`;
    if (discountApplies && snackSubtotal > 0) {
        pricingText += `\n✨ *Si apartas tu fecha HOY:* $${total.toLocaleString('es-MX')}`;
    } else {
        pricingText = `\n\n💰 *Total Estimado:* $${total.toLocaleString('es-MX')}`;
    }

    const waMessage = `🌙 *PEDIDO MEDIA LUNA SNACK BAR*\n\n👤 *Cliente:* ${order.customer}\n📱 *WhatsApp:* ${order.phone}\n📍 *Lugar:* ${order.eventLocation}\n📅 *Fecha:* ${order.date}\n🕐 *Hora:* ${order.time}\n\n📦 *PRODUCTOS:*\n${itemsText}${pricingText}\n\n💬 Acabo de hacer esta solicitud en la página. Me gustaría consultar la disponibilidad. ¡Gracias! 😊`;
    const waLink = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(waMessage)}`;

    // Helper to format string time "14:00" into "02:00 PM"
    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;

        let rawHours = 0;
        let rawMinutes = 0;

        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            rawHours = parseInt(parts[0], 10);
            rawMinutes = parseInt(parts[1].split(' ')[0], 10);
        }

        const isPM = rawHours >= 12;
        const hour12 = rawHours % 12 || 12;
        const hStr = hour12.toString().padStart(2, '0');
        const mStr = rawMinutes.toString().padStart(2, '0');
        return `${hStr}:${mStr} ${isPM ? 'PM' : 'AM'}`;
    };

    const displayTime = formatTime(order.time);

    return (
        <div className="flex flex-col items-center justify-center pt-8 px-4 pb-12 animate-fade-in">
            <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <CheckCircle className="text-white mx-auto mb-4 relative z-10 drop-shadow-md" size={56} />
                    <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10 drop-shadow-md">¡Solicitud Enviada!</h2>
                    <p className="text-green-50 text-sm max-w-sm mx-auto font-medium relative z-10">
                        Un asistente de Media Luna revisará la disponibilidad en breve y se comunicará contigo.
                    </p>
                </div>

                <div className="p-6">
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1"><CalendarDays size={14} /> Fecha</div>
                            <div className="text-sm font-semibold text-slate-800">{order.date}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1"><Clock size={14} /> Hora</div>
                            <div className="text-sm font-semibold text-slate-800">{displayTime}</div>
                        </div>
                        <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1"><MapPin size={14} /> Ubicación</div>
                            <div className="text-sm font-semibold text-slate-800">{order.eventLocation}</div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                            <Receipt size={16} className="text-rose-500" /> Resumen del Pedido
                        </h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <div className="flex-1 pr-4">
                                        <span className="font-semibold text-slate-700">{item.quantity}x {item.name || item.product?.name}</span>
                                        {(!item.isRental && !item.category?.includes('Renta') && item.productType !== 'RENTAL' && !/tablón|tablon|mesa|silla|brincolín/i.test(item.name || item.product?.name || '')) && (
                                            <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300 mt-0.5">⏱️ Servicio de {item.quantity >= 50 ? '2 horas' : '1 hora y 30 minutos'}</p>
                                        )}
                                        {item.customization && (
                                            <div className="text-[11px] text-slate-500 mt-0.5 leading-tight space-y-0.5">
                                                {item.customization.size && (
                                                    <p><strong className="text-slate-600">Tamaño:</strong> {item.customization.size === 'quarter' ? 'Bowl 1/4' : item.customization.size === 'half' ? 'Bowl 1/2' : item.customization.size}</p>
                                                )}
                                                {item.customization.bases && item.customization.bases.length > 0 && (
                                                    <p><strong className="text-slate-600">Base:</strong> {item.customization.bases.join(', ')}</p>
                                                )}
                                                {item.customization.complements && item.customization.complements.length > 0 && (
                                                    <p><strong className="text-slate-600">Comp:</strong> {item.customization.complements.join(', ')}</p>
                                                )}
                                                {item.customization.toppings && item.customization.toppings.length > 0 && (
                                                    <p><strong className="text-slate-600">Top:</strong> {item.customization.toppings.join(', ')}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-600">${item.totalPrice?.toLocaleString('es-MX')}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 mb-6">
                        {discountApplies && snackSubtotal > 0 ? (
                            <>
                                <div className="flex justify-between items-center text-sm font-semibold text-slate-500 line-through decoration-slate-400/50 mb-2">
                                    <span>Total regular</span>
                                    <span>${subtotal.toLocaleString('es-MX')} MXN</span>
                                </div>
                                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                    <span className="text-xs font-bold text-rose-600">✨ Si apartas tu fecha HOY:</span>
                                    <span className="text-lg font-black text-rose-600">
                                        ${total.toLocaleString('es-MX')} MXN
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-between text-lg font-black text-slate-800">
                                <span>Total Estimado</span>
                                <span>${total.toLocaleString('es-MX')} MXN</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:-translate-y-1 transition-all active:scale-[0.98]">
                        <MessageCircle size={22} /> Agilizar por WhatsApp
                    </a>

                    <button onClick={onBack} className="w-full mt-4 py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors">
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
