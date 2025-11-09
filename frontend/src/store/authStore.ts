import { create } from 'zustand';
import { authService, User } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ accessToken: string; user: User }>;
  signup: (email: string, password: string, name: string) => Promise<{ accessToken: string; user: User }>;
  logout: () => void;
  init: () => void;
}

// Initialize from localStorage on store creation
const initialUser = authService.getUser();
const initialToken = authService.getToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!(initialToken && initialUser),
  isLoading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  login: async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      console.log('AuthStore: Login response received', response);
      
      // Ensure localStorage is set before updating state
      if (response && response.accessToken && response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Double-check localStorage is set
        if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        // Return the response so LoginPage can use it
        return response;
      } else {
        console.error('AuthStore: Invalid response structure', response);
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('AuthStore: Login error', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email, password, name) => {
    try {
      const response = await authService.signup({ email, password, name });
      console.log('AuthStore: Signup response received', response);
      
      // Ensure localStorage is set before updating state
      if (response && response.accessToken && response.user) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Double-check localStorage is set
        if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        // Return the response
        return response;
      } else {
        console.error('AuthStore: Invalid signup response structure', response);
        throw new Error('Invalid signup response');
      }
    } catch (error) {
      console.error('AuthStore: Signup error', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  init: () => {
    const user = authService.getUser();
    const token = authService.getToken();
    // User is authenticated if we have both token and user data
    set({ user, isAuthenticated: !!(token && user), isLoading: false });
  },
}));
