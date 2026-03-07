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
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Columnas Visibles</h3>
                        <p className="text-sm text-slate-500">Personaliza qué columnas mostrar en la tabla de productos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings.showImage}
                            onChange={() => toggleSetting('showImage')}
                            className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-300"
                        />
                        <span className="font-medium text-slate-700">Mostrar Imagen</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings.showCategory}
                            onChange={() => toggleSetting('showCategory')}
                            className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-300"
                        />
                        <span className="font-medium text-slate-700">Mostrar Categoría</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings.showPrice}
                            onChange={() => toggleSetting('showPrice')}
                            className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-300"
                        />
                        <span className="font-medium text-slate-700">Mostrar Precio</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings.showActions}
                            onChange={() => toggleSetting('showActions')}
                            className="w-5 h-5 text-rose-600 rounded focus:ring-2 focus:ring-rose-300"
                        />
                        <span className="font-medium text-slate-700">Mostrar Acciones</span>
                    </label>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        💡 Tus preferencias se guardan automáticamente en tu navegador
                    </p>
                </div>
            </section>

            {/* Exportación de Datos */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <Download size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Exportar Datos</h3>
                        <p className="text-sm text-slate-500">Descarga tus datos en formato CSV para análisis externo</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={handleExportProducts}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl"
                    >
                        <Download size={20} />
                        Exportar Productos
                    </button>

                    <button
                        onClick={handleExportOrders}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 hover:shadow-xl"
                    >
                        <Download size={20} />
                        Exportar Pedidos
                    </button>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                        📊 Los archivos CSV se pueden abrir en Excel, Google Sheets o cualquier software de hojas de cálculo
                    </p>
                </div>
            </section>

            {/* Información del Sistema */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                        <SettingsIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Información del Sistema</h3>
                        <p className="text-sm text-slate-500">Detalles de la aplicación</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Versión</p>
                        <p className="text-lg font-bold text-slate-900">1.0.0</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Productos</p>
                        <p className="text-lg font-bold text-slate-900">{products?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Pedidos</p>
                        <p className="text-lg font-bold text-slate-900">{orders?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Estado</p>
                        <p className="text-lg font-bold text-green-600">Activo</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
