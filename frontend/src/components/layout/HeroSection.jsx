import React from 'react';
import { Sparkles, Utensils, MapPin, CupSoda, CheckCircle, Bot, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function HeroSection({ openBot, setActiveCategory }) {
    return (
        <div className="rounded-[28px] bg-gradient-to-br from-white/90 via-white/75 to-white/60 dark:from-slate-900/95 dark:via-purple-900/80 dark:to-indigo-950/80 border border-white/60 dark:border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.8)] p-8 md:p-10 relative overflow-hidden transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-transparent to-amber-100/60 dark:from-purple-900/40 dark:via-transparent dark:to-indigo-900/40"></div>
            <div className="absolute -right-10 -top-10 w-52 h-52 bg-rose-500/20 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-6 bottom-0 w-40 h-40 bg-amber-400/20 dark:bg-indigo-500/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-500/30 shadow-sm transition-colors duration-300">Fresh & Local</div>
                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
                        ¿Antojo de algo <span className="text-rose-500 dark:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)] dark:drop-shadow-[0_0_12px_rgba(251,113,133,0.6)]">delicioso</span>?<br />
                        Preparamos tu snack al momento.
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg flex items-center gap-2 transition-colors duration-300">
                        <MapPin size={18} className="text-rose-500 dark:text-rose-400" /> Servicio exclusivo en Manzanillo, Colima.
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex items-center gap-3 pt-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors duration-300">Síguenos:</span>
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

                    <div className="flex flex-col md:flex-row flex-wrap gap-3">
                        <div className="flex gap-2 w-full md:w-auto">
                            <button onClick={openBot} className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-semibold bg-slate-900 dark:bg-indigo-600 text-white shadow-lg shadow-rose-200 dark:shadow-indigo-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 border dark:border-indigo-500 text-sm md:text-base">
                                <Sparkles size={18} className="text-amber-300 dark:text-amber-200 shrink-0" /> <span className="truncate">Habla con Lunita IA</span>
                            </button>
                            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 md:flex-none px-4 py-3 rounded-xl font-semibold bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm flex items-center justify-center gap-2 transition-colors duration-300 backdrop-blur-md text-sm md:text-base">
                                <Utensils size={18} className="shrink-0" /> <span className="truncate">Ver menú</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-64 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-white/60 dark:border-white/5 p-5 shadow-inner dark:shadow-black/50 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-500 backdrop-blur-xl">
                    <button onClick={() => { if (setActiveCategory) setActiveCategory('snacks'); setTimeout(() => document.getElementById('category-Snacks')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-2 group text-left hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/30 shrink-0"><Utensils size={18} /></div>
                        <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300 truncate">Snacks</p><p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 transition-colors duration-300 truncate">Preparados</p></div>
                    </button>
                    <button onClick={() => { if (setActiveCategory) setActiveCategory('drinks'); setTimeout(() => document.getElementById('category-Bebidas')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-2 group text-left hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/30 shrink-0"><CupSoda size={18} /></div>
                        <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300 truncate">Bebidas</p><p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 transition-colors duration-300 truncate">Refrescantes</p></div>
                    </button>
                    <button onClick={() => { if (setActiveCategory) setActiveCategory('rental'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-2 group text-left hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-500/30 shrink-0"><CheckCircle size={18} /></div>
                        <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300 truncate">Cotiza</p><p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 transition-colors duration-300 truncate">Rápido</p></div>
                    </button>
                    <button onClick={openBot} className="flex items-center gap-2 group text-left hover:scale-105 transition-transform">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600/30 text-white dark:text-indigo-300 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-slate-800 dark:group-hover:bg-indigo-600/50 shrink-0"><Bot size={18} /></div>
                        <div className="min-w-0"><p className="font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300 truncate">Asistente</p><p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500 transition-colors duration-300 truncate">IA</p></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
