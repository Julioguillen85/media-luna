import React from 'react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-auto py-8 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-white/70 dark:border-slate-800 transition-colors duration-300">
            <p className="font-semibold text-slate-800 dark:text-white mb-1 transition-colors duration-300">Media Luna Snack Bar 🌙</p>
            <p className="text-xs mb-4">Manzanillo, Colima • Pedidos en Línea</p>
            <div className="flex justify-center items-center gap-3 mb-3">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                    <Instagram size={16} />
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                    <Facebook size={16} />
                </a>
            </div>
            <a href="https://wa.me/523123099318" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-xs font-bold border border-green-200 dark:border-green-700/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors shadow-sm">
                <MessageCircle size={14} />
                Contáctanos: 312 309 9318
            </a>
        </footer>
    );
}
