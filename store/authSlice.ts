import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    name?: string;
    company?: string;
    role?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token?: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.isAuthenticated = true;
            if (token) {
                Cookies.set('token', token, { expires: 1 });
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            Cookies.remove('token');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
