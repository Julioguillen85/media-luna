import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Bell, BellOff, XCircle } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { usePWA } from '../../hooks/usePWA';
import { useSSE } from '../../hooks/useSSE';

export default function Navbar({ setView, cart, isAdmin, setIsAdmin, setShowLogin, view, setIsCartModalOpen, onLogout, isSidebarOpen, setIsSidebarOpen }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifStatus, setNotifStatus] = useState('idle'); // idle | loading | success | denied
    const [activeToasts, setActiveToasts] = useState([]); // Array para almacenar eventos vivos
    const menuRef = useRef(null);
    const { isSubscribed, subscribeToPush, isInStandaloneMode } = usePWA();
    const { lastOrderEvent, setLastOrderEvent } = useSSE(isAdmin);

    useEffect(() => {
        // Al recibir un evento SSE, empujarlo a la cola de Toasts visibles
        if (lastOrderEvent) {
            const newToast = { id: Date.now(), ...lastOrderEvent };
            setActiveToasts(prev => [...prev, newToast]);
            
            // Auto-cerrar el toast después de 8 segundos
            setTimeout(() => {
                setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 8000);
            
            setLastOrderEvent(null); // Limpiar para futuros eventos
        }
    }, [lastOrderEvent, setLastOrderEvent]);


    // Cerrar el menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Leer el estado real del permiso de notificaciones al iniciar
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'denied') {
            setNotifStatus('denied');
        }
    }, []);

    const [clickCount, setClickCount] = useState(0);

    const handleToggleNotifications = async () => {
        // Multi-click diagnostic (3 clicks in row)
        setClickCount(prev => prev + 1);
        setTimeout(() => setClickCount(0), 2000);

        if (clickCount >= 2) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const hasNotification = 'Notification' in window;
            const hasPush = 'PushManager' in window;
            const hasSW = 'serviceWorker' in navigator;
            alert(`--- DIAGNÓSTICO PWA ---\nInstalada: ${isInStandaloneMode}\nSuscrito: ${isSubscribed}\niOS: ${isIOS}\nNotification: ${hasNotification}\nPushManager: ${hasPush}\nServiceWorker: ${hasSW}\nPermiso: ${hasNotification ? Notification.permission : 'N/A'}`);
            setClickCount(0);
            return;
        }

        // Production logic
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const hasPush = 'PushManager' in window;
        const hasSW = 'serviceWorker' in navigator;

        try {
            if (isSubscribed && !confirm('Ya estás suscrito. ¿Deseas refrescar la suscripción para asegurar que las alertas lleguen a este dispositivo?')) {
                return;
            }

            if (!('Notification' in window)) {
                alert('ERROR: Tu navegador no soporta Notificaciones.');
                return;
            }

            if (!hasPush || !hasSW) {
                if (isIOS && !isInStandaloneMode) {
                   alert('iPhone: Usa el botón "Compartir" y selecciona "Añadir a pantalla de inicio" para activar notificaciones.');
                } else {
                   alert(`Error de soporte PWA: Push=${hasPush}, SW=${hasSW}. Asegúrate de estar usando la app instalada.`);
                }
                return;
            }

            // iOS standalone check
            if (isIOS && !isInStandaloneMode) {
                alert('iPhone: Las notificaciones solo funcionan si añades la app a tu pantalla de inicio.');
                return;
            }

            if (Notification.permission === 'denied') {
                alert('Las notificaciones están bloqueadas. Ve a Ajustes > (Buscar App o Safari) > Notificaciones y permite el acceso.');
                return;
            }

            setNotifStatus('loading');
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const ok = await subscribeToPush(true); 
                setNotifStatus(ok ? 'success' : 'idle');
                if (ok) {
                    alert('✅ ¡Listo! Notificaciones activadas en este dispositivo.');
                    console.log('✅ Suscripción exitosa');
                } else {
                    alert('❌ Hubo un error al sincronizar con el servidor. Reintenta pronto.');
                }
            } else {
                setNotifStatus('denied');
            }
        } catch (err) {
            console.error('Notification error:', err);
            setNotifStatus('idle');
            alert('Error inesperado: ' + err.message);
        }
    };

    return (
        <nav className={`sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm transition-colors duration-500 ${view === 'admin' ? 'md:hidden' : ''}`}>
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <div className="py-3 flex justify-between items-center transition-colors duration-500">
                    <div className="flex items-center gap-3">
                        {/* Hamburger menu ONLY in admin view on mobile */}
                        {isAdmin && view === 'admin' && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-300 mr-1"
                            >
                                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        )}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
                            <div className="bg-gradient-to-tr from-rose-500 to-amber-300 p-2 rounded-xl text-white shadow-lg"><span className="text-2xl" role="img" aria-label="watermelon">🍉</span></div>
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none transition-colors duration-500">Media <span className="text-rose-500" style={{ fontFamily: 'cursive' }}>Luna</span></span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 tracking-[0.25em] uppercase font-bold transition-colors duration-500">Snack Bar</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <ThemeToggle />

                        {/* Bell Notification Button — only for admins */}
                        {isAdmin && (
                            <button
                                onClick={handleToggleNotifications}
                                disabled={notifStatus === 'loading'}
                                title={isSubscribed ? 'Refrescar suscripción' : 'Activar notificaciones'}
                                className={`relative p-2 rounded-xl transition-colors disabled:cursor-default ${isSubscribed || notifStatus === 'success'
                                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                    : notifStatus === 'denied'
                                        ? 'text-red-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {notifStatus === 'denied'
                                    ? <BellOff size={20} />
                                    : <Bell size={20} className={isSubscribed ? 'fill-current' : ''} />}
                                    
                                {/* Badge SSE vivo. Se muestran cuantas notificaciones hayan llegado */}
                                {activeToasts.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                                        {activeToasts.length}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Cart Button with Badge */}
                        <button
                            onClick={() => setIsCartModalOpen(true)}
                            className="relative p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition group"
                        >
                            <ShoppingCart size={20} className="text-slate-700 group-hover:text-rose-500 transition" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-fade-in">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {/* User Dropdown — only for admins */}
                        {isAdmin && (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className={`p-2 rounded-xl transition-colors ${menuOpen ? 'bg-rose-50 dark:bg-slate-800 text-rose-600' : 'hover:bg-rose-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <User size={20} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
                                        {/* Panel Admin */}
                                        {view !== 'admin' && (
                                            <button
                                                onClick={() => { setView('admin'); setMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <LayoutDashboard size={16} className="text-slate-500" />
                                                Panel Administrador
                                            </button>
                                        )}

                                        <div className="border-t border-slate-100 dark:border-slate-700" />

                                        {/* Cerrar Sesión */}
                                        <button
                                            onClick={() => { onLogout(); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SSE Toasts Container */}
            {isAdmin && activeToasts.length > 0 && (
                <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
                    {activeToasts.map(toast => (
                        <div key={toast.id} className="pointer-events-auto bg-white dark:bg-slate-800 border-l-4 border-rose-500 shadow-2xl rounded-lg p-4 w-72 md:w-80 shrink-0 transform transition-all duration-500 translate-x-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span role="img" aria-label="alert">🚨</span> Nuevo Pedido #{toast.id}
                                </h4>
                                <button 
                                    onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                                    className="text-slate-400 hover:text-rose-500 transition"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                                <strong>De:</strong> {toast.customer}
                            </p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                                Total: ${Number(toast.total).toFixed(2)} MXN
                            </p>
                            <button 
                                onClick={() => {
                                    setView('admin');
                                    setActiveToasts(prev => prev.filter(t => t.id !== toast.id));
                                }}
                                className="w-full mt-3 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-slate-600 hover:text-rose-600 text-slate-700 dark:text-white text-xs font-bold py-2 rounded transition"
                            >
                                Ver en Panel
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </nav>
    );
}
