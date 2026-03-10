import React, { useState, useEffect } from 'react';
import { Download, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';

export default function AdminSettings({ products, orders }) {
    // Load saved preferences from localStorage
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('adminSettings');
        return saved ? JSON.parse(saved) : {
            showPrice: true,
            showCategory: true,
            showImage: true,
            showActions: true
        };
    });

    // Save to localStorage cuando cambian settings
    useEffect(() => {
        localStorage.setItem('adminSettings', JSON.stringify(settings));
    }, [settings]);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Función de exportación a CSV
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Convertir a CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => {
            return Object.values(item).map(val => {
                // Escapar comillas y valores con comas
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',');
        });

        const csv = [headers, ...rows].join('\n');

        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportProducts = () => {
        const data = products.map(p => ({
            ID: p.id,
            Nombre: p.name,
            Categoría: p.category,
            Precio: p.price,
            Descripción: p.description || '',
        }));
        exportToCSV(data, 'productos');
    };

    const handleExportOrders = () => {
        const data = orders.map(o => ({
            ID: o.id,
            Cliente: o.customer || o.name,
            Teléfono: o.phone,
            Fecha: o.date,
            Hora: o.time,
            Ubicación: o.eventLocation,
            Personas: o.peopleCount,
            Estado: o.status,
            Productos: o.items?.map(i => i.name).join('; ') || ''
        }));
        exportToCSV(data, 'pedidos');
    };

    return (
        <div className="space-y-8">
            {/* Configuración de Columnas Visibles */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-colors duration-300">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Columnas Visibles</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">Personaliza qué columnas mostrar en la tabla de productos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300">
                        <input
                            type="checkbox"
                            checked={settings.showImage}
                            onChange={() => toggleSetting('showImage')}
                            className="w-5 h-5 text-rose-600 dark:text-rose-500 rounded focus:ring-2 focus:ring-rose-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 transition-colors duration-300"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Mostrar Imagen</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300">
                        <input
                            type="checkbox"
                            checked={settings.showCategory}
                            onChange={() => toggleSetting('showCategory')}
                            className="w-5 h-5 text-rose-600 dark:text-rose-500 rounded focus:ring-2 focus:ring-rose-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 transition-colors duration-300"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Mostrar Categoría</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300">
                        <input
                            type="checkbox"
                            checked={settings.showPrice}
                            onChange={() => toggleSetting('showPrice')}
                            className="w-5 h-5 text-rose-600 dark:text-rose-500 rounded focus:ring-2 focus:ring-rose-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 transition-colors duration-300"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Mostrar Precio</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-300">
                        <input
                            type="checkbox"
                            checked={settings.showActions}
                            onChange={() => toggleSetting('showActions')}
                            className="w-5 h-5 text-rose-600 dark:text-rose-500 rounded focus:ring-2 focus:ring-rose-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 transition-colors duration-300"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300 transition-colors duration-300">Mostrar Acciones</span>
                    </label>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg transition-colors duration-300">
                    <p className="text-xs text-blue-700 dark:text-blue-400 transition-colors duration-300">
                        💡 Tus preferencias se guardan automáticamente en tu navegador
                    </p>
                </div>
            </section>

            {/* Exportación de Datos */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center transition-colors duration-300">
                        <Download size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Exportar Datos</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">Descarga tus datos en formato CSV para análisis externo</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={handleExportProducts}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl"
                    >
                        <Download size={20} />
                        Exportar Productos
                    </button>

                    <button
                        onClick={handleExportOrders}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600 transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/20 hover:shadow-xl"
                    >
                        <Download size={20} />
                        Exportar Pedidos
                    </button>
                </div>

                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg transition-colors duration-300">
                    <p className="text-xs text-amber-700 dark:text-amber-400 transition-colors duration-300">
                        📊 Los archivos CSV se pueden abrir en Excel, Google Sheets o cualquier software de hojas de cálculo
                    </p>
                </div>
            </section>

            {/* Información del Sistema */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center transition-colors duration-300">
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">Información del Sistema</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">Detalles de la aplicación</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors duration-300">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">Versión</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">1.0.0</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors duration-300">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">Productos</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{products?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors duration-300">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">Pedidos</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors duration-300">{orders?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors duration-300">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors duration-300">Estado</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 transition-colors duration-300">Activo</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
