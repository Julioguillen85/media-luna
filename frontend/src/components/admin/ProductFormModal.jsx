import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, Plus, Camera, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export default function ProductFormModal({ product, categories, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0] || 'Tostitos',
        price: '',
        description: '',
        img: '',
        gallery: [],
        productType: 'SNACK',
        rentalPricePerDay: '',
        specifications: {},
        priceTiers: [],
        quarterPriceTiers: []
    });
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [percentageIncrease, setPercentageIncrease] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (product) {
            let parsedSpecs = {};
            try {
                parsedSpecs = typeof product.specifications === 'string'
                    ? JSON.parse(product.specifications)
                    : (product.specifications || {});
            } catch (e) {
                parsedSpecs = {};
            }

            setFormData({
                name: product.name || '',
                category: product.category || categories[0],
                price: product.price || '',
                description: product.description || product.desc || '',
                img: product.img || '',
                gallery: product.gallery || [],
                customizable: product.customizable || false,
                productType: product.productType || 'SNACK',
                rentalPricePerDay: product.rentalPricePerDay || '',
                specifications: parsedSpecs,
                priceTiers: product.priceTiers ? product.priceTiers.map(pt => ({ id: pt.id, minGuests: pt.minGuests, maxGuests: pt.maxGuests, price: pt.price })) : [],
                quarterPriceTiers: product.quarterPriceTiers ? product.quarterPriceTiers.map(pt => ({ id: pt.id, minGuests: pt.minGuests, maxGuests: pt.maxGuests, price: pt.price })) : []
            });
        }
    }, [product, categories]);

    const uploadFile = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Reset input so same file can be re-selected
        e.target.value = '';

        const currentImages = [formData.img, ...(formData.gallery || [])].filter(Boolean);
        const slotsAvailable = 5 - currentImages.length;
        if (slotsAvailable <= 0) return;

        setUploading(true);
        try {
            const filesToUpload = files.slice(0, slotsAvailable);
            const uploadedUrls = [];
            for (const file of filesToUpload) {
                const url = await uploadFile(file);
                uploadedUrls.push(url);
            }

            // Batch update all uploaded URLs at once
            setFormData(prev => {
                const existing = [prev.img, ...(prev.gallery || [])].filter(Boolean);
                const allImages = [...existing, ...uploadedUrls];
                return {
                    ...prev,
                    img: allImages[0] || '',
                    gallery: allImages.slice(1)
                };
            });
        } catch (err) {
            console.error('Error uploading:', err);
            alert('Error al subir la imagen. Intenta de nuevo.');
        }
        setUploading(false);
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => {
            const allImages = [prev.img, ...(prev.gallery || [])].filter(Boolean);
            allImages.splice(indexToRemove, 1);
            return {
                ...prev,
                img: allImages[0] || '',
                gallery: allImages.slice(1)
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...(product || {}),
            ...formData,
            specifications: JSON.stringify(formData.specifications),
            // Ensure base price is somewhat representative for snacks
            price: formData.productType === 'SNACK' ? (formData.priceTiers?.length > 0 ? formData.priceTiers[0].price : 0) : formData.price
        });
    };

    const handleApplyPercentage = () => {
        const percent = parseFloat(percentageIncrease);
        if (!isNaN(percent) && percent !== 0) {
            const multiplier = 1 + (percent / 100);
            const updatedTiers = formData.priceTiers.map(t => ({
                ...t,
                price: Math.round(t.price * multiplier)
            }));
            const updatedQuarterTiers = formData.quarterPriceTiers.map(t => ({
                ...t,
                price: Math.round(t.price * multiplier)
            }));
            setFormData({ ...formData, priceTiers: updatedTiers, quarterPriceTiers: updatedQuarterTiers });
            setPercentageIncrease('');
        }
    };

    const allImages = [formData.img, ...(formData.gallery || [])].filter(Boolean);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-h-[80vh] sm:max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="px-5 pt-5 pb-3 flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                            {product ? '✏️ Editar' : '➕ Nuevo'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {product ? product.name : 'Crea un nuevo producto'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 -mt-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X size={22} className="text-slate-400" />
                    </button>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 px-5 pb-3 shrink-0">
                    {[
                        { id: 'info', label: 'Información' },
                        { id: 'photos', label: `Fotos (${allImages.length})` },
                        ...(formData.productType === 'RENTAL' ? [{ id: 'rental', label: 'Renta' }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 dark:bg-rose-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-4">

                        {/* ════ TAB: INFO ════ */}
                        {activeTab === 'info' && (
                            <>
                                {/* Type */}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setFormData({ ...formData, productType: 'SNACK' })}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${formData.productType === 'SNACK' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        🍿 Snack
                                    </button>
                                    <button type="button" onClick={() => setFormData({ ...formData, productType: 'RENTAL' })}
                                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${formData.productType === 'RENTAL' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                        🪑 Renta
                                    </button>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Nombre</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900/30 transition-all" />
                                </div>

                                {/* Category + Price */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={formData.productType === 'SNACK' ? 'col-span-2' : ''}>
                                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Categoría</label>
                                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-rose-400 transition-all">
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            {formData.productType === 'RENTAL' && !categories.includes('Mobiliario') && <option value="Mobiliario">Mobiliario</option>}
                                        </select>
                                    </div>
                                    {formData.productType === 'RENTAL' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">
                                                Precio / Pieza
                                            </label>
                                            <input type="number" step="0.50" required
                                                value={formData.rentalPricePerDay || formData.price}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setFormData({ ...formData, rentalPricePerDay: val, price: val });
                                                }}
                                                placeholder="$0"
                                                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-blue-400 transition-all" />
                                        </div>
                                    )}
                                </div>

                                {/* Volume Pricing for Beverages/Snacks */}
                                {formData.productType === 'SNACK' && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Precios por Volumen</label>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
                                                <input type="number" placeholder="%" value={percentageIncrease} onChange={e => setPercentageIncrease(e.target.value)}
                                                    className="w-12 p-1 text-xs text-center border border-slate-200 dark:border-slate-700 rounded outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                                                <button type="button" onClick={handleApplyPercentage}
                                                    className="px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold rounded hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                                                    Aplicar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                            {(formData.priceTiers || []).map((tier, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">👤</span>
                                                        <input type="number" placeholder="Personas" value={tier.minGuests || ''}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                const newTiers = [...formData.priceTiers];
                                                                newTiers[idx] = { ...tier, minGuests: val, maxGuests: val };
                                                                setFormData({ ...formData, priceTiers: newTiers });
                                                            }}
                                                            className="w-full pl-8 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-rose-400" />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                                        <input type="number" step="0.50" placeholder="Precio" value={tier.price || ''}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const newTiers = [...formData.priceTiers];
                                                                newTiers[idx] = { ...tier, price: val };
                                                                setFormData({ ...formData, priceTiers: newTiers });
                                                            }}
                                                            className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-rose-400" />
                                                    </div>
                                                    <button type="button"
                                                        onClick={() => {
                                                            const newTiers = formData.priceTiers.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, priceTiers: newTiers });
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button"
                                            onClick={() => {
                                                const newTiers = [...(formData.priceTiers || []), { minGuests: 0, maxGuests: 0, price: 0 }];
                                                setFormData({ ...formData, priceTiers: newTiers });
                                            }}
                                            className="mt-2 w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-1.5">
                                            <Plus size={14} /> Añadir precio por volumen
                                        </button>
                                        {(formData.priceTiers || []).length === 0 && (
                                            <p className="text-[10px] text-rose-500 mt-1 text-center font-medium">Debe añadir al menos un precio para que el producto sea válido.</p>
                                        )}
                                    </div>
                                )}

                                {/* Volume Pricing for 1/4 Bowls if applicable */}
                                {formData.productType === 'SNACK' && (formData.customizable || (formData.quarterPriceTiers && formData.quarterPriceTiers.length > 0)) && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Precios Bowl 1/4 (Botecito)</label>
                                        </div>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                            {(formData.quarterPriceTiers || []).map((tier, idx) => (
                                                <div key={idx} className="flex gap-2 items-center">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">👤</span>
                                                        <input type="number" placeholder="Personas" value={tier.minGuests || ''}
                                                            onChange={e => {
                                                                const val = parseInt(e.target.value) || 0;
                                                                const newTiers = [...formData.quarterPriceTiers];
                                                                newTiers[idx] = { ...tier, minGuests: val, maxGuests: val };
                                                                setFormData({ ...formData, quarterPriceTiers: newTiers });
                                                            }}
                                                            className="w-full pl-8 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-rose-400" />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                                                        <input type="number" step="0.50" placeholder="Precio" value={tier.price || ''}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const newTiers = [...formData.quarterPriceTiers];
                                                                newTiers[idx] = { ...tier, price: val };
                                                                setFormData({ ...formData, quarterPriceTiers: newTiers });
                                                            }}
                                                            className="w-full pl-7 pr-2 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-rose-400" />
                                                    </div>
                                                    <button type="button"
                                                        onClick={() => {
                                                            const newTiers = formData.quarterPriceTiers.filter((_, i) => i !== idx);
                                                            setFormData({ ...formData, quarterPriceTiers: newTiers });
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button"
                                            onClick={() => {
                                                const newTiers = [...(formData.quarterPriceTiers || []), { minGuests: 0, maxGuests: 0, price: 0 }];
                                                setFormData({ ...formData, quarterPriceTiers: newTiers });
                                            }}
                                            className="mt-2 w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-1.5">
                                            <Plus size={14} /> Añadir precio Bowl 1/4
                                        </button>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Descripción</label>
                                    <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe el producto..."
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-rose-400 transition-all" />
                                </div>

                                {/* Customizable */}
                                {formData.productType === 'SNACK' && (
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer active:scale-[0.98] transition-transform">
                                        <input type="checkbox" checked={formData.customizable}
                                            onChange={e => setFormData({ ...formData, customizable: e.target.checked })}
                                            className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-slate-300 dark:border-slate-600" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Producto personalizable (Bowl)</span>
                                    </label>
                                )}
                            </>
                        )}

                        {/* ════ TAB: PHOTOS ════ */}
                        {activeTab === 'photos' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Galería de fotos</p>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{allImages.length} / 5</span>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-3 gap-2.5">
                                    {allImages.map((url, idx) => (
                                        <div key={url + idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 group">
                                            <img src={url} alt={`Foto ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2394a3b8" font-size="12">Error</text></svg>'; }} />
                                            {idx === 0 && (
                                                <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg uppercase tracking-wider">
                                                    Principal
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }}
                                                className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload button */}
                                    {allImages.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-rose-50/50 dark:hover:bg-rose-900/10"
                                        >
                                            {uploading ? (
                                                <div className="w-7 h-7 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera size={22} className="text-slate-400 dark:text-slate-500" />
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Subir foto</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />

                                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                                    📸 Sube hasta <strong>5 fotos</strong> desde tu galería.
                                    La primera será la imagen principal del producto.
                                </p>

                                {/* URL fallback */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">O pegar URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="url-paste-input"
                                            type="text"
                                            placeholder="https://..."
                                            className="flex-1 p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:border-rose-400 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('url-paste-input');
                                                const url = input?.value?.trim();
                                                if (url && allImages.length < 5) {
                                                    setFormData(prev => {
                                                        const existing = [prev.img, ...(prev.gallery || [])].filter(Boolean);
                                                        const all = [...existing, url];
                                                        return { ...prev, img: all[0] || '', gallery: all.slice(1) };
                                                    });
                                                    input.value = '';
                                                }
                                            }}
                                            className="px-4 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════ TAB: RENTAL ════ */}
                        {activeTab === 'rental' && formData.productType === 'RENTAL' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Capacidad</label>
                                        <input type="text" value={formData.specifications?.capacity || ''}
                                            onChange={e => setFormData({ ...formData, specifications: { ...formData.specifications, capacity: e.target.value } })}
                                            placeholder="10 personas"
                                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Material</label>
                                        <input type="text" value={formData.specifications?.material || ''}
                                            onChange={e => setFormData({ ...formData, specifications: { ...formData.specifications, material: e.target.value } })}
                                            placeholder="Plástico"
                                            className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">Dimensiones</label>
                                    <input type="text" value={formData.specifications?.dimensions || ''}
                                        onChange={e => setFormData({ ...formData, specifications: { ...formData.specifications, dimensions: e.target.value } })}
                                        placeholder="2.40m x 0.75m"
                                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm" />
                                </div>

                                {/* Variants */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Variantes</label>
                                    <div className="space-y-2">
                                        {(formData.specifications?.variants || []).map((variant, idx) => (
                                            <div key={idx} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                                                <input type="text" placeholder="Nombre" value={variant.name}
                                                    onChange={e => {
                                                        const v = [...(formData.specifications.variants || [])];
                                                        v[idx] = { ...v[idx], name: e.target.value };
                                                        setFormData({ ...formData, specifications: { ...formData.specifications, variants: v } });
                                                    }}
                                                    className="flex-1 p-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
                                                <button type="button"
                                                    onClick={() => {
                                                        const v = formData.specifications.variants.filter((_, i) => i !== idx);
                                                        setFormData({ ...formData, specifications: { ...formData.specifications, variants: v } });
                                                    }}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button"
                                            onClick={() => {
                                                const v = [...(formData.specifications?.variants || []), { name: '', img: '' }];
                                                setFormData({ ...formData, specifications: { ...formData.specifications, variants: v } });
                                            }}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            <Plus size={14} /> Agregar variante
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Footer ── */}
                <div className="px-5 py-4 border-t dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-950/50 flex gap-3 shrink-0">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                        Cancelar
                    </button>
                    <button type="submit" form="product-form"
                        className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
                        <Save size={16} /> Guardar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
