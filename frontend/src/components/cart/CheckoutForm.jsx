import React from 'react';
import { User, Phone, MapPin, Users, FileText, Mail } from 'lucide-react';

export default function CheckoutForm({ onCheckout, hasItems, formData, setFormData, isFurnitureOnly }) {
    const handleSubmit = (e) => { e.preventDefault(); if (!hasItems) return; onCheckout(formData); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
            <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 shadow-inner"><MapPin size={12} /><span>Servicio en <strong className="dark:text-amber-100">Manzanillo, Colima</strong></span></div>
            <div className="relative"><User className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} /><input required type="text" placeholder="Tu nombre" className="w-full pl-10 p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm shadow-inner text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} /><input required type="email" placeholder="Correo electrónico" className="w-full pl-10 p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm shadow-inner text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="relative"><Phone className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} /><input required type="tel" placeholder="WhatsApp (314...)" className="w-full pl-10 p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm shadow-inner text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div className="relative"><MapPin className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} /><input required type="text" placeholder="Lugar del evento (Ej: Colonia Jardines)" className="w-full pl-10 p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm shadow-inner text-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" value={formData.eventLocation} onChange={e => setFormData({ ...formData, eventLocation: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
                <input required type="date" className="w-full p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm text-slate-600 dark:text-white shadow-inner dark:[color-scheme:dark]" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                <select required className="w-full p-3 bg-white/70 dark:bg-slate-800/90 border border-white/80 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500 outline-none transition-all text-sm text-slate-600 dark:text-white shadow-inner appearance-none cursor-pointer" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
                    <option value="" disabled>Selecciona la hora</option>
                    <option value="14:00">02:00 PM a 04:00 PM</option>
                    <option value="14:30">02:30 PM a 04:30 PM</option>
                    <option value="15:00">03:00 PM a 05:00 PM</option>
                    <option value="15:30">03:30 PM a 05:30 PM</option>
                    <option value="16:00">04:00 PM a 06:00 PM</option>
                    <option value="16:30">04:30 PM a 06:30 PM</option>
                    <option value="17:00">05:00 PM a 07:00 PM</option>
                    <option value="17:30">05:30 PM a 07:30 PM</option>
                    <option value="18:00">06:00 PM a 08:00 PM</option>
                    <option value="18:30">06:30 PM a 08:30 PM</option>
                    <option value="19:00">07:00 PM a 09:00 PM</option>
                    <option value="19:30">07:30 PM a 09:30 PM</option>
                    <option value="20:00">08:00 PM a 10:00 PM</option>
                </select>
            </div>
            <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-lg shadow-rose-100/40 dark:shadow-rose-900/20"><label className="text-sm font-bold block mb-1 flex items-center gap-1 text-white"><Users size={16} /> Duración de Servicio</label><p className="w-full p-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-sm text-center font-medium">2 horas</p></div>
            <button type="submit" disabled={!hasItems} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98] ${hasItems ? 'bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 hover:shadow-rose-300/60 dark:hover:shadow-rose-900/40 hover:-translate-y-1' : 'bg-gray-300 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'}`}><FileText size={20} /> Consultar Disponibilidad</button>
        </form>
    );
}
