import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = authService.getToken();
        if (token) {
            const decoded = authService.decodeToken(token);
            setUser({ token, role: decoded?.role || 'ROLE_ADMIN' });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const token = await authService.login(username, password);
            const decoded = authService.decodeToken(token);
            setUser({ token, role: decoded?.role || 'ROLE_ADMIN' });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
