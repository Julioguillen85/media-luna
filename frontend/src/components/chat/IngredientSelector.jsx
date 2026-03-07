import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function IngredientSelector({ options = [], min = 0, max = 10, onConfirm, onClose }) {
    const [selected, setSelected] = useState([]);

    const toggleIngredient = (ing) => {
        if (selected.includes(ing)) {
            setSelected(prev => prev.filter(i => i !== ing));
        } else {
            if (selected.length < max) {
                setSelected(prev => [...prev, ing]);
            }
        }
    };

    return (
        <div className="flex flex-col animate-fade-in w-full">
            <div className="p-3 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-slate-800 text-sm">Elige hasta {max} opciones</h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                        <X size={16} />
                    </button>
                )}
            </div>
            <div className="p-3 max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                    {options.map((ing) => (
                        <button
                            key={ing}
                            onClick={() => toggleIngredient(ing)}
                            className={`p-2 rounded-lg border text-xs font-medium transition-all text-left flex justify-between items-center ${selected.includes(ing)
                                ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50'
                                }`}
                        >
                            <span className="truncate mr-1">{ing}</span>
                            {selected.includes(ing) && <Check size={14} className="text-rose-500 shrink-0" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-3 border-t bg-slate-50 rounded-b-xl">
                <button
                    onClick={() => onConfirm(selected)}
                    disabled={selected.length < min}
                    className={`w-full py-2.5 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 text-sm ${selected.length < min
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-lg'
                        }`}
                >
                    {selected.length < min
                        ? `Selecciona al menos ${min}`
                        : `Confirmar (${selected.length})`
                    }
                </button>
            </div>
        </div>
    );
}
