import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { socialAccountsService, SocialAccount } from '../services/social-accounts.service';
import { postsService, Post } from '../services/posts.service';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon,
  TikTokIcon,
  PinterestIcon,
  YouTubeIcon,
} from '../components/SocialMediaIcons';

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
  youtube: YouTubeIcon,
};

const platformColors: Record<string, string> = {
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-gradient-to-r from-[#E4405F] via-[#F77737] to-[#FCAF45]',
  twitter: 'bg-black',
  linkedin: 'bg-[#0A66C2]',
  tiktok: 'bg-black',
  pinterest: 'bg-[#BD081C]',
  youtube: 'bg-[#FF0000]',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [accounts, searchQuery, platformFilter, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, postsData] = await Promise.all([
        socialAccountsService.getAll(),
        postsService.getAll(),
      ]);
      setAccounts(accountsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (account) =>
          account.platformAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.platformAccountUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          account.platform.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter((account) => account.platform === platformFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter((account) => account.isVerified);
      } else if (statusFilter === 'active') {
        filtered = filtered.filter((account) => account.isActive);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter((account) => !account.isActive);
      }
    }

    setFilteredAccounts(filtered);
  };

  const handleDelete = async (accountId: string) => {
    try {
      await socialAccountsService.delete(accountId);
      await loadData();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error.response?.data?.message || 'Failed to disconnect account. Please try again.');
    }
  };

  const getAccountStats = (platform: string) => {
    const accountPosts = posts.filter((post) => {
      const platforms = Array.isArray(post.platforms)
        ? post.platforms
        : post.platforms
        ? JSON.parse(post.platforms)
        : [];
      return platforms.includes(platform);
    });

    return {
      total: accountPosts.length,
      published: accountPosts.filter((p) => p.status === 'published').length,
      scheduled: accountPosts.filter((p) => p.status === 'scheduled').length,
      draft: accountPosts.filter((p) => p.status === 'draft').length,
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isTokenExpired = (account: SocialAccount) => {
    // Check if token might be expired (this is a simple check)
    // In production, you'd check tokenExpiresAt from the backend
    return false; // Placeholder - backend should provide this info
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalAccounts = accounts.length;
  const verifiedAccounts = accounts.filter((a) => a.isVerified).length;
  const activeAccounts = accounts.filter((a) => a.isActive).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
          <p className="mt-2 text-gray-600">Manage and monitor your connected social media accounts.</p>
        </div>
        <Link
          to="/dashboard/connect"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Connect Account
        </Link>
      </div>

      {/* Stats Summary */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Verified</p>
                <p className="text-2xl font-semibold text-gray-900">{verifiedAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{activeAccounts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {accounts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Accounts
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, username, or platform..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                id="platform"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
                <option value="pinterest">Pinterest</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {accounts.length === 0 ? 'No Connected Accounts' : 'No Accounts Found'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {accounts.length === 0
              ? 'Get started by connecting your social media accounts.'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {accounts.length === 0 && (
            <div className="mt-6">
              <Link
                to="/dashboard/connect"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Connect Your First Account
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAccounts.map((account) => {
            const IconComponent = platformIcons[account.platform];
            const stats = getAccountStats(account.platform);
            const color = platformColors[account.platform] || 'bg-gray-500';

            return (
              <div
                key={account.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Platform Header */}
                <div className={`${color} p-6 text-white relative overflow-hidden`}>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                        {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold capitalize">{account.platform}</h3>
                      </div>
                    </div>
                    {account.isVerified && (
                      <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-6">
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-4 mb-4">
                    {account.avatar ? (
                      <img
                        src={account.avatar}
                        alt={account.platformAccountName}
                        className="w-12 h-12 rounded-full border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {account.platformAccountName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-gray-900 truncate">
                        {account.platformAccountName}
                      </p>
                      {account.platformAccountUsername && (
                        <p className="text-sm text-gray-500 truncate">@{account.platformAccountUsername}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                    {account.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                    {!account.isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    {isTokenExpired(account) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Token Expired
                      </span>
                    )}
                  </div>

                  {/* Post Statistics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{stats.total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{stats.published}</div>
                      <div className="text-xs text-gray-500">Published</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{stats.scheduled}</div>
                      <div className="text-xs text-gray-500">Scheduled</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-4 pt-4 border-t border-gray-200">
                    <div>Connected: {formatDate(account.createdAt)}</div>
                    {account.updatedAt && account.updatedAt !== account.createdAt && (
                      <div>Updated: {formatDate(account.updatedAt)}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Navigate to posts filtered by this platform
                        navigate('/dashboard/posts', { state: { platform: account.platform } });
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-colors touch-manipulation"
                      style={{ minHeight: '44px' }}
                    >
                      View Posts
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(account.id)}
                      className="w-full px-4 py-2.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors touch-manipulation"
                      style={{ minHeight: '44px' }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === account.id && (
                  <div className="bg-red-50 border-t border-red-200 p-4">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to disconnect this account? All scheduled posts for this account will be cancelled.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Disconnect
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
