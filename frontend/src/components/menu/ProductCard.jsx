import React from 'react';
import { Sparkles, Utensils, CheckCircle, Trash2, Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product, cart, onProductClick, removeFromCart, CUSTOMIZABLE_IDS }) {
    const isSelected = cart.some(item => item.id === product.id);
    const isCustomizable = CUSTOMIZABLE_IDS.includes(product.id);
    const hasGallery = product.gallery && product.gallery.length > 0;

    return (
        <div className={`glass-panel p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 relative group overflow-hidden ${isSelected && !isCustomizable ? 'ring-2 ring-rose-300 shadow-rose-100' : 'hover:-translate-y-1'}`}>
            <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden shadow-inner relative cursor-pointer border border-white/70" onClick={() => hasGallery && onProductClick(product, true)}>
                <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {hasGallery && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon className="text-white drop-shadow-md" size={24} /></div>)}
                {isCustomizable && !hasGallery && (<div className="absolute bottom-0 left-0 right-0 bg-rose-500/90 text-white text-[9px] uppercase tracking-wider text-center py-1 font-bold backdrop-blur-sm">Armar</div>)}
            </div>
            <div className="flex-1 py-1 cursor-pointer" onClick={() => onProductClick(product, false)}>
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{product.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {product.description || product.desc || 'Delicioso snack preparado al momento'}
                </p>
                <div className="flex justify-between items-center">
                    <p className="text-rose-600 text-xs font-extrabold bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Cotización</p>
                    {isSelected && !isCustomizable ? (<div className="bg-green-100 text-green-600 p-1.5 rounded-lg shadow-sm"><CheckCircle size={18} /></div>) : (<div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 ${isCustomizable ? 'bg-amber-100 text-amber-600' : 'bg-slate-900 text-white'} shadow-sm`}>{isCustomizable ? <Sparkles size={18} /> : <Utensils size={18} />}</div>)}
                </div>
            </div>
            {isSelected && !isCustomizable && (<button onClick={(e) => { e.stopPropagation(); removeFromCart(cart.find(i => i.id === product.id).cartId); }} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow hover:bg-red-50 transition-colors z-10 border border-rose-100"><Trash2 size={16} /></button>)}
        </div>
    );
}
