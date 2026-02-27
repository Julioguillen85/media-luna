import React from 'react';
import { User, Phone, MapPin, Users, FileText } from 'lucide-react';

export default function CheckoutForm({ onCheckout, hasItems, formData, setFormData, isFurnitureOnly }) {
    const handleSubmit = (e) => { e.preventDefault(); if (!hasItems) return; onCheckout(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
            <div className="bg-amber-50 text-amber-800 text-xs p-2.5 rounded-xl border border-amber-200 flex items-center gap-2 shadow-inner"><MapPin size={12} /><span>Servicio en <strong>Manzanillo, Colima</strong></span></div>
            <div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="text" placeholder="Tu nombre" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="tel" placeholder="WhatsApp (314...)" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div className="relative"><MapPin className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="text" placeholder="Lugar del evento (Ej: Colonia Jardines)" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.eventLocation} onChange={e => setFormData({ ...formData, eventLocation: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
                <input required type="date" className="w-full p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none text-sm text-slate-600 shadow-inner" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                <input required type="time" min="14:00" max="20:00" className="w-full p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none text-sm text-slate-600 shadow-inner" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-lg shadow-rose-100/40"><label className="text-sm font-bold block mb-1 flex items-center gap-1 text-white"><Users size={16} /> Duración de Servicio</label><p className="w-full p-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-sm text-center font-medium">2 horas</p></div>
            <button type="submit" disabled={!hasItems} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98] ${hasItems ? 'bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 hover:shadow-rose-300/60 hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}><FileText size={20} /> Consultar Disponibilidad</button>
        </form>
    );
}
