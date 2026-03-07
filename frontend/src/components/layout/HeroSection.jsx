import React from 'react';
import { Sparkles, Utensils, MapPin, CupSoda, CheckCircle, Bot, Instagram, Facebook, MessageCircle, Armchair, Tent } from 'lucide-react';

export default function HeroSection({ openBot, setActiveCategory }) {
    return (
        <div className="w-full relative overflow-hidden shadow-xl dark:shadow-2xl px-6 py-12 md:px-12 md:py-20 transition-colors duration-500 min-h-[75vh] md:min-h-[85vh] flex flex-col justify-center">
            {/* Background Image Layer - Desktop */}
            <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}></div>

            {/* Background Image Layer - Mobile */}
            <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg-mobile.jpg')" }}></div>

            {/* Soft Dark Overlay to ensure readability but keep image visible */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-0"></div>

            {/* HBO Max Cinematic Gradient (Desktop only) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent dark:from-black/95 dark:via-black/60 pointer-events-none z-0"></div>

            {/* Mobile Cinematic Gradient */}
            <div className="md:hidden absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent dark:from-black/95 dark:via-black/60 pointer-events-none z-0"></div>

            <div className="absolute -right-10 -top-10 w-52 h-52 bg-rose-500/30 dark:bg-purple-600/30 rounded-full blur-3xl z-0"></div>
            <div className="absolute -left-6 bottom-0 w-40 h-40 bg-amber-400/30 dark:bg-indigo-500/30 rounded-full blur-2xl z-0"></div>

            <div className="relative z-10 flex flex-col items-start md:items-center gap-8 md:gap-12 w-full">

                {/* Text and Actions */}
                <div className="w-full max-w-4xl flex flex-col items-start md:items-center md:text-center space-y-5 md:space-y-6">
                    <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/30 shadow-sm transition-colors duration-300 backdrop-blur-sm">Fresh & Local</div>

                    <h1 className="text-3xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight text-white transition-colors duration-300">
                        ¿Antojo de algo <span className="text-rose-400">delicioso</span>?<br className="hidden md:block" />
                        <span className="md:block md:mt-2">Preparamos tu snack al momento.</span>
                    </h1>

                    <p className="text-slate-200 text-base md:text-xl flex items-center justify-start md:justify-center gap-2 transition-colors duration-300">
                        <MapPin size={20} className="text-rose-400 shrink-0" /> Servicio exclusivo en Manzanillo, Colima.
                    </p>

                    {/* Social Media Icons & Contact */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 pt-2">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-300 transition-colors duration-300">Síguenos:</span>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-900 md:bg-white/10 md:hover:bg-white/20 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg backdrop-blur-sm border md:border-white/20 border-transparent">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                                <Facebook size={18} />
                            </a>
                        </div>

                        <div className="hidden md:block w-px h-6 bg-white/30"></div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-300 transition-colors duration-300">Contáctanos:</span>
                            <a href="https://wa.me/523123099318" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500/20 text-green-100 px-3 py-1.5 rounded-full text-xs font-bold border border-green-400/30 hover:bg-green-500/40 transition-colors shadow-sm backdrop-blur-sm">
                                <MessageCircle size={14} />
                                312 309 9318
                            </a>
                        </div>
                    </div>

                    {/* Main CTA Buttons */}
                    <div className="flex flex-col md:flex-row w-full md:w-auto md:justify-center gap-3 pt-4 md:pt-6">
                        <button onClick={openBot} className="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold bg-rose-600 text-white shadow-lg shadow-rose-900/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 border border-transparent hover:bg-rose-500 text-sm md:text-lg">
                            <Sparkles size={20} className="text-white shrink-0" /> <span className="truncate">Agenda con Lunita IA</span>
                        </button>
                        <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 shadow-sm flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-md text-sm md:text-lg hover:-translate-y-0.5 active:translate-y-0">
                            <Utensils size={20} className="shrink-0" /> <span className="truncate">Ver menú</span>
                        </button>
                    </div>
                </div>

                {/* Categories Grid - Below main content on desktop, styled to blend with the cinematic gradient */}
                <div className="w-full md:max-w-5xl rounded-2xl bg-white/80 dark:bg-slate-900/60 md:bg-white/5 md:dark:bg-white/5 border border-white/60 dark:border-white/5 md:border-white/10 p-5 md:p-6 shadow-inner md:shadow-2xl dark:shadow-black/50 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 text-sm transition-colors duration-500 backdrop-blur-xl md:mt-6 relative z-10 hover:md:bg-white/10 md:transition-all">
                    <button onClick={() => { if (setActiveCategory) setActiveCategory('snacks'); setTimeout(() => document.getElementById('category-Snacks')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-rose-50 dark:bg-rose-500/20 md:bg-rose-500/20 text-rose-500 dark:text-rose-400 md:text-rose-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/30 md:group-hover:bg-rose-500/40 shrink-0"><Utensils size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Snacks</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">Preparados</p>
                        </div>
                    </button>

                    <button onClick={() => { if (setActiveCategory) setActiveCategory('drinks'); setTimeout(() => document.getElementById('category-Bebidas')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 dark:bg-amber-500/20 md:bg-amber-500/20 text-amber-500 dark:text-amber-400 md:text-amber-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/30 md:group-hover:bg-amber-500/40 shrink-0"><CupSoda size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Bebidas</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">Refrescantes</p>
                        </div>
                    </button>

                    <button onClick={() => { if (setActiveCategory) setActiveCategory('rental'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 md:bg-blue-500/20 text-blue-600 dark:text-blue-400 md:text-blue-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/30 md:group-hover:bg-blue-500/40 shrink-0"><Armchair size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Renta de mueble</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">Para eventos</p>
                        </div>
                    </button>

                    <button onClick={() => { if (setActiveCategory) setActiveCategory('rental'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 dark:bg-purple-500/20 md:bg-purple-500/20 text-purple-600 dark:text-purple-400 md:text-purple-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/30 md:group-hover:bg-purple-500/40 shrink-0"><Tent size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Brincolines</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">Diversión</p>
                        </div>
                    </button>

                    <button onClick={() => { if (setActiveCategory) setActiveCategory('rental'); setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 dark:bg-green-500/20 md:bg-green-500/20 text-green-600 dark:text-green-400 md:text-green-400 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-500/30 md:group-hover:bg-green-500/40 shrink-0"><CheckCircle size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Cotiza</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">Rápido</p>
                        </div>
                    </button>

                    <button onClick={openBot} className="flex items-center gap-3 group text-left hover:scale-105 transition-transform md:hover:bg-white/10 md:p-2 md:rounded-xl">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-900 dark:bg-indigo-600/30 md:bg-indigo-500/20 text-white dark:text-indigo-300 md:text-indigo-300 flex items-center justify-center shadow-sm transition-colors duration-300 group-hover:bg-slate-800 dark:group-hover:bg-indigo-600/50 md:group-hover:bg-indigo-500/40 shrink-0"><Bot size={20} className="md:w-6 md:h-6" /></div>
                        <div className="min-w-0 pr-1">
                            <p className="font-bold text-[13px] sm:text-sm md:text-base text-slate-800 dark:text-slate-200 md:text-white transition-colors duration-300 leading-tight">Asistente</p>
                            <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 md:text-slate-300 transition-colors duration-300">IA</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
