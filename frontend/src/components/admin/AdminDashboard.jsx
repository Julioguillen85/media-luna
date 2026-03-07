import React, { useState } from 'react';
import { ClipboardList, Utensils, CheckSquare, Plus, Edit, Trash2, Package, Settings, Warehouse, TrendingUp, Sliders, Menu, X } from 'lucide-react';
import ProductFormModal from './ProductFormModal';
import OrdersTable from './OrdersTable';
import OptionsEditor from './OptionsEditor';
import IngredientsInventory from './IngredientsInventory';
import AnalyticsDashboard from './AnalyticsDashboard';
import AdminSettings from './AdminSettings';

export default function AdminDashboard({ products, categories, orders, options, onSaveProduct, onDeleteProduct, onUpdateOrderStatus, onDeleteOrder, onSaveOptions, onSaveInventory }) {
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('products');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

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

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsSidebarOpen(false); // Cerrar sidebar en móvil al cambiar de tab
    };

    const tabs = [
        { id: 'products', label: 'Productos', icon: Utensils },
        { id: 'orders', label: 'Pedidos', icon: Package },
        { id: 'options', label: 'Opciones de Bowls', icon: Settings },
        { id: 'inventory', label: 'Inventario', icon: Warehouse },
        { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
        { id: 'settings', label: 'Configuración', icon: Sliders }
    ];

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in pb-24">
            {/* Header con Hamburger Menu */}
            <div className="flex justify-between items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu Button (solo móvil) */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">Panel de Administración</h1>
                        <p className="text-slate-500 text-sm hidden md:block">Gestiona el inventario, categorías, pedidos y opciones de Media Luna.</p>
                    </div>
                </div>

                {activeTab === 'products' && (
                    <button onClick={handleCreate} className="bg-rose-500 text-white px-4 md:px-5 py-2 md:py-3 rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition flex items-center gap-2 text-sm md:text-base">
                        <Plus size={18} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Nuevo Producto</span><span className="sm:hidden">Nuevo</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ClipboardList size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">{products.length}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Productos Totales</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Package size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">{orders?.length || 0}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pedidos</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckSquare size={24} /></div>
                    <div><p className="text-2xl font-bold text-slate-900">Activo</p><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estado del Sistema</p></div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Menú Admin</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${activeTab === tab.id
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                                    : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Desktop Tabs + Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Desktop Tabs (ocultos en móvil) */}
                <div className="hidden md:flex border-b border-slate-100 overflow-x-auto">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-rose-500 text-rose-600 bg-rose-50/30'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/30'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 md:p-6">
                    {/* Products Tab */}
                    {activeTab === 'products' && (() => {
                        const indexOfLastItem = currentPage * itemsPerPage;
                        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                        const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
                        const totalPages = Math.ceil(products.length / itemsPerPage);

                        return (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
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
                                            {currentProducts.map(product => (
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

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4">
                                    {currentProducts.map(product => (
                                        <div key={product.id} className="bg-slate-50 rounded-xl p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0">
                                                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 text-base truncate">{product.name}</h3>
                                                    <span className="inline-block px-2 py-1 bg-white text-slate-600 rounded text-xs font-bold mt-1">{product.category}</span>
                                                    <p className="font-bold text-rose-600 text-lg mt-1">${product.price}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition">
                                                    <Edit size={16} /> Editar
                                                </button>
                                                <button onClick={() => onDeleteProduct(product.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                        <p className="text-sm text-slate-600">
                                            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, products.length)} de {products.length}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                            >
                                                Anterior
                                            </button>
                                            <span className="px-3 py-1 text-sm font-semibold text-slate-700">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <OrdersTable
                            orders={orders}
                            onUpdateOrderStatus={onUpdateOrderStatus}
                            onDeleteOrder={onDeleteOrder}
                        />
                    )}

                    {/* Options Tab */}
                    {activeTab === 'options' && (
                        <OptionsEditor
                            options={options}
                            onSaveOptions={onSaveOptions}
                        />
                    )}

                    {/* Inventory Tab */}
                    {activeTab === 'inventory' && (
                        <IngredientsInventory
                            options={options}
                            onSaveInventory={onSaveInventory}
                        />
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <AnalyticsDashboard
                            orders={orders}
                            products={products}
                        />
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <AdminSettings
                            products={products}
                            orders={orders}
                        />
                    )}
                </div>
            </div>

            {isModalOpen && <ProductFormModal product={editingProduct} categories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div >
    );
}
