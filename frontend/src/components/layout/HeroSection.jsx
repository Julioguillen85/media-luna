import React from 'react';
import { Sparkles, Utensils, MapPin, CupSoda, CheckCircle, Bot, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function HeroSection({ openBot }) {
    return (
        <div className="rounded-[28px] bg-gradient-to-br from-white/90 via-white/75 to-white/60 border border-white/60 shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-transparent to-amber-100/60"></div>
            <div className="absolute -right-10 -top-10 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-6 bottom-0 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 shadow-sm">Fresh & Local</div>
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
                        ¿Antojo de algo <span className="text-rose-500">delicioso</span>?<br />
                        Preparamos tu snack al momento.
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg flex items-center gap-2">
                        <MapPin size={18} className="text-rose-500" /> Servicio exclusivo en Manzanillo, Colima.
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm font-medium text-slate-600">Síguenos:</span>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                            <Instagram size={18} />
                        </a>
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                        </a>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                            <Facebook size={18} />
                        </a>
                        <a href="https://wa.me/523141234567" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                            <MessageCircle size={18} />
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button onClick={openBot} className="px-6 py-3 rounded-xl font-semibold bg-slate-900 text-white shadow-lg shadow-rose-200 hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-300" /> Habla con Lunita IA
                        </button>
                        <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-3 rounded-xl font-semibold bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm flex items-center gap-2">
                            <Utensils size={18} /> Ver menú
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-64 rounded-2xl bg-white/80 border border-white/60 p-5 shadow-inner grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm"><Utensils size={18} /></div>
                        <div><p className="font-bold text-slate-800">Snacks</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Preparados</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm"><CupSoda size={18} /></div>
                        <div><p className="font-bold text-slate-800">Bebidas</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Refrescantes</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm"><CheckCircle size={18} /></div>
                        <div><p className="font-bold text-slate-800">Cotiza</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Rápido</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm"><Bot size={18} /></div>
                        <div><p className="font-bold text-slate-800">Asistente</p><p className="text-[11px] uppercase tracking-wide text-slate-400">IA</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
