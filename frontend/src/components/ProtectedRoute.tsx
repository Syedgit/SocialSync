import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { setUser } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    let authFound = false;
    
    const checkAuth = () => {
      if (!mounted || authFound) return false;
      
      const token = authService.getToken();
      const user = authService.getUser();
      
      console.log('🔒 ProtectedRoute: Checking auth', { 
        token: !!token, 
        tokenLength: token?.length,
        user: !!user,
        userEmail: user?.email,
        path: window.location.pathname
      });
      
      if (token && user) {
        // Sync store with localStorage
        setUser(user);
        setIsAuthenticated(true);
        authFound = true;
        console.log('✅ ProtectedRoute: Authenticated - allowing access');
        return true;
      }
      
      return false;
    };

    // Check immediately
    if (checkAuth()) {
      return;
    }

    // Run sequential checks with delays
    const checkSequence = async () => {
      const delays = [50, 100, 200, 400, 600];
      
      for (const delay of delays) {
        await new Promise(resolve => setTimeout(resolve, delay));
        if (checkAuth() || !mounted) {
          return;
        }
      }
      
      // Final check - if still no auth, mark as unauthenticated
      if (mounted && !authFound) {
        const finalToken = localStorage.getItem('token');
        const finalUser = localStorage.getItem('user');
        
        if (finalToken && finalUser) {
          console.log('⚠️ ProtectedRoute: Found token on final check');
          const user = authService.getUser();
          setUser(user);
          setIsAuthenticated(true);
        } else {
          console.log('❌ ProtectedRoute: No token found after all checks');
          setIsAuthenticated(false);
        }
      }
    };

    checkSequence();

    return () => {
      mounted = false;
    };
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
    console.log('❌ ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  console.log('✅ ProtectedRoute: Rendering dashboard');
  return <>{children}</>;
}
