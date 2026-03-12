import { useState, useEffect } from 'react';

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

export function usePWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

    useEffect(() => {
        // Detect if the app is running in standalone mode (installed PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
        setIsInStandaloneMode(!!isStandalone);
        console.log("PWA: Standalone mode detected:", !!isStandalone);

        const handleBeforeInstallPrompt = (e) => {
            console.log("PWA: beforeinstallprompt event fired");
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            console.log("PWA: SW and PushManager supported");
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log("PWA: SW Registered. Scope:", registration.scope);
                registration.pushManager.getSubscription().then(subscription => {
                    const hasSub = subscription !== null;
                    setIsSubscribed(hasSub);
                    console.log("PWA: Initial subscription check:", hasSub);

                    if (hasSub && Notification.permission === 'granted') {
                        fetch(`${API_URL}/push/subscribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscription)
                        }).catch(err => console.error("PWA: Auto-resubscribe error:", err));
                    }
                }).catch(err => console.error("PWA: getSubscription error:", err));
            }).catch(err => {
                console.error("PWA: SW Registration failed:", err);
            });
        } else {
            console.warn("PWA: SW or PushManager NOT supported");
            const hasSW = 'serviceWorker' in navigator;
            const hasPush = 'PushManager' in window;
            console.log(`PWA Diagnostics: SW=${hasSW}, Push=${hasPush}, Standalone=${!!isStandalone}`);
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
            console.error('Push missing');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;

            const registration = await navigator.serviceWorker.ready;

            // If forcing, try to unsubscribe first to get a fresh subscription
            if (force) {
                const existingSub = await registration.pushManager.getSubscription();
                if (existingSub) {
                    await existingSub.unsubscribe();
                }
            }

            const res = await fetch(`${API_URL}/push/public-key`);
            const data = await res.json();
            const publicKey = data.publicKey;

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
            console.error('Failed to subscribe:', error);
            return false;
        }
    };

    return {
        isInstallable,
        installPWA,
        isSubscribed,
        subscribeToPush,
        isInStandaloneMode
    };
}
