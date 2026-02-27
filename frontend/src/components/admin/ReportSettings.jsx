import React, { useState, useEffect } from 'react';
import { BarChart3, Send, Eye, Settings2, Save, Check, Loader2, Mail, MessageCircle } from 'lucide-react';
import { previewReport, sendReport, fetchConfig, updateConfig } from '../../services/marketingService';

const DAYS = [
    { id: 'MONDAY', label: 'Lunes' },
    { id: 'TUESDAY', label: 'Martes' },
    { id: 'WEDNESDAY', label: 'Miércoles' },
    { id: 'THURSDAY', label: 'Jueves' },
    { id: 'FRIDAY', label: 'Viernes' },
    { id: 'SATURDAY', label: 'Sábado' },
    { id: 'SUNDAY', label: 'Domingo' },
];

export default function ReportSettings({ orders, products, showConfig }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        whatsappReportEnabled: false,
        whatsappReportDay: 'SUNDAY',
        whatsappReportPhone: '',
        emailReportEnabled: false,
        emailReportTo: '',
        facebookPageId: '',
        facebookPageToken: '',
        instagramBusinessId: '',
        autoPublishEnabled: false,
    });
    const [configLoading, setConfigLoading] = useState(true);
    const [configSaved, setConfigSaved] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState('');

    useEffect(() => {
        loadConfig();
        loadPreview();
    }, []);

    const loadConfig = async () => {
        try {
            setConfigLoading(true);
            const data = await fetchConfig();
            setConfig(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error('Error cargando config:', err);
        } finally {
            setConfigLoading(false);
        }
    };

    const loadPreview = async () => {
        try {
            setLoading(true);
            const data = await previewReport();
            setReport(data);
        } catch (err) {
            console.error('Error cargando preview:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            await updateConfig(config);
            setConfigSaved(true);
            setTimeout(() => setConfigSaved(false), 2000);
        } catch (err) {
            alert('Error guardando configuración: ' + err.message);
        }
    };

    const handleSendTest = async (channel) => {
        const to = channel === 'whatsapp' ? config.whatsappReportPhone : config.emailReportTo;
        if (!to) {
            alert(`Configura el ${channel === 'whatsapp' ? 'teléfono' : 'email'} del destinatario primero`);
            return;
        }
        try {
            setSending(true);
            await sendReport(channel, to);
            setSent(channel);
            setTimeout(() => setSent(''), 3000);
        } catch (err) {
            alert('Error enviando reporte: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Report Preview */}
            {!showConfig && (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                            📊 Reporte Semanal de Ventas
                        </h3>
                        <button
                            onClick={loadPreview}
                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            🔄 Actualizar
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-400">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                            Generando reporte...
                        </div>
                    ) : report ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Data Summary */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <BarChart3 size={18} /> Datos del Reporte
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Periodo</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{report.data?.period}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Total Pedidos</span>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{report.data?.totalOrders}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Ingresos Estimados</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">${report.data?.totalRevenue?.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Completados</span>
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">{report.data?.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Cancelados</span>
                                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{report.data?.cancelledOrders}</span>
                                    </div>
                                </div>

                                {/* Send buttons */}
                                <div className="mt-6 space-y-2">
                                    <button
                                        onClick={() => handleSendTest('whatsapp')}
                                        disabled={sending || !config.whatsappReportPhone}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors"
                                    >
                                        {sent === 'whatsapp' ? <><Check size={16} /> ¡Enviado!</> :
                                            <><MessageCircle size={16} /> Enviar por WhatsApp</>}
                                    </button>
                                    <button
                                        onClick={() => handleSendTest('email')}
                                        disabled={sending || !config.emailReportTo}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors"
                                    >
                                        {sent === 'email' ? <><Check size={16} /> ¡Enviado!</> :
                                            <><Mail size={16} /> Enviar por Email</>}
                                    </button>
                                </div>
                            </div>

                            {/* WhatsApp Preview */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden transition-colors duration-300">
                                <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3">
                                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                        <MessageCircle size={16} /> Preview WhatsApp
                                    </h4>
                                </div>
                                <div className="p-4 bg-[#e5ddd5] dark:bg-slate-900">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 max-w-sm shadow-sm">
                                        <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                                            {report.whatsappText}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">No hay datos para el reporte</div>
                    )}
                </>
            )}

            {/* Config Section */}
            {showConfig && (
                <>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                        ⚙️ Configuración de Marketing
                    </h3>

                    {configLoading ? (
                        <div className="text-center py-8 text-slate-400">Cargando configuración...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Report Schedule */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">📅 Reporte Semanal</h4>

                                {/* WhatsApp */}
                                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp</span>
                                        <button
                                            onClick={() => setConfig(prev => ({ ...prev, whatsappReportEnabled: !prev.whatsappReportEnabled }))}
                                            className={`w-12 h-6 rounded-full transition-colors ${config.whatsappReportEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.whatsappReportEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    {config.whatsappReportEnabled && (
                                        <input
                                            type="tel"
                                            value={config.whatsappReportPhone || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, whatsappReportPhone: e.target.value }))}
                                            placeholder="Número del dueño (10 dígitos)"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                        />
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</span>
                                        <button
                                            onClick={() => setConfig(prev => ({ ...prev, emailReportEnabled: !prev.emailReportEnabled }))}
                                            className={`w-12 h-6 rounded-full transition-colors ${config.emailReportEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${config.emailReportEnabled ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                    {config.emailReportEnabled && (
                                        <input
                                            type="email"
                                            value={config.emailReportTo || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, emailReportTo: e.target.value }))}
                                            placeholder="email@del-dueño.com"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                        />
                                    )}
                                </div>

                                {/* Day */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Día de cierre (envío del reporte)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS.map(day => (
                                            <button
                                                key={day.id}
                                                onClick={() => setConfig(prev => ({ ...prev, whatsappReportDay: day.id }))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${config.whatsappReportDay === day.id
                                                        ? 'bg-purple-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }`}
                                            >
                                                {day.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Meta API Config */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">🔗 Conexión Meta (Facebook/Instagram)</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Facebook Page ID</label>
                                        <input
                                            type="text"
                                            value={config.facebookPageId || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, facebookPageId: e.target.value }))}
                                            placeholder="ID de tu página de Facebook"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Page Access Token</label>
                                        <input
                                            type="password"
                                            value={config.facebookPageToken || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, facebookPageToken: e.target.value }))}
                                            placeholder="Token de acceso de la página"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Instagram Business ID</label>
                                        <input
                                            type="text"
                                            value={config.instagramBusinessId || ''}
                                            onChange={e => setConfig(prev => ({ ...prev, instagramBusinessId: e.target.value }))}
                                            placeholder="ID de tu cuenta Instagram Business"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save */}
                            <button
                                onClick={handleSaveConfig}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                {configSaved ? <><Check size={18} /> ¡Guardado!</> : <><Save size={18} /> Guardar Configuración</>}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
