import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const userService = {
    getAllUsers: async () => {
        const response = await authService.fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Error fetching users');
        return response.json();
    },

    createUser: async (username, password, role = 'ROLE_ASSISTANT') => {
        const response = await authService.fetch(`${API_URL}/users`, {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
        if (!response.ok) throw new Error('Error creating user');
        return response.json();
    },

    deleteUser: async (id) => {
        const response = await authService.fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error deleting user');
        return response.json();
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await authService.fetch(`${API_URL}/users/change-password`, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error changing password');
        }
        return response.json();
    }
};
