import React, { useState } from 'react';
import { X } from 'lucide-react';
import { isTray as checkIsTray } from '../../App';

export default function CustomizationModal({ product, options, onClose, onConfirm }) {
    const isTray = checkIsTray(product);
    const [size, setSize] = useState(isTray ? null : 'quarter');
    const [bases, setBases] = useState([]);
    const [complements, setComplements] = useState([]);
    const [toppings, setToppings] = useState([]);

    const maxBases = 2;
    const maxComplements = isTray ? 3 : 4;
    const maxToppings = isTray ? 3 : 6;

    const toggleOption = (list, setList, item, max) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            if (list.length < max) {
                setList([...list, item]);
            } else {
                alert(`Solo puedes elegir máximo ${max} opciones.`);
            }
        }
    };

    const isComplete = isTray ? bases.length > 0 && bases.length <= maxBases : bases.length === maxBases;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl dark:shadow-rose-900/20 overflow-hidden relative transition-colors duration-300">
                <div className="p-6 bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 dark:from-slate-950 dark:via-purple-900 dark:to-indigo-900 text-white flex justify-between items-start shrink-0 transition-colors duration-500">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">Arma tu {product.name} 🎨</h3>
                        <p className="text-rose-100 dark:text-purple-200 text-sm mt-1 opacity-90 transition-colors duration-300">Personalízalo a tu gusto</p>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 dark:bg-slate-800/50 custom-scrollbar transition-colors duration-300">
                    {/* Size Selection */}
                    {!isTray && (
                        <section>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2 text-lg transition-colors duration-300"><span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-300">1</span> Tamaño</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSize('quarter')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${size === 'quarter' ? 'border-rose-500 dark:border-rose-400 bg-white dark:bg-slate-800 shadow-lg shadow-rose-100 dark:shadow-rose-900/20 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors duration-300 ${size === 'quarter' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700'}`}>🥣</div>
                                    <span className={`font-bold transition-colors duration-300 ${size === 'quarter' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Bowl 1/4 (Chico)</span>
                                </button>
                                <button
                                    onClick={() => setSize('half')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${size === 'half' ? 'border-rose-500 dark:border-rose-400 bg-white dark:bg-slate-800 shadow-lg shadow-rose-100 dark:shadow-rose-900/20 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-700'}`}
                                >
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-colors duration-300 ${size === 'half' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-slate-200 dark:bg-slate-700'}`}>🍲</div>
                                    <span className={`font-bold transition-colors duration-300 ${size === 'half' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Bowl 1/2 (Grande)</span>
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Bases Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg transition-colors duration-300"><span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-300">{isTray ? '1' : '2'}</span> Bases <span className="text-sm font-normal text-slate-500 dark:text-slate-400 transition-colors duration-300">(Elige {isTray ? '1 o ' : ''}{maxBases})</span></h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full transition-colors duration-300 ${bases.length > 0 && bases.length <= maxBases ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'}`}>{bases.length}/{maxBases}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.bases.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(bases, setBases, opt, maxBases)}
                                    disabled={!bases.includes(opt) && bases.length >= maxBases}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${bases.includes(opt) ? 'border-rose-500 dark:border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-200 dark:hover:border-rose-500/50 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Complements Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg transition-colors duration-300"><span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-300">{isTray ? '2' : '3'}</span> Complementos <span className="text-sm font-normal text-slate-500 dark:text-slate-400 transition-colors duration-300">(Máx {maxComplements})</span></h4>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors duration-300">{complements.length}/{maxComplements}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.complements.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(complements, setComplements, opt, maxComplements)}
                                    disabled={!complements.includes(opt) && complements.length >= maxComplements}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${complements.includes(opt) ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-200 dark:hover:border-blue-500/50 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Toppings Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg transition-colors duration-300"><span className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-300">{isTray ? '3' : '4'}</span> Toppings <span className="text-sm font-normal text-slate-500 dark:text-slate-400 transition-colors duration-300">(Máx {maxToppings})</span></h4>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors duration-300">{toppings.length}/{maxToppings}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.toppings.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(toppings, setToppings, opt, maxToppings)}
                                    disabled={!toppings.includes(opt) && toppings.length >= maxToppings}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${toppings.includes(opt) ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-200 dark:hover:border-amber-500/50 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-rose-900/10 z-10 transition-colors duration-300">
                    <button
                        onClick={() => onConfirm(isTray ? { bases, complements, toppings } : { size, bases, complements, toppings })}
                        disabled={!isComplete}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isComplete ? 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-purple-700 text-white hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border dark:border-slate-700'}`}
                    >
                        {isComplete ? '✨ Agregar a mi pedido' : `⚠️ Selecciona ${isTray ? 'al menos 1 base' : '2 bases'} para continuar`}
                    </button>
                </div>
            </div>
        </div>
    );
}
