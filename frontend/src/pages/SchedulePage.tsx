import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, searchQuery, platformFilter, dateFilter, selectedDate, viewMode]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await postsService.getAll();
      // Filter to show only scheduled and draft posts
      const scheduledPosts = data.filter((post) => post.status === 'scheduled' || post.status === 'draft');
      setPosts(scheduledPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = posts.filter((post) => post.status === 'scheduled' || post.status === 'draft');

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.id.toString().includes(searchQuery)
      );
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter((post) => {
        const platforms = Array.isArray(post.platforms) ? post.platforms : [];
        return platforms.includes(platformFilter);
      });
    }

    // Date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((post) => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor).toISOString().split('T')[0];
        return postDate === today;
      });
    } else if (dateFilter === 'this-week') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      filtered = filtered.filter((post) => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate >= weekStart && postDate <= weekEnd;
      });
    } else if (dateFilter === 'this-month') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      filtered = filtered.filter((post) => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor);
        return postDate >= monthStart && postDate <= monthEnd;
      });
    } else if (dateFilter === 'selected' && viewMode === 'calendar') {
      filtered = filtered.filter((post) => {
        if (!post.scheduledFor) return false;
        const postDate = new Date(post.scheduledFor).toISOString().split('T')[0];
        return postDate === selectedDate;
      });
    }

    // Sort by scheduled date
    filtered.sort((a, b) => {
      const dateA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
      const dateB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
      return dateA - dateB;
    });

    setFilteredPosts(filtered);
  };

  const handleDelete = async (postId: string | number) => {
    try {
      await postsService.delete(String(postId));
      await loadPosts();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPlatforms = (post: Post): string[] => {
    if (Array.isArray(post.platforms)) {
      return post.platforms;
    }
    if (typeof post.platforms === 'string') {
      try {
        return JSON.parse(post.platforms);
      } catch {
        return [];
      }
    }
    return [];
  };

  const getPostsByDate = () => {
    const postsByDate: Record<string, Post[]> = {};
    filteredPosts.forEach((post) => {
      if (post.scheduledFor) {
        const date = new Date(post.scheduledFor).toISOString().split('T')[0];
        if (!postsByDate[date]) {
          postsByDate[date] = [];
        }
        postsByDate[date].push(post);
      }
    });
    return postsByDate;
  };

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const todayCount = posts.filter((p) => {
    if (!p.scheduledFor) return false;
    const today = new Date().toISOString().split('T')[0];
    const postDate = new Date(p.scheduledFor).toISOString().split('T')[0];
    return postDate === today;
  }).length;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="mt-2 text-gray-600">Manage and view your scheduled posts.</p>
        </div>
        <Link
          to="/dashboard/posts/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all touch-manipulation"
          style={{ minHeight: '44px' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Post
        </Link>
      </div>

      {/* Stats Summary */}
      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">{scheduledCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Drafts</p>
                <p className="text-2xl font-semibold text-gray-900">{draftCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{todayCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Posts
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
                placeholder="Search by content or ID..."
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

          {/* Date Filter */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              id="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {getCalendarDays().map((day, idx) => {
              if (!day) {
                return <div key={idx} className="aspect-square"></div>;
              }
              const dayStr = day.toISOString().split('T')[0];
              const dayPosts = getPostsByDate()[dayStr] || [];
              const isToday = dayStr === new Date().toISOString().split('T')[0];
              const isSelected = selectedDate === dayStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(dayStr);
                    setDateFilter('selected');
                  }}
                  className={`aspect-square border-2 rounded-lg p-2 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : isToday
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </div>
                  {dayPosts.length > 0 && (
                    <div className="text-xs text-gray-600">
                      {dayPosts.length} {dayPosts.length === 1 ? 'post' : 'posts'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No scheduled posts</h3>
          <p className="mt-2 text-sm text-gray-500">
            {posts.length === 0
              ? 'Get started by scheduling your first post!'
              : 'Try adjusting your filters to see more results.'}
          </p>
          {posts.length === 0 && (
            <div className="mt-6">
              <Link
                to="/dashboard/posts/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Schedule Your First Post
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const platforms = getPlatforms(post);
            const mediaUrls = Array.isArray(post.mediaUrls)
              ? post.mediaUrls
              : post.mediaUrls
              ? JSON.parse(post.mediaUrls)
              : [];

            return (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[post.status as keyof typeof statusColors]}`}
                        >
                          {post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(post.scheduledFor)}
                        </span>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap break-words">{post.content}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/posts/create?postId=${post.id}`)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors touch-manipulation"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(String(post.id))}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Media */}
                  {mediaUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {mediaUrls.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Media ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platforms */}
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Platforms:</span>
                      {platforms.map((platform) => {
                        const IconComponent = platformIcons[platform];
                        return (
                          <div
                            key={platform}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
                          >
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <span className="text-sm text-gray-700 capitalize">{platform}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/dashboard/posts/create?postId=${post.id}`)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(String(post.id))}
                      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === String(post.id) && (
                  <div className="bg-red-50 border-t border-red-200 p-4">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to cancel this scheduled post? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Cancel Post
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Keep Scheduled
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

