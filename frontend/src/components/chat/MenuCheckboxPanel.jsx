import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Interactive checkbox menu panel for the chat.
 * Shows all snacks/beverages grouped by category.
 * User can check multiple items and confirm to add them all at once.
 */
export default function MenuCheckboxPanel({ products, onConfirm }) {
    const [checked, setChecked] = useState({});
    const [expanded, setExpanded] = useState({});

    // Group products by category
    const groups = products.reduce((acc, p) => {
        const cat = p.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    const toggle = (id) => {
        setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleGroup = (cat) => {
        setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const selectedCount = Object.values(checked).filter(Boolean).length;

    const handleConfirm = () => {
        const selected = products.filter(p => checked[p.id]);
        if (selected.length === 0) return;
        onConfirm(selected);
        setChecked({});
    };

    return (
        <div className="mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden w-full max-w-xs">
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-900/20 dark:to-amber-900/20 px-3 py-2 border-b border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">🍉 Selecciona lo que quieras:</p>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50">
                {Object.entries(groups).map(([cat, items]) => (
                    <div key={cat}>
                        {/* Category header — collapsible */}
                        <button
                            onClick={() => toggleGroup(cat)}
                            className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                {cat}
                            </span>
                            {expanded[cat]
                                ? <ChevronUp size={12} className="text-slate-400 dark:text-slate-500" />
                                : <ChevronDown size={12} className="text-slate-400 dark:text-slate-500" />
                            }
                        </button>

                        {/* Items — shown when not collapsed */}
                        {!expanded[cat] && items.map(p => (
                            <label
                                key={p.id}
                                className="flex items-start gap-2.5 px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-rose-900/20 cursor-pointer transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    checked={!!checked[p.id]}
                                    onChange={() => toggle(p.id)}
                                    className="mt-0.5 accent-rose-500 shrink-0 w-3.5 h-3.5"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">{p.name}</p>
                                    {(p.description || p.desc) && (
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5 line-clamp-2">
                                            {p.description || p.desc}
                                        </p>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                ))}
            </div>

            {/* Confirm button */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50">
                <button
                    onClick={handleConfirm}
                    disabled={selectedCount === 0}
                    className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white text-xs font-semibold py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-rose-200 dark:hover:shadow-rose-900/50 transition-all active:scale-95"
                >
                    <ShoppingBag size={13} />
                    {selectedCount > 0
                        ? `Agregar ${selectedCount} producto${selectedCount > 1 ? 's' : ''}`
                        : 'Elige algo primero'}
                </button>
            </div>
        </div>
    );
}
