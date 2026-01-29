import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, subscriptionApi } from '../lib/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
            if (parsedUser.role === 'student') {
                refreshSubscription();
            }
        }
        setIsLoading(false);
    }, []);
    const refreshSubscription = async () => {
        try {
            const status = await subscriptionApi.checkStatus();
            setSubscriptionStatus({
                status: status.subscriptionStatus,
                expiryDate: status.subscriptionExpiryDate,
                isActive: status.isActive,
            });
        }
        catch (error) {
            // Only logout on 401 if it's a token valid issue, but we can't easily distinguish from Role issue 
            // unless we know the endpoint returns 403 for role.
            // Assuming api returns 401 for Invalid/Missing token only.
            if (error.name === 'ApiError' && error.status === 401) {
                logout();
            }
            setSubscriptionStatus({ status: 'free', expiryDate: null, isActive: false });
        }
    };
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };
    const login = async (email, password) => {
        const response = await authApi.login(email, password);
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.user.role === 'student') {
            await refreshSubscription();
        }
    };
    const register = async (data) => {
        const response = await authApi.register(data);
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        await refreshSubscription();
    };
    const logout = () => {
        setToken(null);
        setUser(null);
        setSubscriptionStatus(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, isLoading, login, register, logout, subscriptionStatus, refreshSubscription, updateUser }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
