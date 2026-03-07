import React from 'react';
import { ShoppingBag, LogOut, Lock } from 'lucide-react';

export default function Navbar({ setView, cart, isAdmin, setIsAdmin, setShowLogin, view, setIsCartModalOpen }) {
    return (
        <nav className="sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.08)] px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
                        <div className="bg-gradient-to-tr from-rose-500 to-amber-300 p-2 rounded-xl text-white shadow-lg"><span className="text-2xl" role="img" aria-label="watermelon">🍉</span></div>
                        <div className="flex flex-col">
                            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">Media <span className="text-rose-500" style={{ fontFamily: 'cursive' }}>Luna</span></span>
                            <span className="text-[11px] text-slate-400 tracking-[0.25em] uppercase font-bold">Snack Bar</span>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {/* Cart Button with Badge */}
                        <button
                            onClick={() => setIsCartModalOpen(true)}
                            className="relative p-2 rounded-xl hover:bg-rose-50 transition group"
                        >
                            <ShoppingBag size={20} className="text-slate-700 group-hover:text-rose-500 transition" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-fade-in">
                                    {cart.length}
                                </span>
                            )}
                        </button>

                        {isAdmin ? (
                            <button onClick={() => { setIsAdmin(false); setView('home'); }} className="text-rose-600 font-semibold text-sm flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors">
                                <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
                            </button>
                        ) : (
                            <button onClick={() => setShowLogin(true)} className="text-slate-400 hover:text-rose-500 transition p-2 rounded-full hover:bg-rose-50">
                                <Lock size={18} />
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
