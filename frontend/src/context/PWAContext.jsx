import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext();

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PWAProvider({ children }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
    const [swRegistration, setSwRegistration] = useState(null);

    useEffect(() => {
        // 1. Detect Standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
        setIsInStandaloneMode(!!isStandalone);

        // 2. Install prompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 3. SW Registration & Subscription Check
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                setSwRegistration(registration);
                registration.pushManager.getSubscription().then(subscription => {
                    const hasSub = subscription !== null;
                    setIsSubscribed(hasSub);

                    // Auto-sync with backend if granted
                    if (hasSub && Notification.permission === 'granted') {
                        fetch(`${API_URL}/push/subscribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscription)
                        }).catch(err => console.error("PWA Auto-sync error:", err));
                    }
                });
            }).catch(err => console.error("PWA: SW Registration failed:", err));
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);
            setDeferredPrompt(null);
            return true;
        }
        return false;
    };

    const subscribeToPush = async (force = false) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert("SOPORTE: PushManager no detectado");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert("PERMISO: Denagado (" + permission + ")");
                return false;
            }

            const registration = await navigator.serviceWorker.ready;

            if (force) {
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) await existingSub.unsubscribe();
            }

            // Step 1: Public Key
            const res = await fetch(`${API_URL}/push/public-key`);
            if (!res.ok) {
                alert("ERROR: No se pudo obtener la llave pública del servidor");
                return false;
            }
            const { publicKey } = await res.json();

            // Step 2: Browser Subscribe
            let subscription;
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });
            } catch (e) {
                alert("ERROR Navegador: " + e.message);
                return false;
            }

            // Step 3: Server Subscribe
            const response = await fetch(`${API_URL}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                setIsSubscribed(true);
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert("ERROR Servidor (" + response.status + "): " + (errorData.error || "Error desconocido"));
                return false;
            }
        } catch (error) {
            console.error('PWA: Failed to subscribe:', error);
            alert("ERROR CRÍTICO: " + error.message);
            return false;
        }
    };

    return (
        <PWAContext.Provider value={{
            isInstallable,
            installPWA,
            isSubscribed,
            subscribeToPush,
            isInStandaloneMode,
            swRegistration
        }}>
            {children}
        </PWAContext.Provider>
    );
}

export const usePWAContext = () => useContext(PWAContext);
