import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('quickbite-user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, data } = res;
            localStorage.setItem('quickbite-token', token);
            localStorage.setItem('quickbite-user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', formData);
            const { token, data } = res;
            localStorage.setItem('quickbite-token', token);
            localStorage.setItem('quickbite-user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // Logout even if API fails
        }
        localStorage.removeItem('quickbite-token');
        localStorage.removeItem('quickbite-user');
        setUser(null);
    };

    const updateProfile = async (data) => {
        try {
            const res = await api.put('/auth/update-profile', data);
            const updated = res.data.user;
            localStorage.setItem('quickbite-user', JSON.stringify(updated));
            setUser(updated);
            return { success: true, user: updated };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider
            value={{ user, login, register, logout, updateProfile, loading, isAuthenticated }}
        >
            {children}
        </AuthContext.Provider>
    );
};
