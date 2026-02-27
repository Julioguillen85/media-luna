import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmationModal({ product, onClose, onConfirm }) {
    if (!product) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl flex flex-col p-6 text-center transform transition-all scale-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="text-red-500" size={32} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar Producto?</h3>

                <p className="text-slate-600 mb-6">
                    ¿Estás seguro que deseas eliminar <span className="font-bold text-slate-800">"{product.name}"</span>?
                    <br /><br />
                    <span className="text-xs flex items-center justify-center gap-1 text-amber-600 font-semibold bg-amber-50 py-1 px-2 rounded-lg">
                        <AlertTriangle size={14} /> Esta acción no se puede deshacer.
                    </span>
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(product.id)}
                        className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}
