import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postsService, CreatePostData } from '../services/posts.service';
import { socialAccountsService, SocialAccount } from '../services/social-accounts.service';
import { aiService } from '../services/ai.service';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedInIcon,
  TikTokIcon,
  PinterestIcon,
  YouTubeIcon,
} from '../components/SocialMediaIcons';
import AIPostGenerator from '../components/AIPostGenerator';

const platformConfig = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E4405F' },
  { id: 'twitter', name: 'Twitter/X', icon: TwitterIcon, color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, color: '#0A66C2' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: '#BD081C' },
  { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '#FF0000' },
];

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function CreatePostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postType, setPostType] = useState<'now' | 'schedule'>('now');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const postIdParam = searchParams.get('postId');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePostData>({
    defaultValues: {
      content: '',
      platforms: [],
    },
  });

  const content = watch('content');

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (postIdParam) {
      initializeForEdit(postIdParam);
    }
  }, [postIdParam]);

  // Cleanup media previews on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach((mf) => {
        // Only revoke blob URLs, not data URLs
        if (mf.preview.startsWith('blob:')) {
          URL.revokeObjectURL(mf.preview);
        }
      });
    };
  }, [mediaFiles]);

  const loadAccounts = async () => {
    try {
      const accounts = await socialAccountsService.getAll();
      setConnectedAccounts(accounts);
      if (!postIdParam) {
        const availablePlatforms = accounts.map((acc) => acc.platform);
        setSelectedPlatforms(availablePlatforms);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const initializeForEdit = async (postId: string) => {
    try {
      setIsLoading(true);
      const post = await postsService.getOne(postId);
      setIsEditing(true);

      setValue('content', post.content);

      const platforms = Array.isArray(post.platforms)
        ? (post.platforms as string[])
        : typeof post.platforms === 'string'
        ? safeParseArray(post.platforms)
        : [];
      setSelectedPlatforms(platforms);

      if (post.status === 'scheduled' && post.scheduledFor) {
        setPostType('schedule');
        setValue('scheduledFor', formatDatetimeLocal(post.scheduledFor));
      } else {
        setPostType('now');
      }

      const media = Array.isArray(post.mediaUrls)
        ? (post.mediaUrls as string[])
        : typeof post.mediaUrls === 'string'
        ? safeParseArray(post.mediaUrls)
        : [];
      setExistingMediaUrls(media);
    } catch (error) {
      console.error('Failed to load post for editing:', error);
      alert('Unable to load the post for editing.');
      navigate('/dashboard/posts');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaFiles((prev) => [
            ...prev,
            {
              file,
              preview: e.target?.result as string,
              type: 'image',
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setMediaFiles((prev) => [
            ...prev,
            {
              file,
              preview: e.target?.result as string,
              type: 'video',
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        alert(`File type ${file.type} is not supported. Please upload images or videos.`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const onSubmit = async (data: CreatePostData) => {
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setIsLoading(true);
    try {
      // Convert media files to URLs (in production, upload to cloud storage first)
      const mediaUrls = mediaFiles.map((mf) => mf.preview);

      const postData: CreatePostData = {
        content: data.content,
        platforms: selectedPlatforms,
        status: postType === 'now' ? 'published' : 'scheduled',
        mediaUrls: [...existingMediaUrls, ...mediaUrls].length > 0 ? [...existingMediaUrls, ...mediaUrls] : undefined,
      };

      if (postType === 'schedule' && data.scheduledFor) {
        postData.scheduledFor = new Date(data.scheduledFor).toISOString();
      }

      if (isEditing && postIdParam) {
        await postsService.update(postIdParam, postData);
      } else {
        await postsService.create(postData);
      }
      navigate('/dashboard/posts');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find((acc) => acc.platform === platformId);
  };

  const handleAISelect = (generatedContent: string) => {
    setValue('content', generatedContent);
    // Hashtags will be suggested automatically via useEffect
  };

  useEffect(() => {
    if (!content || content.length < 10 || selectedPlatforms.length === 0) {
      setSuggestedHashtags([]);
      return;
    }

    // Debounce hashtag suggestions
    const timeoutId = setTimeout(async () => {
      setIsLoadingHashtags(true);
      try {
        const primaryPlatform = selectedPlatforms[0] || 'instagram';
        const hashtags = await aiService.suggestHashtags({
          content,
          platform: primaryPlatform,
        });
        setSuggestedHashtags(hashtags);
      } catch (err: any) {
        // Don't show error for hashtag suggestions (non-critical)
        setSuggestedHashtags([]);
      } finally {
        setIsLoadingHashtags(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [content, selectedPlatforms]);

  const addHashtagsToContent = (hashtags: string[]) => {
    const currentContent = content || '';
    const hashtagString = hashtags.map((h) => `#${h}`).join(' ');
    setValue('content', `${currentContent}\n\n${hashtagString}`);
    setSuggestedHashtags([]);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing
              ? 'Update your post content, schedule, and platforms.'
              : 'Write and schedule posts for your connected social media accounts.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Post Type Selection */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Post Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPostType('now')}
                className={`relative px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  postType === 'now'
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold">Post Now</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Publish immediately</div>
              </button>
              <button
                type="button"
                onClick={() => setPostType('schedule')}
                className={`relative px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  postType === 'schedule'
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">Schedule</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Schedule for later</div>
              </button>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Select Platforms
              <span className="ml-2 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                {selectedPlatforms.length} selected
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {platformConfig.map((platform) => {
                const isConnected = Boolean(getConnectedAccount(platform.id));
                const isSelected = selectedPlatforms.includes(platform.id);
                const IconComponent = platform.icon;

                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => togglePlatform(platform.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    } ${!isConnected ? 'opacity-70' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`p-2 rounded-lg transition-transform duration-200 ${
                          isSelected ? 'scale-110' : 'group-hover:scale-105'
                        }`}
                        style={{ color: isSelected ? platform.color : '#6B7280' }}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className={`text-xs font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {platform.name}
                      </div>
                    </div>
                    {!isConnected && (
                      <div className="absolute top-1 right-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px] font-semibold">
                        For Testing
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedPlatforms.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Select at least one platform (connections optional while testing — posts will stay within SocialSync).
                </p>
              </div>
            )}
            <div className="mt-3 text-xs text-gray-500 leading-relaxed">
              You can select platforms even if accounts aren’t connected. This is for testing the scheduler and content flows — external publishing will only work after real OAuth connections are set up.
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                Post Content
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Generate
                </button>
                {content && content.length > 10 && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const rewritten = await aiService.rewriteContent({
                          content,
                          tone: 'friendly',
                        });
                        setValue('content', rewritten);
                      } catch (error) {
                        console.error('Failed to rewrite content:', error);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-indigo-300 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-50 transition-all duration-200"
                    title="Improve with AI"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Improve
                  </button>
                )}
              </div>
            </div>
            <textarea
              id="content"
              {...register('content', { required: 'Content is required', minLength: 1 })}
              rows={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              placeholder="What's on your mind? Share your thoughts... Or click 'AI Generate' to create content instantly!"
            />
            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{content?.length || 0} characters</span>
              </div>
              {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
            </div>

            {/* AI Hashtag Suggestions */}
            {(suggestedHashtags.length > 0 || isLoadingHashtags) && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">AI Hashtag Suggestions</span>
                  </div>
                  {isLoadingHashtags && (
                    <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                {suggestedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestedHashtags.map((hashtag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          const currentContent = content || '';
                          const hashtagText = currentContent.includes(`#${hashtag}`) ? '' : `#${hashtag} `;
                          setValue('content', currentContent + hashtagText);
                        }}
                        className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                      >
                        #{hashtag}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => addHashtagsToContent(suggestedHashtags)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Add All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Media</label>
            {existingMediaUrls.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Existing Media</h3>
                <div className="flex flex-wrap gap-3">
                  {existingMediaUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative">
                      <img src={url} alt={`Existing media ${idx + 1}`} className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => setExistingMediaUrls((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50 scale-105'
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Images and videos (Max 10MB per file)</p>
                </div>
              </div>
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {media.type === 'image' ? (
                        <img src={media.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <video src={media.preview} className="w-full h-full object-cover" controls={false} />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {media.type === 'image' ? '📷 Image' : '🎥 Video'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Date/Time */}
          {postType === 'schedule' && (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <label htmlFor="scheduledFor" className="block text-sm font-semibold text-gray-700 mb-3">
                Schedule Date & Time
              </label>
              <input
                id="scheduledFor"
                type="datetime-local"
                {...register('scheduledFor', { required: postType === 'schedule' ? 'Schedule date is required' : false })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                min={new Date().toISOString().slice(0, 16)}
              />
              {errors.scheduledFor && (
                <p className="mt-2 text-sm text-red-600">{errors.scheduledFor.message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <button
              type="button"
              onClick={() => navigate('/dashboard/posts')}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedPlatforms.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {postType === 'now' ? (isEditing ? 'Updating...' : 'Publishing...') : isEditing ? 'Updating...' : 'Scheduling...'}
                </span>
              ) : (
                isEditing ? 'Save Changes' : postType === 'now' ? 'Publish Now' : 'Schedule Post'
              )}
            </button>
          </div>
        </form>

        {/* AI Post Generator Modal */}
        {showAIGenerator && (
          <AIPostGenerator
            onSelect={handleAISelect}
            platforms={selectedPlatforms}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </div>
  );
}

function safeParseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDatetimeLocal(value: string): string {
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
}
