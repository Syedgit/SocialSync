import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { socialAccountsService } from '../services/social-accounts.service';
import { postsService } from '../services/posts.service';

export default function DashboardPage() {
  const [connectedAccounts, setConnectedAccounts] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [scheduledPosts, setScheduledPosts] = useState(0);

  useEffect(() => {
    // Delay loading stats slightly to ensure auth token is ready
    const timer = setTimeout(() => {
      loadStats();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    try {
      const [accounts, posts] = await Promise.all([
        socialAccountsService.getAll(),
        postsService.getAll(),
      ]);

      setConnectedAccounts(accounts.length);
      setTotalPosts(posts.length);
      setScheduledPosts(posts.filter((p) => p.status === 'scheduled').length);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
      // Don't throw - just log the error, stats are not critical
      // If it's a 401, the API interceptor will handle it
      if (error.response?.status === 401) {
        console.warn('⚠️ 401 error loading stats - token might be invalid');
      }
    }
  };
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 pointer-events-none -z-10"></div>
      
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">Welcome back! Manage your social media accounts and posts.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Connected Accounts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{connectedAccounts}</p>
              <p className="text-xs text-gray-400 mt-1">Social platforms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Scheduled Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{scheduledPosts}</p>
              <p className="text-xs text-gray-400 mt-1">Upcoming posts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalPosts}</p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Connect Accounts Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md hover:shadow-xl border border-indigo-100 p-6 card-hover animate-fade-in-up group" style={{ animationDelay: '0.4s' }}>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
              <svg
                className="h-8 w-8 text-white"
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
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Connect Accounts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Connect your social media accounts to start posting.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/connect"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Connect Accounts
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Create Post Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md hover:shadow-xl border border-green-100 p-6 card-hover animate-fade-in-up group" style={{ animationDelay: '0.5s' }}>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Create Post</h3>
            <p className="mt-2 text-sm text-gray-600">
              Write and schedule posts for your connected accounts.
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard/posts/create"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Create Post
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

