import React, { useRef, useState } from 'react';
import { Utensils, CupSoda, Armchair, Search, X } from 'lucide-react';

const CATEGORIES = ['snacks', 'drinks', 'rental'];

export default function MobileBottomNav({ activeCategory, setActiveCategory, isBotOpen, products, onProductClick }) {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const hasMoved = useRef(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');

    const handleNavClick = (category, sectionId) => {
        setActiveCategory(category);
        setTimeout(() => {
            if (sectionId) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const y = element.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    };

    const swipeToCategory = (direction) => {
        const idx = CATEGORIES.indexOf(activeCategory);
        if (direction === 'left' && idx < CATEGORIES.length - 1) {
            handleNavClick(CATEGORIES[idx + 1], 'products');
        } else if (direction === 'right' && idx > 0) {
            handleNavClick(CATEGORIES[idx - 1], 'products');
        }
    };

    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
        hasMoved.current = false;
    };
    const onTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
        if (Math.abs(touchStartX.current - touchEndX.current) > 10) hasMoved.current = true;
    };
    const onTouchEnd = () => {
        if (!hasMoved.current) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 80) {
            swipeToCategory(diff > 0 ? 'left' : 'right');
        }
        hasMoved.current = false;
    };

    const filtered = query.trim().length > 0 && products
        ? products.filter(p =>
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)
        : [];

    const handleSelect = (product) => {
        if (product.productType === 'RENTAL' || product.category?.includes('Renta')) {
            setActiveCategory('rental');
        } else if (product.category === 'Bebidas') {
            setActiveCategory('drinks');
        } else {
            setActiveCategory('snacks');
        }
        setSearchOpen(false);
        setQuery('');
        setTimeout(() => {
            if (onProductClick) onProductClick(product, false);
        }, 200);
    };

    return (
        <>
            {/* Search overlay */}
            {searchOpen && (
                <div className="md:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setQuery(''); }}>
                    <div className="absolute bottom-[72px] left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[60vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Search input */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <Search size={18} className="text-slate-400 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar producto..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={16} className="text-slate-400" />
                                </button>
                            )}
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSelect(p)}
                                        className="w-full flex items-center gap-3 p-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-50 dark:border-slate-800/50"
                                    >
                                        {p.img && (
                                            <img
                                                src={p.img.startsWith('http') || p.img.startsWith('/') ? p.img : `/${p.img}`}
                                                alt={p.name}
                                                className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-700"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.name}</p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{p.category}</p>
                                        </div>
                                    </button>
                                ))
                            ) : query.trim().length > 0 ? (
                                <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                                    No se encontraron productos 🔍
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                                    Escribe para buscar...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom nav bar */}
            <div
                className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-white/10 p-2 pb-safe z-50 transition-transform duration-300 ${!isBotOpen ? 'translate-y-0' : 'translate-y-full'}`}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className="flex justify-around items-center">
                    <button
                        onClick={() => handleNavClick('snacks', 'products')}
                        className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'snacks' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'snacks' ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-transparent'}`}>
                            <Utensils size={22} />
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">Snacks</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('drinks', 'products')}
                        className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'drinks' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'drinks' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-transparent'}`}>
                            <CupSoda size={22} />
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">Bebidas</span>
                    </button>

                    <button
                        onClick={() => handleNavClick('rental', 'products')}
                        className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${activeCategory === 'rental' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-full transition-colors ${activeCategory === 'rental' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-transparent'}`}>
                            <Armchair size={22} />
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">Muebles</span>
                    </button>

                    {/* Search */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${searchOpen ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        <div className={`p-1.5 rounded-full transition-colors ${searchOpen ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-transparent'}`}>
                            <Search size={22} />
                        </div>
                        <span className="text-[10px] font-bold mt-0.5">Buscar</span>
                    </button>
                </div>
            </div>
        </>
    );
}
