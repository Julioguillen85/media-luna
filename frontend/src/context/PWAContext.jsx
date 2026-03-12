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
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;

            const registration = await navigator.serviceWorker.ready;

            if (force) {
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) await existingSub.unsubscribe();
            }

            const res = await fetch(`${API_URL}/push/public-key`);
            const { publicKey } = await res.json();

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            const response = await fetch(`${API_URL}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                setIsSubscribed(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('PWA: Failed to subscribe:', error);
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
