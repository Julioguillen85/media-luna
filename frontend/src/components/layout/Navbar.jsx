import React from 'react';
import { ShoppingBag, LogOut, Lock, Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar({ setView, cart, isAdmin, setIsAdmin, setShowLogin, view, setIsCartModalOpen, onLogout, isSidebarOpen, setIsSidebarOpen }) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm transition-colors duration-500">
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

                        {/* Cart Button with Badge */}
                        <button
                            onClick={() => setIsCartModalOpen(true)}
                            className="relative p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition group"
                        >
                            <ShoppingBag size={20} className="text-slate-700 group-hover:text-rose-500 transition" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-fade-in">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {isAdmin && (
                            <button onClick={onLogout} className="text-rose-600 dark:text-rose-400 font-semibold text-sm flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors">
                                <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
                            </button>
                        )}
                        {isAdmin && view !== 'admin' && (
                            <button onClick={() => setView('admin')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform">
                                Panel Admin
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
