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
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-t-xl">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Elige hasta {max} opciones</h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400">
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
                                ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-200 dark:hover:border-rose-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="truncate mr-1">{ing}</span>
                            {selected.includes(ing) && <Check size={14} className="text-rose-500 shrink-0" />}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-b-xl">
                <button
                    onClick={() => onConfirm(selected)}
                    disabled={selected.length < min}
                    className={`w-full py-2.5 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 text-sm ${selected.length < min
                        ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-slate-800 to-slate-900 dark:from-rose-500 dark:to-rose-600 text-white hover:shadow-lg'
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
