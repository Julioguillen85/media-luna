import React from 'react';
import { ShoppingBag, X, Trash2, FileText } from 'lucide-react';

export default function CartModal({ cart, onClose, removeFromCart, onContinueCheckout }) {
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl">
                <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-rose-50 to-amber-50">
                    <h3 className="font-bold text-xl flex items-center gap-2 text-slate-900">
                        <ShoppingBag className="text-rose-500" size={24} />
                        Tu Pedido ({cart.length})
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition">
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    {cart.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="text-slate-300" size={32} />
                            </div>
                            <p className="text-slate-400 font-medium">Tu carrito está vacío</p>
                            <p className="text-xs text-slate-300 mt-2">Agrega productos para continuar</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.cartId} className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-bold text-slate-900">{item.name || item.product?.name || 'Producto'}</span>
                                            {item.customization && (
                                                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.customization.size === 'quarter' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                                    {item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}
                                                </span>
                                            )}
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 hover:bg-red-50 rounded-lg transition group">
                                            <Trash2 size={16} className="text-slate-400 group-hover:text-red-500 transition" />
                                        </button>
                                    </div>
                                    {item.customization && (
                                        <div className="text-[10px] text-slate-500 space-y-1 bg-white p-2 rounded border border-slate-100">
                                            <p><strong className="text-slate-700">Base:</strong> {item.customization.bases.join(', ')}</p>
                                            <p><strong className="text-slate-700">Complementos:</strong> {item.customization.complements.join(', ')}</p>
                                            <p><strong className="text-slate-700">Toppings:</strong> {item.customization.toppings.join(', ')}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {cart.length > 0 && (
                    <div className="p-5 border-t bg-slate-50 space-y-3">
                        <button onClick={onClose} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                            Continuar comprando
                        </button>
                        <button onClick={onContinueCheckout} className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
                            <FileText size={18} />
                            Continuar pedido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
