import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CustomizationModal({ product, options, onClose, onConfirm }) {
    const [size, setSize] = useState('quarter');
    const [bases, setBases] = useState([]);
    const [complements, setComplements] = useState([]);
    const [toppings, setToppings] = useState([]);

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

    const isComplete = bases.length === 2;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
                <div className="p-6 bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 text-white flex justify-between items-start shrink-0">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-2">Arma tu {product.name} 🎨</h3>
                        <p className="text-rose-100 text-sm mt-1 opacity-90">Personalízalo a tu gusto</p>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
                    {/* Size Selection */}
                    <section>
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg"><span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Tamaño</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSize('quarter')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${size === 'quarter' ? 'border-rose-500 bg-white shadow-lg shadow-rose-100 scale-[1.02]' : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-white'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${size === 'quarter' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200'}`}>🥣</div>
                                <span className="font-bold">Bowl 1/4 (Chico)</span>
                            </button>
                            <button
                                onClick={() => setSize('half')}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${size === 'half' ? 'border-rose-500 bg-white shadow-lg shadow-rose-100 scale-[1.02]' : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-white'}`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${size === 'half' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200'}`}>🍲</div>
                                <span className="font-bold">Bowl 1/2 (Grande)</span>
                            </button>
                        </div>
                    </section>

                    {/* Bases Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> Bases <span className="text-sm font-normal text-slate-500">(Elige 2)</span></h4>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${bases.length === 2 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{bases.length}/2</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.bases.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(bases, setBases, opt, 2)}
                                    disabled={!bases.includes(opt) && bases.length >= 2}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${bases.includes(opt) ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 bg-white hover:border-rose-200 disabled:opacity-50 disabled:bg-slate-50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Complements Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span> Complementos <span className="text-sm font-normal text-slate-500">(Máx 4)</span></h4>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">{complements.length}/4</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.complements.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(complements, setComplements, opt, 4)}
                                    disabled={!complements.includes(opt) && complements.length >= 4}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${complements.includes(opt) ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white hover:border-blue-200 disabled:opacity-50 disabled:bg-slate-50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Toppings Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg"><span className="bg-rose-100 text-rose-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span> Toppings <span className="text-sm font-normal text-slate-500">(Máx 6)</span></h4>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">{toppings.length}/6</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {options.toppings.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => toggleOption(toppings, setToppings, opt, 6)}
                                    disabled={!toppings.includes(opt) && toppings.length >= 6}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${toppings.includes(opt) ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-slate-200 bg-white hover:border-amber-200 disabled:opacity-50 disabled:bg-slate-50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                    <button
                        onClick={() => onConfirm({ size, bases, complements, toppings })}
                        disabled={!isComplete}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${isComplete ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-2xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        {isComplete ? '✨ Agregar a mi pedido' : '⚠️ Selecciona 2 bases para continuar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
