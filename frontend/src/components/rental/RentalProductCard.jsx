import React, { useState } from 'react';
import { Plus, Minus, Info } from 'lucide-react';

export default function RentalProductCard({ product, onAddToCart }) {
    const [quantity, setQuantity] = useState(1);
    const specs = product.specifications ? JSON.parse(product.specifications) : {};
    const [selectedVariant, setSelectedVariant] = useState(specs.variants && specs.variants.length > 0 ? specs.variants[0] : null);

    const handleAdd = () => {
        onAddToCart({
            ...product,
            name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
            img: selectedVariant ? selectedVariant.img : product.img,
            quantity,
            isRental: true,
            totalPrice: (product.rentalPricePerDay || product.price) * quantity,
            selectedVariant
        });
        setQuantity(1);
    };

    const getImageUrl = (img) => {
        if (!img) return '';
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        if (img.startsWith('/')) return img;
        return `/${img}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition flex flex-col h-full animate-fade-in border border-slate-100">
            <div className="relative h-56 overflow-hidden group bg-slate-100">
                <img
                    src={getImageUrl(selectedVariant ? selectedVariant.img : product.img)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }}
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-slate-700 shadow-sm border border-slate-100 uppercase tracking-wide flex items-center gap-2">
                    Renta
                </div>
                {/* Variant Indicator Overlay */}
                {selectedVariant && (
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/20">
                        {selectedVariant.name}
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight">{product.name}</h3>

                {/* Variant Selector */}
                {specs.variants && specs.variants.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Selecciona Modelo:</p>
                        <div className="flex gap-2 flex-wrap">
                            {specs.variants.map((variant, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border-2 ${selectedVariant?.name === variant.name
                                        ? 'border-rose-500 bg-rose-50 text-rose-600'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {variant.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">{product.description}</p>

                {/* Especificaciones Compactas */}
                <div className="bg-slate-50 rounded-xl p-3 mb-5 text-xs space-y-2 border border-slate-100">
                    {specs.dimensions && (
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Dimensiones</span>
                            <span className="font-semibold text-slate-700">{specs.dimensions}</span>
                        </div>
                    )}
                    {specs.capacity && (
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1 last:border-0 last:pb-0">
                            <span className="font-bold text-slate-400">Capacidad</span>
                            <span className="font-semibold text-slate-700">{specs.capacity}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-0.5">Precio x día</span>
                            <p className="text-2xl font-black text-slate-900 leading-none">
                                ${product.rentalPricePerDay || product.price}
                            </p>
                        </div>

                        {/* Control de cantidad */}
                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-8 h-8 rounded-lg bg-white shadow-sm text-slate-600 hover:text-rose-600 active:scale-95 transition flex items-center justify-center border border-slate-100"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800 text-lg">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-8 h-8 rounded-lg bg-white shadow-sm text-slate-600 hover:text-rose-600 active:scale-95 transition flex items-center justify-center border border-slate-100"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 active:scale-95 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} className="text-rose-400" />
                        <span>Agregar al Pedido</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
