import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="relative group mr-2">
            <button
                onClick={toggleTheme}
                className={`relative z-10 inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 ${isDark
                    ? 'bg-slate-800 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                    : 'bg-rose-100 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                    }`}
                aria-label="Toggle Dark Mode"
                title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
                <div className="relative w-6 h-6 flex items-center justify-center">
                    <Sun
                        size={20}
                        className={`absolute transition-all duration-500 transform ${isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
                            }`}
                    />
                    <Moon
                        size={20}
                        className={`absolute transition-all duration-500 transform ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
                            }`}
                    />
                </div>
            </button>

            {/* Pulsing Highlight Badge */}
            <div className={`absolute -bottom-4 right-1/2 translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shadow-sm transition-opacity duration-300 group-hover:opacity-0 ${isDark ? 'bg-amber-400 text-slate-900 shadow-amber-400/50' : 'bg-rose-500 text-white shadow-rose-500/50'} animate-pulse pointer-events-none`}>
                {isDark ? 'Modo claro' : 'Modo oscuro'}
            </div>

            {/* Subtle pulse ring behind the button to draw attention */}
            <div className={`absolute inset-0 rounded-full w-10 h-10 -m-0.5 -z-10 animate-ping opacity-20 ${isDark ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
        </div>
    );
}
