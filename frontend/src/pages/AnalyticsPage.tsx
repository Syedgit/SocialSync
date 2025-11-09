import { useState, useEffect, useCallback } from 'react';
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
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#000000',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  pinterest: '#BD081C',
  youtube: '#FF0000',
};

interface AnalyticsData {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  failedPosts: number;
  platformDistribution: Record<string, number>;
  postsOverTime: Array<{ date: string; count: number }>;
  postsByDayOfWeek: Record<string, number>;
  postsByHour: Record<string, number>;
  topPlatforms: Array<{ platform: string; count: number; percentage: number }>;
  growthRate: number;
  averagePostsPerDay: number;
}

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const calculateAnalytics = useCallback(() => {
    try {
      console.log('Calculating analytics...', { postsCount: posts.length, timeRange });
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      const filteredPosts = posts.filter((post) => {
        try {
          if (!post.createdAt) return false;
          const postDate = new Date(post.createdAt);
          return postDate >= startDate;
        } catch (error) {
          console.warn('Error parsing post date:', post.createdAt, error);
          return false;
        }
      });

      // Status distribution
      const publishedPosts = filteredPosts.filter((p) => p.status === 'published').length;
      const scheduledPosts = filteredPosts.filter((p) => p.status === 'scheduled').length;
      const draftPosts = filteredPosts.filter((p) => p.status === 'draft').length;
      const failedPosts = filteredPosts.filter((p) => p.status === 'failed').length;

      // Platform distribution
      const platformDistribution: Record<string, number> = {};
      filteredPosts.forEach((post) => {
        try {
          const platforms = Array.isArray(post.platforms)
            ? post.platforms
            : post.platforms
            ? JSON.parse(post.platforms)
            : [];
          platforms.forEach((platform: string) => {
            platformDistribution[platform] = (platformDistribution[platform] || 0) + 1;
          });
        } catch (error) {
          console.warn('Error parsing platforms:', post.platforms, error);
        }
      });

      // Posts over time
      const postsOverTime: Array<{ date: string; count: number }> = [];
      const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = filteredPosts.filter((post) => {
          try {
            if (!post.createdAt) return false;
            const postDate = new Date(post.createdAt).toISOString().split('T')[0];
            return postDate === dateStr;
          } catch (error) {
            return false;
          }
        }).length;
        postsOverTime.push({ date: dateStr, count });
      }

      // Posts by day of week
      const postsByDayOfWeek: Record<string, number> = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };
      filteredPosts.forEach((post) => {
        try {
          if (!post.createdAt) return;
          const day = new Date(post.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
          postsByDayOfWeek[day] = (postsByDayOfWeek[day] || 0) + 1;
        } catch (error) {
          console.warn('Error parsing post day:', post.createdAt, error);
        }
      });

      // Posts by hour
      const postsByHour: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        postsByHour[i.toString()] = 0;
      }
      filteredPosts.forEach((post) => {
        try {
          if (!post.createdAt) return;
          const hour = new Date(post.createdAt).getHours();
          postsByHour[hour.toString()] = (postsByHour[hour.toString()] || 0) + 1;
        } catch (error) {
          console.warn('Error parsing post hour:', post.createdAt, error);
        }
      });

      // Top platforms
      const totalPlatformPosts = Object.values(platformDistribution).reduce((a, b) => a + b, 0);
      const topPlatforms = Object.entries(platformDistribution)
        .map(([platform, count]) => ({
          platform,
          count,
          percentage: totalPlatformPosts > 0 ? (count / totalPlatformPosts) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Growth rate (comparing last period with previous period)
      const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const currentPeriodCount = filteredPosts.length;
      const previousPeriodCount = posts.filter((post) => {
        try {
          if (!post.createdAt) return false;
          const postDate = new Date(post.createdAt);
          return postDate >= previousPeriodStart && postDate < startDate;
        } catch {
          return false;
        }
      }).length;
      const growthRate = previousPeriodCount > 0 ? ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100 : 0;

      // Average posts per day
      const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
      const averagePostsPerDay = filteredPosts.length / daysDiff;

      const analyticsData: AnalyticsData = {
        totalPosts: filteredPosts.length,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        failedPosts,
        platformDistribution,
        postsOverTime,
        postsByDayOfWeek,
        postsByHour,
        topPlatforms,
        growthRate,
        averagePostsPerDay,
      };

      console.log('Analytics calculated:', analyticsData);
      setAnalytics(analyticsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Set default analytics even on error
      setAnalytics({
        totalPosts: 0,
        publishedPosts: 0,
        scheduledPosts: 0,
        draftPosts: 0,
        failedPosts: 0,
        platformDistribution: {},
        postsOverTime: [],
        postsByDayOfWeek: {
          Sunday: 0,
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
        },
        postsByHour: {},
        topPlatforms: [],
        growthRate: 0,
        averagePostsPerDay: 0,
      });
      setIsLoading(false);
    }
  }, [posts, timeRange]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading || posts.length >= 0) {
      calculateAnalytics();
    }
  }, [calculateAnalytics, isLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading analytics data...');
      const postsData = await postsService.getAll();
      console.log('Analytics data loaded:', { posts: postsData?.length || 0 });
      setPosts(postsData || []);
      // Don't set isLoading to false here - let calculateAnalytics handle it
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Set empty arrays on error so analytics can still calculate
      setPosts([]);
      setIsLoading(false);
    }
  };

  const getMaxValue = (data: number[]) => {
    const max = Math.max(...data, 1);
    return max === 0 ? 1 : max;
  };

  const BarChart = ({ data, labels, colors, height = 200, labelInterval = 1 }: { data: number[]; labels: string[]; colors?: string[]; height?: number; labelInterval?: number }) => {
    const maxValue = getMaxValue(data);

    // Calculate optimal label interval to prevent overlap
    let optimalInterval = labelInterval;
    if (data.length > 30) {
      optimalInterval = Math.max(1, Math.floor(data.length / 8)); // Show ~8 labels for 90 days
    } else if (data.length > 14) {
      optimalInterval = Math.max(1, Math.floor(data.length / 6)); // Show ~6 labels for 30 days
    } else if (data.length > 7) {
      optimalInterval = Math.max(1, Math.floor(data.length / 5)); // Show ~5 labels for 14 days
    }

    return (
      <div className="relative w-full" style={{ height: `${height + 50}px` }}>
        {/* Chart bars */}
        <div className="absolute top-0 left-0 right-0 bottom-12 flex items-end justify-between gap-0.5 sm:gap-1">
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * 100;
            const color = colors && colors[index] ? colors[index] : '#4F46E5';
            return (
              <div key={index} className="flex-1 flex flex-col items-center min-w-0 relative group">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    minHeight: value > 0 ? '4px' : '0',
                  }}
                  title={`${labels[index]}: ${value} ${value === 1 ? 'post' : 'posts'}`}
                ></div>
              </div>
            );
          })}
        </div>
        {/* Labels row - separated to prevent overlap */}
        <div className="absolute bottom-0 left-0 right-0 h-12 flex items-start justify-between gap-0.5 sm:gap-1">
          {data.map((_, index) => {
            const showLabel = index % optimalInterval === 0 || index === data.length - 1;
            if (!showLabel) {
              return <div key={index} className="flex-1"></div>;
            }
            return (
              <div key={index} className="flex-1 flex justify-center min-w-0">
                <span 
                  className="text-[9px] sm:text-[10px] text-gray-600 block truncate w-full text-center"
                  title={labels[index]}
                >
                  {labels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Preparing analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 pointer-events-none -z-10"></div>
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Analytics</h1>
          <p className="mt-2 text-gray-600">Track your social media performance and insights.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalPosts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.growthRate > 0 ? '+' : ''}
                {analytics.growthRate.toFixed(1)}% growth
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Published</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.publishedPosts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalPosts > 0
                  ? ((analytics.publishedPosts / analytics.totalPosts) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.scheduledPosts}</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.totalPosts > 0
                  ? ((analytics.scheduledPosts / analytics.totalPosts) * 100).toFixed(0)
                  : 0}
                % of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 p-6 card-hover animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Posts/Day</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.averagePostsPerDay.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">Based on selected period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posts Over Time */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts Over Time</h2>
          {analytics.postsOverTime.length > 0 && analytics.postsOverTime.some((d) => d.count > 0) ? (
            <BarChart
              data={analytics.postsOverTime.map((d) => d.count)}
              labels={analytics.postsOverTime.map((d) => {
                const date = new Date(d.date);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              })}
              height={200}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p className="text-sm">No posts in this period</p>
            </div>
          )}
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h2>
          {analytics.topPlatforms.length > 0 ? (
            <div className="space-y-3">
              {analytics.topPlatforms.slice(0, 5).map((item) => {
                const IconComponent = platformIcons[item.platform];
                const color = platformColors[item.platform] || '#6B7280';
                return (
                  <div key={item.platform}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        <span className="text-sm text-gray-700 capitalize">{item.platform}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <p className="text-sm">No platform data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
