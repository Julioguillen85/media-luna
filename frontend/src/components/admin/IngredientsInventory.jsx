import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Edit2, Trash2, Save } from 'lucide-react';

export default function IngredientsInventory({ options, onSaveInventory }) {
    // Create initial inventory from options
    const createInitialInventory = () => {
        const inventory = [];
        let id = 1;

        options.bases?.forEach(item => {
            inventory.push({
                id: id++,
                name: item,
                type: 'base',
                stock: 100,
                unit: 'piezas',
                available: true
            });
        });

        options.complements?.forEach(item => {
            inventory.push({
                id: id++,
                name: item,
                type: 'complement',
                stock: 50,
                unit: 'kg',
                available: true
            });
        });

        options.toppings?.forEach(item => {
            inventory.push({
                id: id++,
                name: item,
                type: 'topping',
                stock: 30,
                unit: 'piezas',
                available: true
            });
        });

        return inventory;
    };

    const [inventory, setInventory] = useState(createInitialInventory());
    const [editingId, setEditingId] = useState(null);

    const handleUpdateStock = (id, newStock) => {
        setInventory(inventory.map(item =>
            item.id === id ? { ...item, stock: parseInt(newStock) || 0 } : item
        ));
    };

    const handleToggleAvailable = (id) => {
        setInventory(inventory.map(item =>
            item.id === id ? { ...item, available: !item.available } : item
        ));
    };

    const handleSave = () => {
        onSaveInventory?.(inventory);
        setEditingId(null);
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'base': return 'Base';
            case 'complement': return 'Complemento';
            case 'topping': return 'Topping';
            default: return type;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'base': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'complement': return 'bg-green-100 text-green-700 border-green-200';
            case 'topping': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Total Ingredientes</div>
                    <div className="text-2xl font-bold text-slate-900">{inventory.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Disponibles</div>
                    <div className="text-2xl font-bold text-green-600">{inventory.filter(i => i.available).length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">Agotados</div>
                    <div className="text-2xl font-bold text-red-600">{inventory.filter(i => !i.available).length}</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4 text-left">Ingrediente</th>
                                <th className="px-6 py-4 text-left">Tipo</th>
                                <th className="px-6 py-4 text-left">Stock</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {inventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package size={18} className="text-slate-400" />
                                            <span className="font-medium text-slate-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getTypeColor(item.type)}`}>
                                            {getTypeLabel(item.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === item.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    defaultValue={item.stock}
                                                    onChange={(e) => handleUpdateStock(item.id, e.target.value)}
                                                    className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-rose-300"
                                                    autoFocus
                                                />
                                                <span className="text-xs text-slate-500">{item.unit}</span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-slate-700">{item.stock} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleAvailable(item.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${item.available
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {item.available ? '✓ Disponible' : '✕ Agotado'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                    <Save size={18} />
                    Guardar Inventario
                </button>
            </div>
        </div>
    );
}
