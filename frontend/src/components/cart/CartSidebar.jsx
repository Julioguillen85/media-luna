import React from 'react';
import { ShoppingBag, Sparkles, X } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

export default function CartSidebar({ cart, removeFromCart, openBot, onCheckout, checkoutFormData, setCheckoutFormData }) {
    return (
        <div className="glass-panel p-6 rounded-3xl mb-8 hidden lg:block">
            <div className="flex items-center justify-between mb-6 border-b border-white/70 pb-4"><h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-900"><ShoppingBag className="text-rose-500" /> Solicitud</h2><span className="bg-rose-500/10 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-sm">{cart.length} items</span></div>
            <div className="bg-white/70 p-4 rounded-2xl mb-6 max-h-[400px] overflow-y-auto custom-scrollbar border border-white/80 shadow-inner">
                {cart.length === 0 ? (<div className="text-center py-8"><div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-slate-100"><ShoppingBag className="text-slate-300" size={32} /></div><p className="text-slate-400 text-sm font-medium mb-3">Tu lista está vacía</p><button onClick={openBot} className="text-xs bg-slate-900 text-white px-3 py-2 rounded-full font-bold hover:-translate-y-0.5 transition-transform shadow-lg shadow-rose-100 flex items-center gap-1 mx-auto"><Sparkles size={14} /> Pedir ayuda a Lunita</button></div>) : (
                    <ul className="space-y-4">{cart.map((item, idx) => (<li key={item.cartId || idx} className="bg-white p-3 rounded-xl shadow-sm animate-fade-in border border-slate-100"><div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-900">{item.name}</span>{item.customization && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${item.customization.size === 'quarter' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}</span>)}</div><button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button></div>{item.customization && (<div className="text-[10px] text-slate-500 mb-2 space-y-1 bg-slate-50 p-2 rounded border border-slate-100"><p className="line-clamp-1"><strong className="text-slate-700">Base:</strong> {item.customization.bases.join(", ")}</p><p className="line-clamp-1"><strong className="text-slate-700">Comp:</strong> {item.customization.complements.join(", ")}</p><p className="line-clamp-1"><strong className="text-slate-700">Top:</strong> {item.customization.toppings.join(", ")}</p></div>)}</li>))}</ul>
                )}
            </div>
            <CheckoutForm onCheckout={onCheckout} hasItems={cart.length > 0} formData={checkoutFormData} setFormData={setCheckoutFormData} />
        </div>
    );
}
