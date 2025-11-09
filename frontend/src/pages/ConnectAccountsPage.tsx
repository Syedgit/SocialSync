import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { socialAccountsService, SocialAccount } from '../services/social-accounts.service';
import { oauthService } from '../services/oauth.service';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon,
  TikTokIcon,
  PinterestIcon,
  YouTubeIcon,
} from '../components/SocialMediaIcons';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  connected: boolean;
  verified: boolean;
  LogoComponent: React.ComponentType<{ className?: string }>;
}

const platforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-[#1877F2]',
    description: 'Connect your Facebook Pages and Groups',
    connected: false,
    verified: false,
    LogoComponent: FacebookIcon,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-[#E4405F] via-[#F77737] to-[#FCAF45]',
    description: 'Connect your Instagram Business account',
    connected: false,
    verified: false,
    LogoComponent: InstagramIcon,
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '🐦',
    color: 'bg-black',
    description: 'Connect your Twitter account',
    connected: false,
    verified: false,
    LogoComponent: TwitterIcon,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-[#0A66C2]',
    description: 'Connect your LinkedIn profile and company pages',
    connected: false,
    verified: false,
    LogoComponent: LinkedInIcon,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    description: 'Connect your TikTok Business account',
    connected: false,
    verified: false,
    LogoComponent: TikTokIcon,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: 'bg-[#BD081C]',
    description: 'Connect your Pinterest business account',
    connected: false,
    verified: false,
    LogoComponent: PinterestIcon,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: 'bg-[#FF0000]',
    description: 'Connect your YouTube channel',
    connected: false,
    verified: false,
    LogoComponent: YouTubeIcon,
  },
];

export default function ConnectAccountsPage() {
  const [accounts, setAccounts] = useState<SocialPlatform[]>(platforms);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await socialAccountsService.getAll();
      setConnectedAccounts(accounts);
      
      // Update platform connection status
      setAccounts((prev) =>
        prev.map((platform) => {
          const connected = accounts.find((acc) => acc.platform === platform.id);
          // Find the original platform config to preserve LogoComponent
          const originalPlatform = platforms.find((p) => p.id === platform.id);
          return {
            ...platform,
            ...originalPlatform,
            connected: !!connected,
            verified: connected?.isVerified || false,
          };
        })
      );
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    }
  };

  const handleConnect = async (platformId: string) => {
    try {
      setConnectingPlatform(platformId);
      
      // Get OAuth URL from backend
      const authUrl = await oauthService.getAuthUrl(platformId);
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error: any) {
      setConnectingPlatform(null);
      alert(error.response?.data?.message || `Failed to initiate ${platformId} connection. Please make sure OAuth credentials are configured in the backend.`);
    }
  };

  const handleVerify = (platformId: string) => {
    // TODO: Implement verification flow
    console.log('Verifying:', platformId);
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === platformId ? { ...acc, verified: true } : acc))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connect Social Media Accounts</h1>
        <p className="mt-2 text-gray-600">
          Connect your social media accounts to start managing and scheduling posts from one place.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-indigo-800">How it works</h3>
            <div className="mt-2 text-sm text-indigo-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Connect" on any platform to authorize SocialSync</li>
                <li>Grant the necessary permissions for posting and scheduling</li>
                <li>Verify your account to ensure secure access</li>
                <li>Start creating and scheduling posts!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {accounts.map((platform) => (
          <div
            key={platform.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Platform Header */}
            <div className={`${platform.color} p-6 text-white relative overflow-hidden`}>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                    <platform.LogoComponent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{platform.name}</h3>
                  </div>
                </div>
                {platform.connected && (
                  <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {platform.connected && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                )}
                {platform.verified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Verified
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!platform.connected ? (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform === platform.id}
                    className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    style={{ minHeight: '44px' }} // iOS minimum touch target
                  >
                    {connectingPlatform === platform.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Connect Account
                      </>
                    )}
                  </button>
                ) : !platform.verified ? (
                  <button
                    onClick={() => handleVerify(platform.id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Connected & Verified
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                      Manage
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Connection Issues?</h3>
            <p className="text-sm text-gray-600">
              If you're having trouble connecting an account, make sure you have the necessary permissions
              and your account is set up correctly.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Verification Required?</h3>
            <p className="text-sm text-gray-600">
              Some platforms require additional verification for security. Follow the platform-specific
              instructions to complete verification.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            to="/dashboard/settings"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View connection settings →
          </Link>
        </div>
      </div>
    </div>
  );
}

