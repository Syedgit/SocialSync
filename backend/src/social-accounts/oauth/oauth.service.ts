import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

@Injectable()
export class OAuthService {
  constructor(private configService: ConfigService) {}

  getFacebookAuthUrl(state?: string): string {
    const clientId = this.configService.get<string>('FACEBOOK_APP_ID');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/facebook/callback`;
    
    const scope = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management';
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code${stateParam}`;
  }

  async getFacebookAccessToken(code: string): Promise<any> {
    const clientId = this.configService.get<string>('FACEBOOK_APP_ID');
    const clientSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/facebook/callback`;

    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Facebook token exchange failed: ${error.message}`);
    }
  }

  async getFacebookUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,email,picture',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Facebook user info: ${error.message}`);
    }
  }

  async getFacebookPages(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name,access_token,category,picture',
        },
      });

      return response.data.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch Facebook pages: ${error.message}`);
    }
  }

  getTwitterAuthUrl(state?: string): string {
    const clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/twitter/callback`;
    
    const scope = 'tweet.read tweet.write users.read offline.access';
    const stateParam = state || this.generateState();
    
    return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(stateParam)}&code_challenge=challenge&code_challenge_method=plain`;
  }

  async getTwitterAccessToken(code: string): Promise<any> {
    const clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/twitter/callback`;

    try {
      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: clientId,
          redirect_uri: redirectUri,
          code_verifier: 'challenge',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Twitter token exchange failed: ${error.message}`);
    }
  }

  async getTwitterUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        params: {
          'user.fields': 'id,name,username,profile_image_url',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch Twitter user info: ${error.message}`);
    }
  }

  getLinkedInAuthUrl(state?: string): string {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/linkedin/callback`;
    
    const scope = 'r_liteprofile r_emailaddress w_member_social';
    const stateParam = state || this.generateState();
    
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(stateParam)}&scope=${encodeURIComponent(scope)}`;
  }

  async getLinkedInAccessToken(code: string): Promise<any> {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID');
    const clientSecret = this.configService.get<string>('LINKEDIN_CLIENT_SECRET');
    const redirectUri = `${this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/oauth/linkedin/callback`;

    try {
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`LinkedIn token exchange failed: ${error.message}`);
    }
  }

  async getLinkedInUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch LinkedIn user info: ${error.message}`);
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

