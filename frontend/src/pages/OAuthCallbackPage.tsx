import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { oauthService } from '../services/oauth.service';
import { socialAccountsService } from '../services/social-accounts.service';

export default function OAuthCallbackPage() {
  const { platform } = useParams<{ platform: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (success === 'true') {
          setStatus('success');
          setMessage('Account connected successfully!');

          // Refresh accounts list and redirect
          await socialAccountsService.getAll();
          setTimeout(() => navigate('/dashboard/accounts'), 2000);
          return;
        }

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'Authorization was denied or failed');
          setTimeout(() => navigate('/dashboard/connect'), 3000);
          return;
        }

        // If no success or error, wait a bit - backend might still be processing
        setTimeout(() => {
          setStatus('error');
          setMessage('Connection timeout. Please try again.');
          setTimeout(() => navigate('/dashboard/connect'), 3000);
        }, 5000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to connect account');
        setTimeout(() => navigate('/dashboard/connect'), 3000);
      }
    };

    handleCallback();
  }, [platform, searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting Account</h2>
            <p className="text-gray-600">Please wait while we connect your {platform} account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to accounts page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}

