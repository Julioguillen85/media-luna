import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        if (user && permission === 'default') {
            requestPermission();
        }
    }, [user]); // Request when user logs in

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            await notificationService.subscribeToPush();
        }
    };

    return (
        <NotificationContext.Provider value={{ requestPermission, permission }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
