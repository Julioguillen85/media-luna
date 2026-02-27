import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function DiscountTimer() {
    const [timeLeft, setTimeLeft] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [showExpiredMessage, setShowExpiredMessage] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentSecond = now.getSeconds();

            // Active window: 8:00 AM (8) to 7:59:59 PM (19). Ends exactly at 20:00:00 (8:00 PM)
            const isWindowActive = currentHour >= 8 && currentHour < 20;

            // Post-window expiration message: 8:00 PM (20) to 9:59:59 PM (21). Turns off at 22:00:00 (10:00 PM).
            const isWindowExpired = currentHour >= 20 && currentHour < 22;

            if (isWindowActive) {
                // Calculate time remaining until 20:00:00 (8:00 PM) today
                const endDate = new Date(now);
                endDate.setHours(20, 0, 0, 0);

                const difference = endDate - now;

                if (difference > 0) {
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                    setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
                    setIsActive(true);
                    setShowExpiredMessage(false);
                } else {
                    setIsActive(false);
                    setShowExpiredMessage(true);
                }
            } else if (isWindowExpired) {
                setIsActive(false);
                setShowExpiredMessage(true);
            } else {
                // Before 8 AM or after 10 PM -> Hide everything
                setIsActive(false);
                setShowExpiredMessage(false);
            }
        };

        // Run immediately on mount
        calculateTimeLeft();

        // Update every second
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    // If completely inactive (before 8 AM or after 8 PM), render nothing
    if (!isActive && !showExpiredMessage) return null;

    return (
        <div className="w-full max-w-4xl mx-auto my-6 px-4 animate-fade-in">
            {isActive ? (
                <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 rounded-2xl p-4 shadow-lg shadow-rose-200/50 flex flex-col md:flex-row items-center justify-between text-white border border-rose-400/30">
                    <div className="flex items-center gap-3 mb-3 md:mb-0">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Clock size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-lg leading-tight uppercase tracking-wide">¡15% de Descuento!</h3>
                            <p className="text-rose-100 text-sm font-medium flex items-center gap-1">¡Si apartas tu fecha hoy! <span className="text-base animate-pulse">💣</span></p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-inner">
                        <span className="text-xs uppercase font-bold text-rose-200 tracking-wider">Termina en:</span>
                        <span className="text-2xl font-black font-mono tracking-widest">{timeLeft}</span>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-center gap-3 text-slate-500">
                    <AlertCircle size={20} className="text-amber-500" />
                    <p className="text-sm font-medium">El descuento especial para apartar hoy ha terminado. ¡Vuelve mañana a las 8:00 AM!</p>
                </div>
            )}
        </div>
    );
}
