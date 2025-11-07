import api from './api';

export interface Post {
  id: string | number;
  content: string;
  mediaUrls?: string[] | string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor?: string;
  publishedAt?: string;
  platforms?: string[] | string;
  platformPostIds?: Record<string, string> | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  mediaUrls?: string[];
  scheduledFor?: string;
  platforms: string[];
  socialAccountId?: string;
}

export const postsService = {
  async getAll(): Promise<Post[]> {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },

  async getOne(id: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/${id}`);
    return response.data;
  },

  async create(data: CreatePostData): Promise<Post> {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await api.put<Post>(`/posts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
};

