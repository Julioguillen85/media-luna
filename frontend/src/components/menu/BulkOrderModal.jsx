import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export default function BulkOrderModal({ product, products = [], customization = null, isOpen, onClose, onConfirm }) {
    const [peopleCount, setPeopleCount] = useState('30');
    const [splitMode, setSplitMode] = useState(false);
    const [splitValue, setSplitValue] = useState(0);

    React.useEffect(() => {
        if (isOpen && product) {
            setPeopleCount((product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? '1' : '30');
            setSplitMode(false);
            setSplitValue(0);
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const numericCount = parseInt(peopleCount) || 0;
    const isBrincolin = product?.name?.toLowerCase().includes('brincol');
    const isRental = product?.category?.includes('Renta') || product?.productType === 'RENTAL';
    const minCount = isRental ? 1 : 30;
    const maxCount = isBrincolin ? 2 : 9999;
    const step = isRental ? 1 : 10;

    const handleConfirm = () => {
        const mc = isRental ? 1 : 30;
        if (numericCount >= mc) {
            const isElote = ['elote en vaso', 'elote revolcado'].some(name => product.name?.toLowerCase().includes(name));
            const otherElote = isElote ? products.find(p => ['elote en vaso', 'elote revolcado'].some(name => p.name?.toLowerCase().includes(name)) && p.id !== product.id) : null;
            onConfirm(numericCount, splitMode, splitValue, otherElote);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative transition-colors duration-300">
                <div className="p-6 bg-gradient-to-r from-rose-500 to-orange-500 dark:from-rose-900 dark:to-orange-900 text-white flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            {(product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? '¿Cuántas piezas? 🪑' : '¿Para cuántas personas? 👥'}
                        </h3>
                        <p className="text-rose-100 dark:text-orange-200 text-sm mt-1">{product.name}</p>
                    </div>
                    <button onClick={() => { setSplitMode(false); setSplitValue(0); onClose(); }} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center space-y-6">
                    {(!product?.category?.includes('Renta') && product?.productType !== 'RENTAL') && (
                        <p className="text-slate-600 dark:text-slate-300 text-center text-sm">
                            El pedido mínimo para <strong>snacks y bebidas</strong> es de 30 personas.
                        </p>
                    )}

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setPeopleCount(Math.max(minCount, numericCount - step).toString())}
                            disabled={numericCount <= minCount}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${numericCount <= minCount
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-900/60 active:scale-95 shadow-sm'
                                }`}
                        >
                            <Minus size={24} />
                        </button>

                        <div className="flex flex-col items-center min-w-[100px]">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={peopleCount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setPeopleCount(val);
                                }}
                                onBlur={() => {
                                    if (numericCount < minCount) setPeopleCount(minCount.toString());
                                    else if (numericCount > maxCount) setPeopleCount(maxCount.toString());
                                    else setPeopleCount(numericCount.toString());
                                }}
                                className="text-5xl font-extrabold text-slate-900 dark:text-white bg-transparent text-center w-24 outline-none"
                            />
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                {isRental ? 'Cantidad' : 'Personas'}
                            </span>
                        </div>

                        <button
                            onClick={() => setPeopleCount(Math.min(maxCount, numericCount + step).toString())}
                            disabled={numericCount >= maxCount}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${numericCount >= maxCount
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-900/60 active:scale-95 shadow-sm'
                                }`}
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    {/* Elote Split Selector */}
                    {(() => {
                        const isElote = ['elote en vaso', 'elote revolcado'].some(name => product.name?.toLowerCase().includes(name));
                        if (!isElote || numericCount < 30) return null;

                        const otherElote = products.find(p => ['elote en vaso', 'elote revolcado'].some(name => p.name?.toLowerCase().includes(name)) && p.id !== product.id);
                        if (!otherElote) return null;

                        return (
                            <div className="w-full mt-4 p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="bulkSplitMode"
                                        checked={splitMode}
                                        onChange={(e) => {
                                            setSplitMode(e.target.checked);
                                            setSplitValue(Math.floor(numericCount / 2));
                                        }}
                                        className="mt-1 w-4 h-4 accent-amber-500 rounded text-amber-500 focus:ring-amber-500"
                                    />
                                    <label htmlFor="bulkSplitMode" className="text-sm text-amber-900 font-medium cursor-pointer leading-tight">
                                        🌽 Al ser base elote, puedes combinar tu barra para tus invitados con {otherElote.name} (se agregarán ambos al carrito con precio combinado).
                                    </label>
                                </div>

                                {splitMode && (
                                    <div className="mt-5 px-3">
                                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">
                                            <span>{numericCount - splitValue}x {product.name}</span>
                                            <span>{splitValue}x {otherElote.name}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max={numericCount - 5}
                                            step="5"
                                            value={splitValue}
                                            onChange={e => setSplitValue(parseInt(e.target.value))}
                                            className="w-full form-range accent-amber-500 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
                {(() => {
                    let tiers = product.priceTiers || [];
                    if (customization && customization.size === 'quarter') {
                        tiers = product.quarterPriceTiers || product.priceTiers || [];
                    }
                    const minCount = (product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? 1 : 30;
                    const n = numericCount < minCount ? minCount : numericCount;
                    const matching = tiers.find(t => n >= t.minGuests && n <= t.maxGuests);
                    const closest = tiers.filter(t => t.minGuests <= n).sort((a, b) => b.minGuests - a.minGuests)[0];
                    const basePrice = product.rentalPricePerDay || product.price;
                    const total = matching?.price || closest?.price || (basePrice * n);

                    return total > 0 ? (
                        <div className="text-center mb-4">
                            <span className="text-2xl font-bold text-rose-600">
                                ${total.toLocaleString('es-MX')} MXN
                            </span>
                            <p className="text-xs text-slate-400">
                                precio total para {n} {(product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? (n === 1 ? 'producto' : 'productos') : 'personas'}
                            </p>
                        </div>
                    ) : null;
                })()}

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        {splitMode
                            ? `Agregar combinación a carrito`
                            : `Agregar ${numericCount < ((product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? 1 : 30) ? ((product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? 1 : 30) : numericCount} ${(product?.category?.includes('Renta') || product?.productType === 'RENTAL') ? (numericCount === 1 ? 'producto' : 'productos') : 'personas'}`
                        }
                    </button>
                </div>
            </div>
        </div >
    );
}
