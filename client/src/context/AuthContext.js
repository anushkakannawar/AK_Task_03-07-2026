/**
 * Auth Context — React Context API for global auth state
 * Evaluation Criterion: State Management — auth state, user data
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// ── State shape ───────────────────────────────────────────────────────────────
const initialState = {
  user:          null,
  accessToken:   null,
  refreshToken:  null,
  isAuthenticated: false,
  isLoading:     true, // true until we know if user is logged in
};

// ── Reducer ───────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user:            action.payload.user,
        accessToken:     action.payload.accessToken,
        refreshToken:    action.payload.refreshToken,
        isAuthenticated: true,
        isLoading:       false,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken  = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser   = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, accessToken, refreshToken },
          });
        } catch {
          localStorage.clear();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(email, password);
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user',         JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken, refreshToken } });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, role: user.role };
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authService.logout(refreshToken);
    } catch {
      // Silently fail — clear tokens regardless
    } finally {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((updates) => {
    const updatedUser = { ...state.user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
        isAdmin:    state.user?.role === 'admin',
        isEmployee: state.user?.role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
