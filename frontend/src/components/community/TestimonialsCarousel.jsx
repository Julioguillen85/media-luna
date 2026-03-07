import React from 'react';
import { MessageCircle, Star } from 'lucide-react';

const testimonials = [
    { id: 1, name: "Ana P.", text: "¡Los mejores tostitos que he probado! Súper recomendados 🤤", stars: 5, date: "Hace 2 días" },
    { id: 2, name: "Carlos M.", text: "Excelente servicio y todo muy fresco. El bowl de 1/2 litro uffff 🔥", stars: 5, date: "Hace 1 semana" },
    { id: 3, name: "Sofia R.", text: "Me encanta que puedo armar mi snack como yo quiera. 💖", stars: 5, date: "Hace 3 días" },
    { id: 4, name: "Luis G.", text: "La atención de Lunita es genial, hice mi pedido súper rápido. 🤖", stars: 5, date: "Ayer" },
    { id: 5, name: "Mariana L.", text: "Las micheladas están en su punto. Volveré seguro. 🍻", stars: 5, date: "Hace 2 semanas" },
    { id: 6, name: "Diego F.", text: "Muy buenos precios y porciones generosas. 👌", stars: 4, date: "Hace 5 días" }
];

export default function TestimonialsCarousel() {
    return (
        <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 pointer-events-none">
                <MessageCircle size={64} className="text-rose-500 md:w-[100px] md:h-[100px]" />
            </div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
                <div className="bg-rose-100 p-1.5 md:p-2 rounded-full"><Star size={16} className="text-rose-500 fill-rose-500 md:w-5 md:h-5" /></div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900">Lo que dicen nuestros clientes</h3>
            </div>

            <div className="relative w-full overflow-hidden mask-linear-fade">
                <div className="flex gap-3 md:gap-4 animate-marquee w-max">
                    {/* Render testimonials twice to create infinite loop effect */}
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div key={i} className="w-[240px] md:w-[320px] bg-white/60 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative flex-shrink-0 cursor-default">
                            <div className="flex items-center gap-1 mb-1.5 md:mb-2 text-amber-400">
                                {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} size={12} className={`md:w-[14px] md:h-[14px] ${idx < t.stars ? "fill-current" : "text-gray-300"}`} />
                                ))}
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 italic mb-2 md:mb-3 line-clamp-3">"{t.text}"</p>
                            <div className="flex justify-between items-end border-t border-slate-100 pt-1.5 md:pt-2">
                                <span className="font-bold text-[10px] md:text-xs text-slate-900">{t.name}</span>
                                <span className="text-[9px] md:text-[10px] text-slate-400">{t.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
