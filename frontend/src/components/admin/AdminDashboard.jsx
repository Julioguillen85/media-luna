import React, { useState } from 'react';
import { ClipboardList, Utensils, CheckSquare, Plus, Edit, Trash2 } from 'lucide-react';
import ProductFormModal from './ProductFormModal';

export default function AdminDashboard({ products, categories, onSaveProduct, onDeleteProduct }) {
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSave = (formData) => {
        onSaveProduct(formData, editingProduct ? editingProduct.id : null);
        setIsModalOpen(false);
    };

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Panel de Administración</h1>
                    <p className="text-slate-500">Gestiona el inventario, categorías y pedidos de Media Luna.</p>
                </div>
                <button onClick={handleCreate} className="bg-rose-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition flex items-center gap-2">
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ClipboardList size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">{products.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Productos Totales</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Utensils size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">{categories.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Categorías</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckSquare size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">Activo</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estado del Sistema</p></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-lg text-slate-800">Inventario de Productos</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Precio</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0"><img src={product.img} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }} /></div>
                                            <span className="font-medium text-slate-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{product.category}</span></td>
                                    <td className="px-6 py-4 font-bold text-slate-700">${product.price}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                                            <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <ProductFormModal product={editingProduct} categories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
}
