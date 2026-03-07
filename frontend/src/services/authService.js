import Logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export const authService = {
    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.jwt) {
                    localStorage.setItem('token', data.jwt);
                    localStorage.setItem('lunita_admin', 'true'); // Keep legacy flag for now
                    Logger.info('User successfully logged in');
                    return data.jwt;
                }
            }
            Logger.warn('Login attempt failed - invalid credentials', { status: response.status });
            throw new Error('Login failed');
        } catch (error) {
            Logger.error('Error during login process', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lunita_admin');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    decodeToken: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    fetch: async (url, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                Logger.warn('Auth token expired or invalid, triggering logout', { status: response.status, url });
                authService.logout();
                window.location.reload();
            }
            return response;
        } catch (error) {
            Logger.error('Error during authenticated fetch', error, { url });
            throw error;
        }
    }
};
