import React, { useState, useRef, useEffect } from 'react';
import { ClipboardList, Utensils, CheckSquare, Plus, Edit, Trash2, Package, Settings, Warehouse, TrendingUp, Sliders, Menu, X, Eye, EyeOff, Sparkles, Home, LogOut, ChevronDown, Image as ImageIcon, Users, Store, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProductFormModal from './ProductFormModal';
import OrdersTable from './OrdersTable';
import OptionsEditor from './OptionsEditor';
import IngredientsInventory from './IngredientsInventory';
import AnalyticsDashboard from './AnalyticsDashboard';
import AdminSettings from './AdminSettings';
import MarketingDashboard from './MarketingDashboard';
import GalleryTab from './GalleryTab';
import UserManagementTab from './UserManagementTab';
import ChangePasswordModal from './ChangePasswordModal';

export default function AdminDashboard({ products, categories, orders, options, onSaveProduct, onDeleteProduct, onUpdateOrderStatus, onDeleteOrder, onSaveOptions, onSaveInventory, onLogout, isSidebarOpen, setIsSidebarOpen, setView }) {
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const { user } = useAuth();
    const isAssistant = user?.role === 'ROLE_ASSISTANT';
    const [activeTab, setActiveTab] = useState('home');
    const [currentPage, setCurrentPage] = useState(1);

    const [activeProductType, setActiveProductType] = useState('ALL'); // ALL, SNACK, RENTAL
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
        const productData = {
            ...formData,
            id: editingProduct ? editingProduct.id : null
        };
        onSaveProduct(productData);
        setIsModalOpen(false);
    };

    const handleToggleVisibility = (product) => {
        onSaveProduct({ ...product, visible: !product.visible });
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setIsSidebarOpen(false); // Cerrar sidebar en móvil al cambiar de tab
    };

    const allTabs = [
        { id: 'products', label: 'Productos', icon: Utensils },
        { id: 'orders', label: 'Pedidos', icon: Package },
        { id: 'options', label: 'Personalización Snacks', icon: Settings },
        { id: 'inventory', label: 'Inventario', icon: Warehouse },
        { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
        { id: 'marketing', label: 'Marketing', icon: Sparkles },
        { id: 'gallery', label: 'Galería', icon: ImageIcon },
        { id: 'users', label: 'Usuarios', icon: Users }
    ];

    const tabs = isAssistant
        ? allTabs.filter(t => !['analytics', 'marketing', 'users', 'options', 'settings', 'gallery'].includes(t.id))
        : allTabs;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 w-full overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-[60]"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`md:hidden fixed inset-0 w-full h-full bg-white dark:bg-slate-900 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onTouchStart={(e) => { e.currentTarget._touchStartX = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                    const startX = e.currentTarget._touchStartX || 0;
                    const endX = e.changedTouches[0].clientX;
                    if (startX - endX > 80) setIsSidebarOpen(false);
                }}
            >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            ML
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-base leading-tight">Admin<br /><span className="text-rose-600 dark:text-rose-400 text-sm">Media Luna</span></h2>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide">
                    <button
                        onClick={() => handleTabChange('home')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${activeTab === 'home'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <div className={`p-1.5 rounded-xl flex items-center justify-center ${activeTab === 'home' ? 'bg-rose-100 dark:bg-rose-800/50 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            <Home size={18} />
                        </div>
                        Inicio
                    </button>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${isActive
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-xl flex items-center justify-center ${isActive ? 'bg-rose-100 dark:bg-rose-800/50 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                    <Icon size={18} />
                                </div>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                    <button
                        onClick={() => {
                            if (setView) setView('home');
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent"
                    >
                        <Store size={18} />
                        Ver Tienda
                    </button>
                    {!isAssistant && (
                        <button
                            onClick={() => handleTabChange('settings')}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <Sliders size={18} className="text-slate-400" />
                            Configuración
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setIsPasswordModalOpen(true);
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <KeyRound size={18} className="text-slate-400" />
                        Cambiar Contraseña
                    </button>
                    <button
                        onClick={() => {
                            if (onLogout) onLogout();
                            setIsSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen overflow-y-auto z-40 shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            ML
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">Admin<br /><span className="text-rose-600 dark:text-rose-400 text-sm">Media Luna</span></h2>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => handleTabChange('home')}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === 'home'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <Home size={20} className={activeTab === 'home' ? 'text-rose-500' : 'text-slate-400'} />
                        Inicio
                    </button>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${isActive
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} className={isActive ? 'text-rose-500' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
                    <button
                        onClick={() => { if (setView) setView('home'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent"
                    >
                        <Store size={20} />
                        Ver Tienda
                    </button>
                    {!isAssistant && (
                        <button
                            onClick={() => handleTabChange('settings')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent"
                        >
                            <Sliders size={20} className="text-slate-400" />
                            Configuración
                        </button>
                    )}
                    <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent"
                    >
                        <KeyRound size={20} className="text-slate-400" />
                        Contraseña
                    </button>
                    <button
                        onClick={() => { if (onLogout) onLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full min-w-0 transition-all duration-300 h-screen overflow-y-auto overflow-x-hidden">
                <div className="w-full px-4 py-6 md:py-8 lg:px-8 animate-fade-in pb-24 md:pb-8 transition-colors duration-300">
                    {/* Header Controls (Only Buttons) */}
                    {(activeTab === 'products') && (
                        <div className="flex justify-end items-center gap-4 mb-6">
                            <div className="flex gap-2 items-center">
                                <button onClick={handleCreate} className="bg-rose-500 dark:bg-rose-600 text-white px-3 md:px-5 py-2 md:py-3 rounded-xl font-bold shadow-lg shadow-rose-200 dark:shadow-rose-900/20 hover:bg-rose-600 dark:hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 text-xs md:text-base whitespace-nowrap">
                                    <Plus size={16} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Nuevo Producto</span><span className="sm:hidden">Nuevo</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Contenido de Inicio (Home) */}
                    {activeTab === 'home' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Resumen General</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div onClick={() => setActiveTab('products')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-colors duration-300"><ClipboardList size={24} /></div>
                                    <div><p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{products.length}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide transition-colors duration-300">Productos Totales</p></div>
                                </div>
                                <div onClick={() => setActiveTab('orders')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center transition-colors duration-300"><Package size={24} /></div>
                                    <div><p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">{orders?.length || 0}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide transition-colors duration-300">Pedidos Totales</p></div>
                                </div>
                                <div onClick={() => setActiveTab('inventory')} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center transition-colors duration-300"><Warehouse size={24} /></div>
                                    <div><p className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Ingredientes</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide transition-colors duration-300">Ver Stock</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    {activeTab !== 'home' && (
                        <div className="bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300 backdrop-blur-sm">
                            <div className="p-4 md:p-6">
                                {/* Products Tab */}
                                {activeTab === 'products' && (() => {
                                    const filteredProducts = products.filter(p => {
                                        if (activeProductType === 'ALL') return true;
                                        // Handle legacy products (missing productType) as SNACK
                                        const type = p.productType || 'SNACK';
                                        return type === activeProductType;
                                    });

                                    const indexOfLastItem = currentPage * itemsPerPage;
                                    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
                                    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

                                    return (
                                        <>
                                            {/* Filter Tabs */}
                                            <div className="flex gap-2 mb-6">
                                                <button
                                                    onClick={() => { setActiveProductType('ALL'); setCurrentPage(1); }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeProductType === 'ALL' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    onClick={() => { setActiveProductType('SNACK'); setCurrentPage(1); }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeProductType === 'SNACK' ? 'bg-rose-500 text-white' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40'}`}
                                                >
                                                    🍿 Snacks
                                                </button>
                                                <button
                                                    onClick={() => { setActiveProductType('RENTAL'); setCurrentPage(1); }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeProductType === 'RENTAL' ? 'bg-blue-500 text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}
                                                >
                                                    🪑 Renta
                                                </button>
                                            </div>
                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-700/50 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors duration-300">
                                                            <th className="px-6 py-4">Producto</th>
                                                            <th className="px-6 py-4">Categoría</th>
                                                            <th className="px-6 py-4">Precio</th>
                                                            <th className="px-6 py-4 text-right">Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                                        {currentProducts.map(product => (
                                                            <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-300">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 transition-colors duration-300"><img src={product.img} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }} /></div>
                                                                        <span className="font-medium text-slate-900 dark:text-white transition-colors duration-300">{product.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-bold transition-colors duration-300">{product.category}</span></td>
                                                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">
                                                                    {product.productType === 'SNACK' ? (
                                                                        <span className="text-xs text-rose-500 font-extrabold bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-lg">Por volumen</span>
                                                                    ) : (
                                                                        `$${product.price}`
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleToggleVisibility(product)}
                                                                            className={`p-2 rounded-lg transition-colors duration-300 ${product.visible !== false ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                                            title={product.visible !== false ? "Visible" : "Oculto"}
                                                                        >
                                                                            {product.visible !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                                                        </button>
                                                                        <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-300"><Edit size={18} /></button>
                                                                        {!isAssistant && (
                                                                            <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-300"><Trash2 size={18} /></button>
                                                                        )}
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
                                                    <div key={product.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 transition-colors duration-300">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shrink-0 transition-colors duration-300">
                                                                <img src={product.img} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' }} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-slate-900 dark:text-white text-base truncate transition-colors duration-300">{product.name}</h3>
                                                                <span className="inline-block px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-bold mt-1 transition-colors duration-300">{product.category}</span>
                                                                {product.productType === 'SNACK' ? (
                                                                    <p className="font-extrabold text-rose-500 text-sm mt-1 bg-rose-50 dark:bg-rose-900/30 inline-block px-2 py-0.5 rounded-lg transition-colors duration-300">Por volumen</p>
                                                                ) : (
                                                                    <p className="font-bold text-rose-600 dark:text-rose-400 text-lg mt-1 transition-colors duration-300">${product.price}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                                                            <button
                                                                onClick={() => handleToggleVisibility(product)}
                                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold text-xs transition-colors duration-300 ${product.visible !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                                                            >
                                                                {product.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                <span className="hidden xs:inline">{product.visible !== false ? 'Ocultar' : 'Mostrar'}</span>
                                                            </button>
                                                            <button onClick={() => handleEdit(product)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors duration-300">
                                                                <Edit size={16} /> <span className="hidden xs:inline">Editar</span>
                                                            </button>
                                                            {!isAssistant && (
                                                                <button onClick={() => onDeleteProduct(product.id)} className="flex items-center justify-center gap-1 px-3 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs transition-colors duration-300">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300 hidden sm:block">
                                                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length}
                                                    </p>
                                                    <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            disabled={currentPage === 1}
                                                            className="p-2 sm:px-3 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-300"
                                                        >
                                                            <span className="hidden sm:inline">Anterior</span>
                                                            <span className="sm:hidden text-lg">←</span>
                                                        </button>
                                                        <span className="hidden sm:inline px-3 py-1 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300">
                                                            {currentPage} / {totalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            disabled={currentPage === totalPages}
                                                            className="p-2 sm:px-3 sm:py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-300"
                                                        >
                                                            <span className="hidden sm:inline">Siguiente</span>
                                                            <span className="sm:hidden text-lg">→</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()
                                }

                                {/* Orders Tab */}
                                {
                                    activeTab === 'orders' && (
                                        <OrdersTable
                                            orders={orders}
                                            onUpdateOrderStatus={onUpdateOrderStatus}
                                            onDeleteOrder={onDeleteOrder}
                                        />
                                    )
                                }

                                {/* Options Tab */}
                                {
                                    activeTab === 'options' && (
                                        <OptionsEditor
                                            options={options}
                                            onSaveOptions={onSaveOptions}
                                        />
                                    )
                                }

                                {/* Inventory Tab */}
                                {
                                    activeTab === 'inventory' && (
                                        <IngredientsInventory
                                            options={options}
                                            onSaveInventory={onSaveInventory}
                                        />
                                    )
                                }

                                {/* Analytics Tab */}
                                {
                                    activeTab === 'analytics' && (
                                        <AnalyticsDashboard
                                            orders={orders}
                                            products={products}
                                        />
                                    )
                                }

                                {/* Marketing Tab */}
                                {
                                    activeTab === 'marketing' && (
                                        <MarketingDashboard
                                            products={products}
                                            orders={orders}
                                        />
                                    )
                                }

                                {/* Gallery Tab */}
                                {
                                    activeTab === 'gallery' && (
                                        <GalleryTab options={options} onSaveOptions={onSaveOptions} />
                                    )
                                }

                                {/* Users Management Tab */}
                                {
                                    activeTab === 'users' && !isAssistant && (
                                        <UserManagementTab />
                                    )
                                }

                                {/* Settings Tab */}
                                {
                                    activeTab === 'settings' && (
                                        <AdminSettings
                                            products={products}
                                            orders={orders}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    )}

                    {isModalOpen && <ProductFormModal product={editingProduct} categories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
                    {isPasswordModalOpen && <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Admin shortcuts) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 pb-safe z-[60] transition-colors duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <div className="flex justify-around items-center p-2 pb-6 px-4">
                    <button
                        onClick={() => handleTabChange('home')}
                        className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-300 ${activeTab === 'home'
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <Home size={20} className={activeTab === 'home' ? 'animate-bounce-short' : ''} />
                        <span className="text-[10px] font-bold mt-1 tracking-wide">Inicio</span>
                    </button>

                    {!isAssistant && (
                        <button
                            onClick={() => handleTabChange('marketing')}
                            className={`flex flex-col items-center justify-center min-w-[4.5rem] px-2 h-12 rounded-2xl transition-all duration-300 ${activeTab === 'marketing'
                                ? 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <Sparkles size={20} className={activeTab === 'marketing' ? 'animate-bounce-short' : ''} />
                            <span className="text-[10px] font-bold mt-1 tracking-wide whitespace-nowrap">Generar con IA</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
