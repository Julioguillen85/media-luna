import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function OptionsEditor({ options, onSaveOptions }) {
    const [editingOptions, setEditingOptions] = useState(options);
    const [activeTab, setActiveTab] = useState('bases');
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleAddItem = (type) => {
        if (!newItem.trim()) return;
        setEditingOptions({
            ...editingOptions,
            [type]: [...editingOptions[type], newItem.trim()]
        });
        setNewItem('');
        // Calculate newly added page if it overflows
        const newTotal = editingOptions[type].length + 1;
        setCurrentPage(Math.ceil(newTotal / itemsPerPage));
    };

    const handleEditItem = (type, index, newValue) => {
        const updated = [...editingOptions[type]];
        updated[index] = newValue;
        setEditingOptions({
            ...editingOptions,
            [type]: updated
        });
        setEditingItem(null);
    };

    const handleDeleteItem = (type, index) => {
        setEditingOptions({
            ...editingOptions,
            [type]: editingOptions[type].filter((_, i) => i !== index)
        });
    };

    const handleSave = async () => {
        await onSaveOptions(editingOptions);
    };

    const tabs = [
        { id: 'bases', label: 'Bases', icon: '🥔', color: 'rose' },
        { id: 'complements', label: 'Complementos', icon: '🥒', color: 'green' },
        { id: 'toppings', label: 'Toppings', icon: '🍬', color: 'purple' }
    ];

    const currentItems = editingOptions[activeTab] || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(currentItems.length / itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700/50 overflow-x-auto pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                        className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? `border-${tab.color}-500 dark:border-${tab.color}-400 text-${tab.color}-600 dark:text-${tab.color}-400 bg-${tab.color}-50/50 dark:bg-${tab.color}-900/10`
                            : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Add New Item */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(activeTab)}
                        placeholder={`Agregar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                    <button
                        onClick={() => handleAddItem(activeTab)}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Agregar</span>
                    </button>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
                {currentItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        No hay {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} agregados
                    </div>
                ) : (
                    paginatedItems.map((item, pgIndex) => {
                        const originalIndex = indexOfFirstItem + pgIndex;
                        return (
                            <div key={originalIndex} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between group hover:border-slate-200 dark:hover:border-slate-600 transition-colors shadow-sm">
                                {editingItem === `${activeTab}-${originalIndex}` ? (
                                    <input
                                        type="text"
                                        defaultValue={item}
                                        autoFocus
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleEditItem(activeTab, originalIndex, e.target.value);
                                            }
                                        }}
                                        onBlur={(e) => handleEditItem(activeTab, originalIndex, e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500/50 text-slate-900 dark:text-white"
                                    />
                                ) : (
                                    <span className="text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                                )}
                                <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingItem(`${activeTab}-${originalIndex}`)}
                                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(activeTab, originalIndex)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, currentItems.length)} de {currentItems.length}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            Ant
                        </button>
                        <span className="px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            Sig
                        </button>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <button
                    onClick={() => setEditingOptions(options)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <X size={18} />
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
}
