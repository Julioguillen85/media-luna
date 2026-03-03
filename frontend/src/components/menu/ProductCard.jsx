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
        <div className={`glass-panel p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 relative group overflow-hidden ${isSelected ? 'ring-2 ring-rose-300 shadow-rose-100 dark:ring-rose-500 dark:shadow-rose-900/50' : 'hover:-translate-y-1'}`}>
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-inner relative cursor-pointer border border-white/70 dark:border-white/10" onClick={() => onProductClick(product, true)}>
                <img src={getImageUrl(product.img)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {isDiscountActive() && (!product.isRental && !product.category?.includes('Renta') && product.productType !== 'RENTAL' && product.category !== 'Muebles') && (
                    <div className="absolute top-0 right-0 bg-rose-500/95 text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-xl shadow-sm tracking-wider uppercase backdrop-blur-sm shadow-black/20 flex z-10">-15% HOY</div>
                )}
                {hasMultipleImages && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon className="text-white drop-shadow-md" size={24} /></div>)}
                {isCustomizable && !hasMultipleImages && (<div className="absolute bottom-0 left-0 right-0 bg-rose-500/90 text-white text-[9px] uppercase tracking-wider text-center py-1 font-bold backdrop-blur-sm">Armar</div>)}
            </div>
            <div className="flex-1 py-1 cursor-pointer" onClick={() => onProductClick(product, false)}>
                {(product.id === 6 || product.id === 4) && (
                    <div className="inline-flex items-center gap-1 mb-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800/50 shadow-sm">
                        <Star size={11} className="fill-yellow-400 text-yellow-500 dark:text-yellow-300 drop-shadow-[0_0_2px_rgba(250,204,21,0.8)]" /> Más solicitado
                    </div>
                )}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1 transition-colors duration-300">{product.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed transition-colors duration-300">
                    {product.description || product.desc || 'Delicioso snack preparado al momento'}
                </p>
                <div className="flex justify-between items-center">
                    <p className="text-rose-600 dark:text-rose-400 text-xs font-extrabold bg-rose-50 dark:bg-rose-900/30 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800/50 shadow-sm transition-colors duration-300">Cotización</p>
                    {isSelected ? (<div className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 p-1.5 rounded-lg shadow-sm transition-colors duration-300"><CheckCircle size={18} /></div>) : (<div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 ${isCustomizable ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-900 dark:bg-slate-700 text-white'} shadow-sm duration-300`}>{isCustomizable ? <Sparkles size={18} /> : <Utensils size={18} />}</div>)}
                </div>
            </div>
            {isSelected && (<button onClick={(e) => { e.stopPropagation(); const item = cart.find(i => i.id === product.id); if (item) removeFromCart(item.cartId); }} className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 text-red-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-full shadow hover:bg-red-50 dark:hover:bg-slate-700 transition-colors z-10 border border-rose-100 dark:border-red-900/30"><Trash2 size={16} /></button>)}
        </div>
    );
}
