import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export default function Layout() {
  const navigate = useNavigate();
  const logoutStore = useAuthStore((state) => state.logout);
  const storeAuth = useAuthStore((state) => state.isAuthenticated);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!(authService.getToken() && authService.getUser()),
  );

  useEffect(() => {
    const updateAuthState = () => {
      setIsAuthenticated(!!(authService.getToken() && authService.getUser()));
    };

    updateAuthState();
    window.addEventListener('storage', updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!(authService.getToken() && authService.getUser()) || storeAuth);
  }, [storeAuth]);

  const logoTarget = useMemo(() => (isAuthenticated ? '/dashboard' : '/'), [isAuthenticated]);

  const handleLogout = () => {
    logoutStore();
    authService.logout();
  };

  const handleDashboardNav = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to={logoTarget}
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                SocialSync
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleDashboardNav}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} SocialSync. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link className="hover:text-gray-700" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-gray-700" to="/terms">
              Terms of Service
            </Link>
            <Link className="hover:text-gray-700" to="/data-deletion">
              Data Deletion
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

