import React from 'react';
import { Utensils, Armchair, CupSoda } from 'lucide-react';

export default function CategoryToggle({ activeCategory, setActiveCategory }) {
    return (
        <div className="mb-8 px-4 hidden md:block">
            {/* Desktop View: Original Pills */}
            <div className="flex justify-center">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-1.5 inline-flex gap-2 w-auto transition-colors duration-300">
                    <button
                        onClick={() => setActiveCategory('snacks')}
                        className={`px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${activeCategory === 'snacks'
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/40'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Utensils size={20} />
                        <span>Snacks</span>
                    </button>
                    <button
                        onClick={() => setActiveCategory('drinks')}
                        className={`px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${activeCategory === 'drinks'
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/40'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <CupSoda size={20} />
                        <span>Bebidas</span>
                    </button>
                    <button
                        onClick={() => setActiveCategory('rental')}
                        className={`px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 whitespace-nowrap ${activeCategory === 'rental'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Armchair size={20} />
                        <span>Renta de Eventos</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
