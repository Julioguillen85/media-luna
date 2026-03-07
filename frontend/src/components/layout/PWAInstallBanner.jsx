import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download, Bell, BellOff, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PWAInstallBanner() {
    const { isInstallable, installPWA, isSubscribed, subscribeToPush } = usePWA();
    const [hidden, setHidden] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | denied | error
    const { user } = useAuth();

    // Solo mostrar a admins logueados y si no fue cerrado
    if (hidden || !user) return null;

    // Si ya está suscrito, mostrar confirmación pequeña
    if (isSubscribed && status !== 'success') {
        return (
            <div className="fixed bottom-4 right-4 z-[100] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up-fast">
                <CheckCircle size={20} />
                <span className="text-sm font-semibold">Alertas activas ✓</span>
                <button onClick={() => setHidden(true)} className="ml-1 opacity-70 hover:opacity-100">
                    <X size={16} />
                </button>
            </div>
        );
    }

    const handleAction = async () => {
        // Si hay prompt de instalación disponible, instalar primero
        if (isInstallable) {
            await installPWA();
            return;
        }

        // Verificar soporte
        if (!('Notification' in window)) {
            setStatus('error');
            alert('Tu navegador no soporta notificaciones. Usa Safari instalado en la pantalla de inicio.');
            return;
        }

        setStatus('loading');

        // Pedir permiso directamente — esto debe disparar el popup del sistema
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const ok = await subscribeToPush();
                setStatus(ok ? 'success' : 'error');
                if (!ok) alert('Hubo un problema al activar las alertas. Verifica que estés usando la app instalada.');
            } else if (permission === 'denied') {
                setStatus('denied');
            } else {
                setStatus('idle');
            }
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            setStatus('error');
        }
    };

    const buttonLabel = () => {
        if (status === 'loading') return 'Activando…';
        if (status === 'denied') return 'Permiso denegado';
        if (status === 'error') return 'Reintentar';
        if (status === 'success') return '¡Alertas Activadas!';
        if (isInstallable) return 'Instalar App';
        return 'Activar Alertas';
    };

    const icon = isInstallable ? <Download size={24} /> : <Bell size={24} />;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-rose-600 text-white p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up-fast">
            <div className="flex-1 flex items-center gap-4 text-sm font-medium">
                <div className="bg-white/20 p-3 rounded-full h-fit flex-shrink-0">
                    {status === 'denied' ? <BellOff size={24} /> : icon}
                </div>
                <div>
                    <h4 className="font-bold text-base md:text-lg mb-0.5 leading-tight">Admin App Media Luna</h4>
                    <p className="text-rose-100/90 text-xs md:text-sm leading-snug">
                        {status === 'denied'
                            ? 'Notificaciones bloqueadas. Ve a Ajustes > Safari > Notificaciones para habilitarlas.'
                            : isInstallable
                                ? 'Instala la app en tu celular para acceso directo y recibir notificaciones.'
                                : 'Activa las alertas Push para que te avise cuando llegue un pedido.'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {status !== 'denied' && (
                    <button
                        onClick={handleAction}
                        disabled={status === 'loading' || status === 'success'}
                        className="bg-white text-rose-600 px-6 py-2.5 rounded-xl font-bold flex-1 md:flex-none text-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {buttonLabel()}
                    </button>
                )}
                <button onClick={() => setHidden(true)} className="p-2.5 bg-rose-700/50 hover:bg-rose-700 rounded-xl transition-colors shrink-0">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
