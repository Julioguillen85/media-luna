import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function OptionsEditor({ options, onSaveOptions }) {
    const [editingOptions, setEditingOptions] = useState(options);
    const [activeTab, setActiveTab] = useState('bases');
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState('');

    const handleAddItem = (type) => {
        if (!newItem.trim()) return;
        setEditingOptions({
            ...editingOptions,
            [type]: [...editingOptions[type], newItem.trim()]
        });
        setNewItem('');
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

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                                ? `border-${tab.color}-500 text-${tab.color}-600`
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Add New Item */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddItem(activeTab)}
                        placeholder={`Agregar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                        className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                    <button
                        onClick={() => handleAddItem(activeTab)}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Agregar
                    </button>
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
                {currentItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                        No hay {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} agregados
                    </div>
                ) : (
                    currentItems.map((item, index) => (
                        <div key={index} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-slate-200 transition-colors">
                            {editingItem === `${activeTab}-${index}` ? (
                                <input
                                    type="text"
                                    defaultValue={item}
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleEditItem(activeTab, index, e.target.value);
                                        }
                                    }}
                                    onBlur={(e) => handleEditItem(activeTab, index, e.target.value)}
                                    className="flex-1 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                                />
                            ) : (
                                <span className="text-slate-700 font-medium">{item}</span>
                            )}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingItem(`${activeTab}-${index}`)}
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteItem(activeTab, index)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                    onClick={() => setEditingOptions(options)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
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
