import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Manage All Your Social Media
          <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
            In One Place
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Schedule posts, manage multiple accounts, and grow your social media presence with SocialSync.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
          <Link
            to="/signup"
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 transition-all duration-200 transform active:scale-95 text-center touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 bg-white text-gray-700 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors text-center touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

