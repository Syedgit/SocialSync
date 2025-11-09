import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for login/signup endpoints
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/signup');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.log('🚫 API: 401 Unauthorized on protected endpoint', {
        url: error.config?.url,
        pathname: window.location.pathname
      });
      
      // Only clear and redirect if we're not navigating (to avoid race conditions)
      // Check if we just logged in (token exists)
      const token = localStorage.getItem('token');
      if (!token) {
        // Token was already cleared, safe to redirect
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          console.log('🚫 Redirecting to login (no token found)');
          window.location.href = '/login';
        }
      } else {
        // Token exists but got 401 - might be expired or invalid
        // Don't immediately clear, let the component handle it
        console.warn('⚠️ Got 401 but token exists - might be expired');
      }
    } else if (error.response?.status === 401 && isAuthEndpoint) {
      console.log('🔐 API: 401 on auth endpoint (login/signup failed)');
    }
    return Promise.reject(error);
  }
);

export default api;

