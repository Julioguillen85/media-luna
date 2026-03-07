import React from 'react';
import { ShoppingCart, X, Trash2, FileText } from 'lucide-react';

export default function CartModal({ cart, onClose, removeFromCart, onContinueCheckout }) {
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl dark:shadow-rose-900/20 transition-colors duration-300 overflow-hidden">
                <div className="p-5 border-b dark:border-slate-800/50 flex justify-between items-center bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-950 dark:to-indigo-950 transition-colors duration-500">
                    <h3 className="font-bold text-xl flex items-center gap-2 text-slate-900 dark:text-white transition-colors duration-300">
                        <ShoppingCart className="text-rose-500 dark:text-rose-400" size={24} />
                        Tu Pedido ({cart.length})
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition">
                        <X size={24} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white dark:bg-slate-900 transition-colors duration-300">
                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                                <ShoppingCart className="text-slate-300 dark:text-slate-600 transition-colors duration-300" size={32} />
                            </div>
                            <p className="text-slate-400 dark:text-slate-500 font-medium transition-colors duration-300">Tu carrito está vacío</p>
                            <p className="text-xs text-slate-300 dark:text-slate-600 mt-2 transition-colors duration-300">Agrega productos para continuar</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.cartId} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <span className="font-bold text-slate-900 dark:text-slate-100 transition-colors duration-300">{item.name || item.product?.name || 'Producto'}</span>
                                            {item.customization && item.customization.size && (
                                                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors duration-300 ${item.customization.size === 'quarter' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50'}`}>
                                                    {item.customization.size === 'quarter' ? 'Bowl 1/4' : item.customization.size === 'half' ? 'Bowl 1/2' : item.customization.size}
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition group ml-2 shrink-0">
                                            <Trash2 size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition" />
                                        </button>
                                    </div>
                                    {/* Quantity + Price row */}
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/50 transition-colors duration-300">
                                                ×{item.quantity || 1}
                                            </span>
                                        </div>
                                        {item.totalPrice > 0 && (
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">
                                                ${item.totalPrice.toLocaleString('es-MX')}
                                            </span>
                                        )}
                                    </div>
                                    {item.customization && (item.customization.bases?.length > 0 || item.customization.complements?.length > 0 || item.customization.toppings?.length > 0) && (
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-800/50 mt-3 transition-colors duration-300">
                                            {item.customization.bases?.length > 0 && <p><strong className="text-slate-700 dark:text-slate-300 transition-colors duration-300">Base:</strong> {item.customization.bases.join(', ')}</p>}
                                            {item.customization.complements?.length > 0 && <p><strong className="text-slate-700 dark:text-slate-300 transition-colors duration-300">Complementos:</strong> {item.customization.complements.join(', ')}</p>}
                                            {item.customization.toppings?.length > 0 && <p><strong className="text-slate-700 dark:text-slate-300 transition-colors duration-300">Toppings:</strong> {item.customization.toppings.join(', ')}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="p-4 border-t dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900 space-y-2 transition-colors duration-300">
                        {/* Total row */}
                        {cart.some(i => i.totalPrice > 0) && (() => {
                            const subtotal = cart.reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const snackSubtotal = cart.filter(i => !i.isRental && !i.category?.includes('Renta') && i.productType !== 'RENTAL').reduce((acc, i) => acc + (i.totalPrice || 0), 0);
                            const discount = snackSubtotal * 0.15;
                            const total = subtotal - discount;

                            if (snackSubtotal === 0) {
                                return (
                                    <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-200 px-1 transition-colors duration-300 mb-2">
                                        <span>Total estimado</span>
                                        <span className="text-rose-600 dark:text-rose-400 transition-colors duration-300">
                                            ${total.toLocaleString('es-MX')} MXN
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-2 mb-2">
                                    <div className="flex justify-between items-center text-sm font-semibold text-slate-500 dark:text-slate-400 px-1 line-through decoration-slate-400/50">
                                        <span>Total regular</span>
                                        <span>${subtotal.toLocaleString('es-MX')} MXN</span>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-500/30 rounded-xl p-3 flex justify-between items-center shadow-sm">
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">✨ Si apartas tu fecha HOY:</span>
                                        <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                                            ${total.toLocaleString('es-MX')} MXN
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
                        <button onClick={onClose} className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-300">
                            Continuar comprando
                        </button>
                        <button onClick={onContinueCheckout} className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 dark:from-indigo-600 dark:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl dark:shadow-indigo-900/20 transition flex items-center justify-center gap-2">
                            <FileText size={18} />
                            Continuar pedido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
