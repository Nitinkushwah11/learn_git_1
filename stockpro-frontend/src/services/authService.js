import { authApi } from './api';

export const authService = {
    login: async (email, password) => {
        const response = await authApi.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                userId: response.data.userId,
                fullName: response.data.fullName,
                email: response.data.email,
                role: response.data.role
            }));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await authApi.post('/auth/register', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (err) {
            console.error("Error parsing user from localStorage", err);
            localStorage.removeItem('user'); // Clear corrupted data
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // --- Admin / Settings methods ---

    getAllUsers: async () => {
        const response = await authApi.get('/auth/users');
        return response.data;
    },

    updateProfile: async (userId, profileData) => {
        const response = await authApi.put(`/auth/profile/${userId}`, profileData);
        return response.data;
    },

    changePassword: async (userId, newPassword) => {
        const response = await authApi.put(`/auth/password/${userId}`, { password: newPassword });
        return response.data;
    },

    deactivateUser: async (userId) => {
        const response = await authApi.put(`/auth/deactivate/${userId}`);
        return response.data;
    }
};
