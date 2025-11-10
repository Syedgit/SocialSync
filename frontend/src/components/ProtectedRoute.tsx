import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { setUser } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    // Synchronous initial check - critical for immediate navigation after login
    const token = authService.getToken();
    const user = authService.getUser();
    if (token && user) {
      return true;
    }
    return null;
  });

  useEffect(() => {
    // Sync store with localStorage on mount
    const token = authService.getToken();
    const user = authService.getUser();
    
    if (token && user) {
      setUser(user);
      setIsAuthenticated(true);
    } else {
      // Give a small delay for async updates, then check again
      const timeoutId = setTimeout(() => {
        const finalToken = authService.getToken();
        const finalUser = authService.getUser();
        if (finalToken && finalUser) {
          setUser(finalUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [setUser]);

  // Show loading spinner while checking
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
}
