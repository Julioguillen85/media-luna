import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Bell, BellOff } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { usePWA } from '../../hooks/usePWA';

export default function Navbar({ setView, cart, isAdmin, setIsAdmin, setShowLogin, view, setIsCartModalOpen, onLogout, isSidebarOpen, setIsSidebarOpen }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notifStatus, setNotifStatus] = useState('idle'); // idle | loading | success | denied
    const menuRef = useRef(null);
    const { isSubscribed, subscribeToPush } = usePWA();

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

    const handleToggleNotifications = async () => {
        if (isSubscribed) return; // Ya está suscrito
        if (!('Notification' in window)) {
            alert('Tu navegador no soporta notificaciones. Abre la app instalada desde la pantalla de inicio.');
            return;
        }
        // Si el permiso ya estaba bloqueado, mostrar instrucciones de desbloqueo
        if (Notification.permission === 'denied') {
            alert('Las notificaciones están bloqueadas en tu navegador.\n\nPara habilitarlas:\n• iPhone: Ajustes > Safari > Configuración avanzada > Sitios web > Notificaciones\n• Android/Chrome: chrome://settings/content/notifications\n• Firefox: Configuración > Privacidad > Notificaciones');
            return;
        }
        setNotifStatus('loading');
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const ok = await subscribeToPush();
                setNotifStatus(ok ? 'success' : 'idle');
            } else {
                setNotifStatus('denied');
            }
        } catch (err) {
            console.error('Notification error:', err);
            setNotifStatus('idle');
        }
    };

    return (
        <nav className={`sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm transition-colors duration-500 ${view === 'admin' ? 'md:hidden' : ''}`}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
                                disabled={isSubscribed || notifStatus === 'loading'}
                                title={isSubscribed ? 'Alertas activas' : 'Activar notificaciones'}
                                className={`p-2 rounded-xl transition-colors disabled:cursor-default ${isSubscribed || notifStatus === 'success'
                                    ? 'text-emerald-500'
                                    : notifStatus === 'denied'
                                        ? 'text-red-400'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {notifStatus === 'denied'
                                    ? <BellOff size={20} />
                                    : <Bell size={20} />}
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
        </nav>
    );
}
