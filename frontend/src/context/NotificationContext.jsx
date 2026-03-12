import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { usePWA } from '../hooks/usePWA';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const { subscribeToPush } = usePWA();
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    const [permission, setPermission] = useState(isSupported ? Notification.permission : 'denied');

    // We remove the automatic request because iOS ONLY allows it from a user gesture (click)
    // and calls from useEffect will fail or be ignored.

    const requestPermission = async () => {
        if (!isSupported) return;
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'granted') {
                await subscribeToPush();
            }
        } catch (error) {
            console.warn("Notifications not fully supported/allowed on this browser", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ requestPermission, permission }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
