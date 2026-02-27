const API_URL = "/api";

export const authService = {
    login: async (username, password) => {
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
                return data.jwt;
            }
        }
        throw new Error('Login failed');
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('lunita_admin');
    },

    getToken: () => {
        return localStorage.getItem('token');
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

        const response = await fetch(url, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid
            authService.logout();
            window.location.reload();
        }
        return response;
    }
};
