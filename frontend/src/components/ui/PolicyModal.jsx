import React from 'react';

export default function PolicyModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full my-8 shadow-2xl relative transition-colors duration-300 transform scale-100 flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 z-10 font-bold transition-colors"
                >
                    ✕
                </button>
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <h3 className="font-extrabold text-2xl mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                        📋 Políticas de Reservación
                    </h3>

                    <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <p>
                            En <strong>Media Luna Snack Bar</strong> preparamos todos nuestros alimentos al momento con los ingredientes más frescos para garantizar la mejor calidad en tu evento.
                        </p>

                        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-4">
                            <h4 className="font-bold text-rose-700 dark:text-rose-400 mb-1">Cancelaciones</h4>
                            <p className="text-rose-800/80 dark:text-rose-200/80">
                                <strong>No ofrecemos reembolsos</strong> por cancelación bajo ninguna circunstancia. El anticipo o pago completo asegura tu fecha y nuestro inventario.
                            </p>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4">
                            <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Reagendar Fechas</h4>
                            <p className="text-amber-800/80 dark:text-amber-200/80">
                                Para modificar la fecha de tu evento, requerimos que nos notifiques con al menos <strong>10 días de anticipación</strong>. Sujeto a disponibilidad en nuestra agenda.
                            </p>
                        </div>

                        <p className="pt-2 italic text-center text-xs opacity-75">
                            Al continuar con tu pedido, confirmas que has leído y aceptas estas políticas.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
