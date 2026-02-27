import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

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
            let parsedSpecs = {};
            try {
                parsedSpecs = typeof product.specifications === 'string'
                    ? JSON.parse(product.specifications)
                    : (product.specifications || {});
            } catch (e) {
                console.error("Error parsing specifications JSON", e);
                parsedSpecs = {};
            }

            setFormData({
                name: product.name || '',
                category: product.category || categories[0],
                price: product.price || '',
                description: product.description || product.desc || '',
                img: product.img || '',
                customizable: product.customizable || false,
                productType: product.productType || 'SNACK',
                rentalPricePerDay: product.rentalPricePerDay || '',
                specifications: parsedSpecs
            });
        }
    }, [product, categories]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...(product || {}),
            ...formData,
            specifications: JSON.stringify(formData.specifications)
        };
        onSave(submissionData);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl dark:shadow-rose-900/20 flex flex-col max-h-[90vh] transition-colors duration-300">
                <div className="p-5 border-b dark:border-slate-800/50 flex justify-between items-center transition-colors duration-300">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white transition-colors duration-300">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors duration-300">
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* Product Type Selector */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Tipo de Producto</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, productType: 'SNACK' })}
                                    className={`flex-1 py-2 px-4 rounded-xl font-bold border-2 transition-colors duration-300 ${formData.productType === 'SNACK' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600'}`}
                                >
                                    🍿 Snack
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, productType: 'RENTAL' })}
                                    className={`flex-1 py-2 px-4 rounded-xl font-bold border-2 transition-colors duration-300 ${formData.productType === 'RENTAL' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200 dark:hover:border-slate-600'}`}
                                >
                                    🪑 Renta
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Nombre</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Categoría</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    {/* Add generic rental category if not present */}
                                    {formData.productType === 'RENTAL' && !categories.includes('Mobiliario') && <option value="Mobiliario">Mobiliario</option>}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">
                                    {formData.productType === 'RENTAL' ? 'Precio de Renta (x día)' : 'Precio'}
                                </label>
                                <input
                                    type="number"
                                    step="0.50"
                                    required
                                    value={formData.productType === 'RENTAL' ? formData.rentalPricePerDay : formData.price}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (formData.productType === 'RENTAL') {
                                            setFormData({ ...formData, rentalPricePerDay: val, price: val });
                                        } else {
                                            setFormData({ ...formData, price: val });
                                        }
                                    }}
                                    className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300"
                                />
                            </div>
                        </div>

                        {/* Rental Specifications */}
                        {formData.productType === 'RENTAL' && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3 transition-colors duration-300">
                                <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm transition-colors duration-300">Especificaciones de Renta</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-500 mb-1 transition-colors duration-300">Capacidad (Personas)</label>
                                        <input
                                            type="text"
                                            value={formData.specifications?.capacity || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                specifications: { ...formData.specifications, capacity: e.target.value }
                                            })}
                                            placeholder="Ej. 10"
                                            className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-500 mb-1 transition-colors duration-300">Material</label>
                                        <input
                                            type="text"
                                            value={formData.specifications?.material || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                specifications: { ...formData.specifications, material: e.target.value }
                                            })}
                                            placeholder="Ej. Plástico, Madera"
                                            className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-500 mb-1 transition-colors duration-300">Dimensiones</label>
                                        <input
                                            type="text"
                                            value={formData.specifications?.dimensions || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                specifications: { ...formData.specifications, dimensions: e.target.value }
                                            })}
                                            placeholder="Ej. 2.40m x 0.75m"
                                            className="w-full p-2 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
                                        />
                                    </div>

                                    {/* Variantes Section */}
                                    <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-800/30 transition-colors duration-300">
                                        <label className="block text-xs font-bold text-blue-700 dark:text-blue-500 mb-2 transition-colors duration-300">Variantes (Opcional - Ej. Niño/Niña)</label>
                                        <div className="space-y-2">
                                            {(formData.specifications?.variants || []).map((variant, idx) => (
                                                <div key={idx} className="flex gap-2 items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-blue-100 dark:border-blue-900/40 transition-colors duration-300">
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre (ej. Niño)"
                                                        value={variant.name}
                                                        onChange={e => {
                                                            const newVariants = [...(formData.specifications.variants || [])];
                                                            newVariants[idx].name = e.target.value;
                                                            setFormData({ ...formData, specifications: { ...formData.specifications, variants: newVariants } });
                                                        }}
                                                        className="flex-1 p-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded outline-none bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="URL Imagen"
                                                        value={variant.img}
                                                        onChange={e => {
                                                            const newVariants = [...(formData.specifications.variants || [])];
                                                            newVariants[idx].img = e.target.value;
                                                            setFormData({ ...formData, specifications: { ...formData.specifications, variants: newVariants } });
                                                        }}
                                                        className="flex-1 p-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded outline-none bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newVariants = formData.specifications.variants.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, specifications: { ...formData.specifications, variants: newVariants } });
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-300"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newVariants = [...(formData.specifications.variants || []), { name: '', img: '' }];
                                                    setFormData({ ...formData, specifications: { ...formData.specifications, variants: newVariants } });
                                                }}
                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors duration-300"
                                            >
                                                <Plus size={14} /> Agregar Variante
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">Descripción</label>
                            <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 transition-colors duration-300">URL Imagen</label>
                            <input type="text" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} placeholder="https://... o /images/producto.jpg" className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors duration-300" />
                        </div>

                        {formData.productType === 'SNACK' && (
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="customizable" checked={formData.customizable} onChange={e => setFormData({ ...formData, customizable: e.target.checked })} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-colors duration-300" />
                                <label htmlFor="customizable" className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Producto personalizable (Bowl)</label>
                            </div>
                        )}
                    </form>
                </div>
                <div className="p-5 border-t dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl transition-colors duration-300">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300">Cancelar</button>
                    <button type="submit" form="product-form" className="px-5 py-2.5 bg-slate-900 dark:bg-rose-600 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 dark:hover:bg-rose-500 transition-colors duration-300 flex items-center gap-2">
                        <Save size={18} /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
