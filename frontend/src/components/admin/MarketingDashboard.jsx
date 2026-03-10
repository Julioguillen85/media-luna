import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Sparkles, BarChart3, Settings2, RefreshCw } from 'lucide-react';
import ContentCalendar from './ContentCalendar';
import ContentGenerator from './ContentGenerator';
import ReportSettings from './ReportSettings';
import { fetchStats } from '../../services/marketingService';

export default function MarketingDashboard({ products, orders }) {
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await fetchStats();
            setStats(data);
        } catch (err) {
            console.error('Error cargando stats de marketing:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const sections = [
        { id: 'overview', label: 'Resumen', icon: BarChart3 },
        { id: 'calendar', label: 'Calendario', icon: Calendar },
        { id: 'generator', label: 'Generar', icon: Sparkles },
        { id: 'reports', label: 'Reportes', icon: Megaphone },
        { id: 'config', label: 'Config', icon: Settings2 },
    ];

    return (
        <div className="space-y-6">
            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2">
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeSection === section.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Icon size={16} />
                            {section.label}
                        </button>
                    );
                })}
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                            📊 Resumen de Marketing
                        </h3>
                        <button
                            onClick={loadStats}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/50 p-5 rounded-2xl transition-colors duration-300">
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalPosts || 0}</p>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Posts</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-5 rounded-2xl transition-colors duration-300">
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats?.scheduled || 0}</p>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Programados</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/50 p-5 rounded-2xl transition-colors duration-300">
                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.published || 0}</p>
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Publicados</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800/50 p-5 rounded-2xl transition-colors duration-300">
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.drafts || 0}</p>
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">Borradores</p>
                        </div>
                    </div>

                    {/* Meta API Status */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Estado de Conexiones</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Meta Graph API (Facebook/Instagram)</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats?.metaConfigured
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {stats?.metaConfigured ? '✅ Conectado' : '⚠️ No configurado'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Lunita IA (Generador de contenido)</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    ✅ Activo
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Acciones Rápidas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setActiveSection('generator')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl hover:shadow-md transition-all duration-300"
                            >
                                <Sparkles size={20} className="text-purple-500" />
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Generar Post con IA</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Lunita crea el contenido</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveSection('calendar')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:shadow-md transition-all duration-300"
                            >
                                <Calendar size={20} className="text-blue-500" />
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Ver Calendario</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Publicaciones de la semana</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveSection('reports')}
                                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-xl hover:shadow-md transition-all duration-300"
                            >
                                <BarChart3 size={20} className="text-green-500" />
                                <div className="text-left">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Reporte de Ventas</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Preview y envío semanal</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Section */}
            {activeSection === 'calendar' && (
                <ContentCalendar products={products} />
            )}

            {/* Generator Section */}
            {activeSection === 'generator' && (
                <ContentGenerator products={products} />
            )}

            {/* Reports Section */}
            {(activeSection === 'reports' || activeSection === 'config') && (
                <ReportSettings orders={orders} products={products} showConfig={activeSection === 'config'} />
            )}
        </div>
    );
}
