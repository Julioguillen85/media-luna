import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ message, type = 'info', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const styles = {
        success: 'bg-green-100 text-green-800 border-green-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    return (
        <div className={`fixed max-md:bottom-24 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg z-[70] animate-fade-in-up ${styles[type]}`}>
            <span className="shrink-0">{icons[type]}</span>
            <p className="font-semibold text-sm">{message}</p>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition">
                <X size={16} />
            </button>
        </div>
    );
}
