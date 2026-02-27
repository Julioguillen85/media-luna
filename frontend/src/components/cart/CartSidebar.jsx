import React from 'react';
import { ShoppingBag, Sparkles, X, CheckCircle } from 'lucide-react';

export default function CartSidebar({ cart, removeFromCart, openBot, onCheckout }) {
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const total = cart.reduce((acc, i) => acc + (i.totalPrice || 0), 0);

    return (
        <div className="glass-panel p-6 rounded-3xl mb-8 hidden lg:block">
            <div className="flex items-center justify-between mb-6 border-b border-white/70 dark:border-white/10 pb-4">
                <h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white transition-colors duration-300">
                    <ShoppingBag className="text-rose-500 dark:text-rose-400" /> Solicitud
                </h2>
                <span className="bg-rose-500/10 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/50 shadow-sm transition-colors duration-300">
                    {totalItems} items
                </span>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 p-4 rounded-2xl mb-4 max-h-[420px] overflow-y-auto custom-scrollbar border border-white/80 dark:border-white/10 shadow-inner transition-colors duration-300">
                {cart.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="bg-white dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-slate-100 dark:border-slate-600 transition-colors duration-300">
                            <ShoppingBag className="text-slate-300 dark:text-slate-500" size={32} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-3">Tu lista está vacía</p>
                        <button onClick={openBot} className="text-xs bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-full font-bold hover:-translate-y-0.5 transition-transform shadow-lg shadow-rose-100 dark:shadow-rose-900/20 flex items-center gap-1 mx-auto">
                            <Sparkles size={14} className="text-amber-300" /> Pedir ayuda a Lunita
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {cart.map((item, idx) => (
                            <li key={item.cartId || idx} className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm animate-fade-in border border-slate-100 dark:border-slate-600 transition-colors duration-300">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.name}</span>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2 shrink-0"><X size={16} /></button>
                                </div>
                                {item.customization && (
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 mb-1 space-y-0.5 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                                        <p className="line-clamp-1"><strong className="text-slate-700 dark:text-slate-300">Base:</strong> {item.customization.bases.join(", ")}</p>
                                        <p className="line-clamp-1"><strong className="text-slate-700 dark:text-slate-300">Comp:</strong> {item.customization.complements.join(", ")}</p>
                                        <p className="line-clamp-1"><strong className="text-slate-700 dark:text-slate-300">Top:</strong> {item.customization.toppings.join(", ")}</p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/50">×{item.quantity || 1}</span>
                                    </div>
                                    {item.totalPrice > 0 && (
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">${item.totalPrice.toLocaleString('es-MX')}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                        {total > 0 && (() => {
                            const snackSubtotal = cart.filter(i => !i.isRental && !i.category?.includes('Renta') && i.productType !== 'RENTAL').reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const discountAmount = snackSubtotal * 0.15;
                            const discountTotal = total - discountAmount;

                            if (snackSubtotal === 0) {
                                return (
                                    <li className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 px-1 transition-colors duration-300">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Total estimado</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${total.toLocaleString('es-MX')} MXN</span>
                                    </li>
                                );
                            }

                            return (
                                <li className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300 space-y-2">
                                    <div className="flex justify-between items-center text-[13px] font-semibold text-slate-500 dark:text-slate-400 px-1 line-through decoration-slate-400/50">
                                        <span>Total regular</span>
                                        <span>${total.toLocaleString('es-MX')}</span>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-500/30 rounded-xl p-3 flex justify-between items-center shadow-sm gap-2">
                                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">✨ Si apartas tu fecha HOY:</span>
                                        <span className="text-base font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                            ${discountTotal.toLocaleString('es-MX')}
                                        </span>
                                    </div>
                                </li>
                            );
                        })()}
                    </ul>
                )}
            </div>

            {/* Finalizar compra button */}
            {cart.length > 0 && (
                <button
                    onClick={onCheckout}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-rose-200 transition-all active:scale-95"
                >
                    <CheckCircle size={18} /> Finalizar compra
                </button>
            )}
        </div>
    );
}
