import React from 'react';
import { Sparkles, Utensils, CheckCircle, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { isCustomizable as checkIsCustomizable, isTray } from '../../App';
import { isDiscountActive } from '../../lunitaUtils';

export default function ProductCard({ product, cart, onProductClick, removeFromCart }) {
    const isSelected = cart.some(item => item.id === product.id);
    const isCustomizable = checkIsCustomizable(product) || isTray(product);
    const hasMultipleImages = product.gallery && product.gallery.length > 0;

    const getImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        if (img.startsWith('/')) return img;
        return `/${img}`;
    };

    return (
        <div
            className={`glass-panel flex flex-col rounded-3xl overflow-hidden transition-all duration-300 relative group cursor-pointer 
                ${isSelected
                    ? 'ring-2 ring-rose-400 dark:ring-rose-500 shadow-[0_0_15px_rgba(251,113,133,0.3)]'
                    : 'hover:-translate-y-1 shadow-md hover:shadow-xl'
                }`}
            onClick={() => onProductClick(product, false)}
        >
            {/* Hero Image Section */}
            <div className="w-full h-48 sm:h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0" onClick={(e) => { e.stopPropagation(); onProductClick(product, true); }}>
                <img
                    src={getImageUrl(product.img)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Top Badges (Left edge) */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {(product.id === 6 || product.id === 4) && (
                        <div className="bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                            <Star size={10} className="fill-amber-900" /> MÁS PEDIDO
                        </div>
                    )}
                    {isDiscountActive() && (!product.isRental && !product.category?.includes('Renta') && product.productType !== 'RENTAL' && product.category !== 'Muebles') && (
                        <div className="bg-rose-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg tracking-widest uppercase flex items-center gap-1">
                            <Sparkles size={10} className="animate-pulse" /> 15% OFF
                        </div>
                    )}
                </div>

                {/* Multiple Images Indicator (Right edge) */}
                {hasMultipleImages && (
                    <div className="absolute top-3 right-3 bg-black/40 text-white p-2 rounded-full backdrop-blur-md z-10 shadow-lg">
                        <ImageIcon size={14} />
                    </div>
                )}

                {/* Customization Badge (Bottom Right) */}
                {isCustomizable && !hasMultipleImages && (
                    <div className="absolute bottom-3 right-3 bg-rose-500/95 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-black backdrop-blur-md shadow-lg flex items-center gap-1 z-10">
                        <Sparkles size={12} /> Armar a tu gusto
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-5 flex flex-col bg-white dark:bg-slate-900">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-extrabold text-[1.15rem] text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                        {product.name}
                    </h3>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {product.description || product.desc || 'Delicioso snack preparado al momento con los mejores ingredientes.'}
                </p>

                {/* Action Bar */}
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-rose-600 dark:text-rose-400 text-sm font-black tracking-wide uppercase">
                        Cotizar
                    </span>

                    {isSelected ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">Agregado</span>
                            <div className="bg-green-500 text-white p-2 rounded-xl shadow-md rotate-12 transition-transform">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                    ) : (
                        <div className={`p-2.5 rounded-xl shadow-md transition-all transform group-hover:scale-110 
                            ${isCustomizable ? 'bg-amber-100 text-amber-600 dark:bg-amber-500 dark:text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}
                        >
                            {isCustomizable ? <Sparkles size={18} /> : <Utensils size={18} />}
                        </div>
                    )}
                </div>
            </div>

            {/* Remove from Cart Overlay Button */}
            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const item = cart.find(i => i.id === product.id);
                        if (item) removeFromCart(item.cartId);
                    }}
                    className="absolute top-3 left-3 bg-white/95 dark:bg-slate-800/95 text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 p-2 rounded-full shadow-xl transition-all z-20 border border-red-100 dark:border-red-900/50"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}
