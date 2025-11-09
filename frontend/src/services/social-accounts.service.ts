import api from './api';

export interface SocialAccount {
  id: string | number;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'pinterest' | 'youtube';
  platformAccountId: string;
  platformAccountName: string;
  platformAccountUsername?: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const socialAccountsService = {
  async getAll(): Promise<SocialAccount[]> {
    const response = await api.get<SocialAccount[]>('/social-accounts');
    return response.data;
  },

  async getOne(id: string): Promise<SocialAccount> {
    const response = await api.get<SocialAccount>(`/social-accounts/${id}`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/social-accounts/${id}`);
  },
};

