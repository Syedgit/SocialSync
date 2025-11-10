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
    // Handle 401 errors - let ProtectedRoute handle redirects
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/signup');
      
      if (!isAuthEndpoint) {
        // For protected endpoints, clear auth if token is invalid
        // ProtectedRoute will handle the redirect
        const token = localStorage.getItem('token');
        if (!token) {
          // No token, clear user data
          localStorage.removeItem('user');
        }
        // If token exists but got 401, it might be expired
        // ProtectedRoute will check and redirect if needed
      }
    }
    
    // Handle 404 errors
    if (error.response?.status === 404) {
      console.warn('⚠️ API: 404 Not Found', {
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;

