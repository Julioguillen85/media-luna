import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function ProductFormModal({ product, categories, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0] || 'Tostitos',
        price: '',
        description: '',
        img: '',
        customizable: false
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || categories[0],
                price: product.price || '',
                description: product.description || product.desc || '',
                img: product.img || '',
                customizable: product.customizable || false // This might need logic if checking ID against list
            });
        }
    }, [product, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Precio</label>
                                <input type="number" step="0.50" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">URL Imagen</label>
                            <input type="url" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="customizable" checked={formData.customizable} onChange={e => setFormData({ ...formData, customizable: e.target.checked })} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-gray-300" />
                            <label htmlFor="customizable" className="text-sm font-medium text-slate-700">Producto personalizable (Bowl)</label>
                        </div>
                    </form>
                </div>
                <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
                    <button type="submit" form="product-form" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition flex items-center gap-2">
                        <Save size={18} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
