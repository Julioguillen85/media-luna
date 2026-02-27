import React from 'react';
import { Utensils, CupSoda, Armchair } from 'lucide-react';

export default function MobileBottomNav({ activeCategory, setActiveCategory, isBotOpen }) {
    const handleNavClick = (category, sectionId) => {
        setActiveCategory(category);

        // Small delay to allow React to render the category if it was hidden
        setTimeout(() => {
            if (sectionId) {
                const element = document.getElementById(sectionId);
                if (element) {
                    // Offset for potential sticky headers
                    const y = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-white/10 p-2 pb-safe z-50 transition-transform duration-300 ${!isBotOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="flex justify-around items-center">
                <button
                    onClick={() => handleNavClick('snacks', 'products')}
                    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'snacks' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'snacks' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-transparent'}`}>
                        <Utensils size={24} />
                    </div>
                    <span className="text-[10px] font-bold mt-1">Snacks</span>
                </button>

                <button
                    onClick={() => handleNavClick('drinks', 'products')}
                    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'drinks' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'drinks' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-transparent'}`}>
                        <CupSoda size={24} />
                    </div>
                    <span className="text-[10px] font-bold mt-1">Bebidas</span>
                </button>

                <button
                    onClick={() => handleNavClick('rental', 'products')}
                    className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'rental' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'rental' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-transparent'}`}>
                        <Armchair size={24} />
                    </div>
                    <span className="text-[10px] font-bold mt-1">Muebles</span>
                </button>
            </div>
        </div>
    );
}
