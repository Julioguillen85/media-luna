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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
            case 'base': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'complement': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'topping': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700';
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedInventory = inventory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(inventory.length / itemsPerPage);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Ingredientes</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{inventory.length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Disponibles</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">{inventory.filter(i => i.available).length}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-colors">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Agotados</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">{inventory.filter(i => !i.available).length}</div>
                </div>
            </div>

            {/* Desktop Inventory Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-x-auto transition-colors">
                <div className="min-w-[800px]">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/50">
                            <tr className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4 text-left">Ingrediente</th>
                                <th className="px-6 py-4 text-left">Tipo</th>
                                <th className="px-6 py-4 text-left">Stock</th>
                                <th className="px-6 py-4 text-left">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {paginatedInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package size={18} className="text-slate-400 dark:text-slate-500" />
                                            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
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
                                                    className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500/50 text-slate-900 dark:text-white"
                                                    autoFocus
                                                />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-slate-700 dark:text-slate-200">{item.stock} {item.unit}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleAvailable(item.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${item.available
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                }`}
                                        >
                                            {item.available ? '✓ Disponible' : '✕ Agotado'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedInventory.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-slate-400 dark:text-slate-500" />
                                <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                            </div>
                            <button onClick={() => setEditingId(editingId === item.id ? null : item.id)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getTypeColor(item.type)}`}>
                                {getTypeLabel(item.type)}
                            </span>
                            <button onClick={() => handleToggleAvailable(item.id)} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${item.available ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {item.available ? '✓ Disponible' : '✕ Agotado'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stock:</span>
                            {editingId === item.id ? (
                                <div className="flex items-center gap-2">
                                    <input type="number" defaultValue={item.stock} onChange={(e) => handleUpdateStock(item.id, e.target.value)} className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-300 dark:focus:ring-rose-500/50" autoFocus />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</span>
                                </div>
                            ) : (
                                <span className="font-bold text-slate-700 dark:text-slate-200">{item.stock} {item.unit}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50 gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, inventory.length)} de {inventory.length}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

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
