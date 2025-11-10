import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { PostsSchedulerService } from './posts.scheduler';
import { PlatformPublisherService } from './platform-publisher.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly postsSchedulerService: PostsSchedulerService,
    private readonly platformPublisher: PlatformPublisherService,
  ) {}

  async findAllByUser(userId: number): Promise<Post[]> {
    return this.postsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['socialAccount'],
    });
  }

  async findOne(id: number, userId: number): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id, userId },
      relations: ['socialAccount'],
    });
  }

  async create(data: Partial<Post>): Promise<Post> {
    const post = this.postsRepository.create(data);
    const saved = await this.postsRepository.save(post);

    // Publish immediately if status is PUBLISHED
    if (saved.status === PostStatus.PUBLISHED && !saved.publishedAt) {
      try {
        const publishResults = await this.platformPublisher.publishPost(saved, saved.userId);
        
        // Store platform post IDs
        const platformPostIds: Record<string, string> = {};
        Object.entries(publishResults).forEach(([platform, result]) => {
          if (result.success && result.postId) {
            platformPostIds[platform] = result.postId;
          }
        });
        
        // Update post with publish results
        const updateData: any = {
          publishedAt: new Date(),
          platformPostIds: JSON.stringify(platformPostIds),
        };
        
        // Check if all platforms succeeded
        const allSucceeded = Object.values(publishResults).every((result) => result.success);
        if (!allSucceeded) {
          const someSucceeded = Object.values(publishResults).some((result) => result.success);
          if (!someSucceeded) {
            // All failed, mark as failed
            updateData.status = PostStatus.FAILED;
            this.logger.error(`Post ${saved.id} failed to publish to all platforms.`, publishResults);
          } else {
            // Partial success, still mark as published
            this.logger.warn(`Post ${saved.id} partially published. Some platforms failed.`, publishResults);
          }
        }
        
        await this.postsRepository.update(saved.id, updateData);
        saved.publishedAt = new Date(updateData.publishedAt);
        if (updateData.status) {
          saved.status = updateData.status as PostStatus;
        }
      } catch (error: any) {
        this.logger.error(`Failed to publish post ${saved.id}:`, error);
        // Mark as failed if publishing throws
        await this.postsRepository.update(saved.id, {
          status: PostStatus.FAILED,
        });
        saved.status = PostStatus.FAILED;
      }
    }

    if (saved.status === PostStatus.SCHEDULED && saved.scheduledFor) {
      await this.postsSchedulerService.schedulePost(saved);
    } else if (saved.status !== PostStatus.SCHEDULED) {
      await this.postsSchedulerService.cancelScheduledPost(saved.id);
    }

    return saved;
  }

  async update(id: number, userId: number, data: Partial<Post>): Promise<Post> {
    const existing = await this.postsRepository.findOne({ where: { id, userId } });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    await this.postsRepository.update({ id, userId }, data);
    const updated = await this.findOne(id, userId);

    if (!updated) {
      throw new NotFoundException('Post not found after update');
    }

    if (updated.status === PostStatus.PUBLISHED && !updated.publishedAt) {
      updated.publishedAt = new Date();
      await this.postsRepository.update(updated.id, {
        publishedAt: updated.publishedAt,
      });
    }

    if (updated.status === PostStatus.SCHEDULED && updated.scheduledFor) {
      await this.postsSchedulerService.schedulePost(updated);
    } else {
      await this.postsSchedulerService.cancelScheduledPost(updated.id);
    }

    return updated;
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.postsSchedulerService.cancelScheduledPost(id).catch(() => undefined);
    await this.postsRepository.delete({ id, userId });
  }
}

