import api from './api';

export interface GeneratePostRequest {
  prompt: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'humorous';
  platforms?: string[];
}

export interface SuggestHashtagsRequest {
  content: string;
  platform?: string;
}

export interface RewriteContentRequest {
  content: string;
  tone: 'professional' | 'casual' | 'friendly' | 'humorous';
  platform?: string;
}

export const aiService = {
  async generatePost(request: GeneratePostRequest) {
    const response = await api.post<{ success: boolean; variations?: string[]; error?: string }>(
      '/ai/generate-post',
      request,
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate post');
    }
    return response.data.variations || [];
  },

  async suggestHashtags(request: SuggestHashtagsRequest) {
    const response = await api.post<{ success: boolean; hashtags?: string[]; error?: string }>(
      '/ai/suggest-hashtags',
      request,
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to suggest hashtags');
    }
    return response.data.hashtags || [];
  },

  async rewriteContent(request: RewriteContentRequest) {
    const response = await api.post<{ success: boolean; content?: string; error?: string }>(
      '/ai/rewrite',
      request,
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to rewrite content');
    }
    return response.data.content || '';
  },
};

