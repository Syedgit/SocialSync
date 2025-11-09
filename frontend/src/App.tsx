import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ConnectAccountsPage from './pages/ConnectAccountsPage';
import PostsPage from './pages/PostsPage';
import CreatePostPage from './pages/CreatePostPage';
import SchedulePage from './pages/SchedulePage';
import AccountsPage from './pages/AccountsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DataDeletionPage from './pages/DataDeletionPage';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route path="data-deletion" element={<DataDeletionPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="connect" element={<ConnectAccountsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/create" element={<CreatePostPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="oauth/:platform/callback" element={<OAuthCallbackPage />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
