import Logger from '../utils/logger';

const API_URL = "/api";

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

export const notificationService = {
    getPublicKey: async () => {
        const res = await fetch(`${API_URL}/notifications/vapid-public-key`);
        const data = await res.json();
        return data.publicKey;
    },

    subscribeToPush: async () => {
        if (!('serviceWorker' in navigator)) return null;

        try {
            const registration = await navigator.serviceWorker.ready;
            const publicKey = await notificationService.getPublicKey();

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send subscription to backend
            await fetch(`${API_URL}/notifications/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            Logger.info('Push Subscribed successfully!');
            return subscription;
        } catch (error) {
            Logger.error('Error during push subscription process', error);
            throw error;
        }
    }
};
