import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Post } from './entities/post.entity';
import { SocialAccount, Platform } from '../social-accounts/entities/social-account.entity';
import { encryptionTransformer } from '../common/security/encryption.transformer';

@Injectable()
export class PlatformPublisherService {
  private readonly logger = new Logger(PlatformPublisherService.name);

  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountsRepository: Repository<SocialAccount>,
  ) {}

  async publishPost(post: Post, userId: number): Promise<Record<string, { success: boolean; postId?: string; error?: string }>> {
    const results: Record<string, { success: boolean; postId?: string; error?: string }> = {};

    if (!post.platforms) {
      this.logger.warn(`Post ${post.id} has no platforms specified`);
      return results;
    }

    // Parse platforms (could be array or JSON string)
    let platforms: string[] = [];
    try {
      if (Array.isArray(post.platforms)) {
        platforms = post.platforms;
      } else if (typeof post.platforms === 'string') {
        platforms = JSON.parse(post.platforms);
      }
    } catch (error) {
      this.logger.error(`Failed to parse platforms for post ${post.id}:`, error);
      return results;
    }

    // Get connected accounts for this user and platforms
    const accounts = await this.socialAccountsRepository.find({
      where: {
        userId,
        platform: platforms as any,
        isActive: true,
        isVerified: true,
      },
    });

    // Publish to each platform
    for (const platform of platforms) {
      const account = accounts.find((acc) => acc.platform === platform);
      if (!account) {
        results[platform] = {
          success: false,
          error: `No active ${platform} account connected`,
        };
        continue;
      }

      try {
        const result = await this.publishToPlatform(post, account);
        results[platform] = result;
      } catch (error: any) {
        this.logger.error(`Failed to publish to ${platform} for post ${post.id}:`, error);
        results[platform] = {
          success: false,
          error: error.message || 'Unknown error',
        };
      }
    }

    return results;
  }

  private async publishToPlatform(
    post: Post,
    account: SocialAccount,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    switch (account.platform) {
      case Platform.TWITTER:
        return await this.publishToTwitter(post, account);
      case Platform.FACEBOOK:
        return await this.publishToFacebook(post, account);
      case Platform.LINKEDIN:
        return await this.publishToLinkedIn(post, account);
      default:
        return {
          success: false,
          error: `Publishing to ${account.platform} is not yet implemented`,
        };
    }
  }

  private async publishToTwitter(
    post: Post,
    account: SocialAccount,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Decrypt access token
      const accessToken = account.accessToken
        ? encryptionTransformer.from(account.accessToken)
        : null;

      if (!accessToken) {
        return {
          success: false,
          error: 'No access token available',
        };
      }

      // Parse media URLs if present
      let mediaIds: string[] = [];
      if (post.mediaUrls) {
        try {
          const mediaUrls = Array.isArray(post.mediaUrls)
            ? post.mediaUrls
            : JSON.parse(post.mediaUrls);
          
          // Upload media and get media IDs (simplified - in production, you'd upload each media file)
          // For now, we'll skip media upload and just post text
          // TODO: Implement media upload to Twitter API
          if (mediaUrls && mediaUrls.length > 0) {
            this.logger.warn('Media upload not yet implemented for Twitter');
          }
        } catch (error) {
          this.logger.warn('Failed to parse media URLs for Twitter post');
        }
      }

      // Create tweet using Twitter API v2
      const tweetData: any = {
        text: post.content,
      };

      // Add media if available (after implementing media upload)
      if (mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds,
        };
      }

      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.data?.id) {
        this.logger.log(`Successfully published tweet ${response.data.data.id} for post ${post.id}`);
        return {
          success: true,
          postId: response.data.data.id,
        };
      }

      return {
        success: false,
        error: 'No tweet ID in response',
      };
    } catch (error: any) {
      this.logger.error(`Twitter API error:`, error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to publish to Twitter',
      };
    }
  }

  private async publishToFacebook(
    post: Post,
    account: SocialAccount,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    // TODO: Implement Facebook publishing
    return {
      success: false,
      error: 'Facebook publishing not yet implemented',
    };
  }

  private async publishToLinkedIn(
    post: Post,
    account: SocialAccount,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    // TODO: Implement LinkedIn publishing
    return {
      success: false,
      error: 'LinkedIn publishing not yet implemented',
    };
  }
}

