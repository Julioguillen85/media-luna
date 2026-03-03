import React, { useRef } from 'react';
import { ShoppingBag, Sparkles, Utensils, CupSoda, CheckCircle, Bot, MapPin, Image as ImageIcon } from 'lucide-react';
import ProductCard from './ProductCard';

const CATEGORIES = ['snacks', 'drinks', 'rental'];

export default function ProductGrid({
    products,
    categories,
    cart,
    onProductClick,
    removeFromCart,
    activeCategory,
    setActiveCategory
}) {
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const hasMoved = useRef(false);

    const handleSwipe = () => {
        if (!hasMoved.current) return; // ignore simple taps
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 80 && activeCategory && setActiveCategory) {
            const idx = CATEGORIES.indexOf(activeCategory);
            if (diff > 0 && idx < CATEGORIES.length - 1) {
                setActiveCategory(CATEGORIES[idx + 1]);
            } else if (diff < 0 && idx > 0) {
                setActiveCategory(CATEGORIES[idx - 1]);
            }
        }
        hasMoved.current = false;
    };

    return (
        <div
            className="space-y-10"
            onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
                touchEndX.current = e.touches[0].clientX;
                hasMoved.current = false;
            }}
            onTouchMove={(e) => {
                touchEndX.current = e.touches[0].clientX;
                const diff = Math.abs(touchStartX.current - touchEndX.current);
                if (diff > 10) hasMoved.current = true;
            }}
            onTouchEnd={handleSwipe}
        >
            <div id="products" className="space-y-10">
                {categories.map(cat => {
                    let catProducts = products.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;

                    if (cat === "Snacks") {
                        catProducts.sort((a, b) => {
                            const isPrimaryA = a.id === 6 || a.id === 4;
                            const isPrimaryB = b.id === 6 || b.id === 4;

                            if (isPrimaryA && !isPrimaryB) return -1;
                            if (!isPrimaryA && isPrimaryB) return 1;

                            if (isPrimaryA && isPrimaryB) {
                                if (a.id === 6 && b.id === 4) return -1;
                                if (a.id === 4 && b.id === 6) return 1;
                            }

                            return 0;
                        });
                    }

                    return (
                        <div key={cat} id={`category-${cat}`} className="animate-fade-in scroll-mt-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 transition-colors duration-300">
                                    <span className="text-2xl">
                                        {cat === "Snacks" ? "🍟" : cat === "Bebidas" ? "🍹" : "🪑"}
                                    </span>
                                    {cat === "Snacks" ? "Snacks & Antojos" : cat === "Bebidas" ? "Bebidas Refrescantes" : "Mobiliario y Equipo"}
                                </h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-rose-200 via-slate-200 to-transparent dark:from-rose-900/50 dark:via-slate-800 dark:to-transparent ml-4 transition-colors duration-300" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {catProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        cart={cart}
                                        onProductClick={onProductClick}
                                        removeFromCart={removeFromCart}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
