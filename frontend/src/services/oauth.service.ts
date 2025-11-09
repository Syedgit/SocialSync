import api from './api';

export const oauthService = {
  async getAuthUrl(platform: string): Promise<string> {
    const response = await api.get<{ authUrl: string }>(`/social-accounts/oauth/${platform}/auth-url`);
    return response.data.authUrl;
  },
};

