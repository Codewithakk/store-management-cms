// context/auth-context.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  validateUserData,
} from '@/store/slices/authSlice';
import { User } from '@/types';
import { persistor } from '@/store/index'; // Import persistor

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  roles: string; // Added the missing 'roles' property
  phone: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Listen for localStorage changes from other tabs or manual edits
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        dispatch(validateUserData());
      }
    };

    // Check for user data on mount
    dispatch(validateUserData());

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
      await router.push('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const logout = async () => {
    try {
      // First, dispatch logout action to clear auth state and localStorage
      await dispatch(logoutUser()).unwrap();

      // Then purge all persisted Redux states
      await persistor.purge();

      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if logout fails, still attempt to clear state and redirect
      await persistor.purge();
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
