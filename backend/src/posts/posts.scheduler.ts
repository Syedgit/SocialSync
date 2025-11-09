import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, QueueEvents, Worker } from 'bullmq';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';

interface PostJobData {
  postId: number;
}

interface SchedulerMetadata {
  jobId?: string;
  scheduledFor?: string | null;
  lastScheduledAt?: string;
  lastRunAt?: string;
  lastStatus?: 'scheduled' | 'published' | 'failed' | 'skipped';
  lastError?: string | null;
  lastRecoveryAt?: string;
}

@Injectable()
export class PostsSchedulerService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(PostsSchedulerService.name);
  private readonly queueName = 'scheduled-posts';
  private readonly queue?: Queue<PostJobData>;
  private readonly worker?: Worker<PostJobData>;
  private readonly queueEvents?: QueueEvents;
  private readonly isEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {
    const enabledFlag = this.configService.get<string>('ENABLE_SCHEDULER', 'true');
    this.isEnabled = enabledFlag?.toLowerCase() !== 'false';

    if (!this.isEnabled) {
      this.logger.warn('Posts scheduler is disabled via ENABLE_SCHEDULER environment variable.');
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const username = this.configService.get<string>('REDIS_USERNAME');
    const tlsEnabled = this.configService.get<string>('REDIS_TLS', 'false').toLowerCase() === 'true';

    const connection: Record<string, any> = {
      host,
      port,
      password: password || undefined,
      username: username || undefined,
    };

    if (tlsEnabled) {
      connection.tls = {
        rejectUnauthorized: false,
      };
    }

    this.queue = new Queue<PostJobData>(this.queueName, {
      connection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.worker = new Worker<PostJobData>(
      this.queueName,
      (job) => this.handleJob(job),
      {
        connection,
        concurrency: 2,
      },
    );

    this.queueEvents = new QueueEvents(this.queueName, { connection });

    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`Scheduled post job ${jobId} completed`);
    });

    this.queueEvents.on('failed', async ({ jobId, failedReason }) => {
      this.logger.error(`Scheduled post job ${jobId} failed: ${failedReason}`);
      if (jobId) {
        const postId = this.getPostIdFromJobId(jobId);
        if (postId) {
          await this.updateSchedulerMetadata(postId, {
            lastStatus: 'failed',
            lastError: failedReason,
            lastRunAt: new Date().toISOString(),
          });
        }
      }
    });

    this.worker.on('error', (error) => {
      this.logger.error('Posts scheduler worker encountered an error', error.stack);
    });
  }

  async onModuleInit() {
    if (!this.isEnabled || !this.queue) {
      return;
    }
    await this.recoverScheduledPosts();
  }

  async onModuleDestroy() {
    if (!this.isEnabled) {
      return;
    }

    await Promise.allSettled([
      this.worker?.close(),
      this.queue?.close(),
      this.queueEvents?.close(),
    ]);
  }

  async schedulePost(post: Post) {
    if (!this.isEnabled || !this.queue) {
      return;
    }
    if (!post.id || !post.scheduledFor || post.status !== PostStatus.SCHEDULED) {
      return;
    }

    const scheduledDate = this.normalizeToDate(post.scheduledFor);
    if (!scheduledDate) {
      this.logger.warn(`Post ${post.id} has invalid scheduledFor value. Skipping scheduling.`, {
        scheduledFor: post.scheduledFor,
      });
      return;
    }

    const delay = Math.max(0, scheduledDate.getTime() - Date.now());
    const jobId = this.getJobId(post.id);

    await this.queue.remove(jobId).catch(() => undefined);

    await this.queue.add(
      'publish-post',
      { postId: post.id },
      {
        jobId,
        delay,
      },
    );

    await this.updateSchedulerMetadata(post.id, {
      jobId,
      scheduledFor: scheduledDate.toISOString(),
      lastScheduledAt: new Date().toISOString(),
      lastStatus: 'scheduled',
      lastError: null,
    });

    this.logger.log(`Scheduled post ${post.id} for ${scheduledDate.toISOString()} (delay ${delay}ms)`);
  }

  async cancelScheduledPost(postId: number) {
    if (!this.isEnabled || !this.queue) {
      return;
    }
    const jobId = this.getJobId(postId);
    await this.queue.remove(jobId).catch(() => undefined);
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      return;
    }

    const metadata = this.parseMetadata(post.metadata);
    const hasExistingScheduler = Boolean(metadata.scheduler);

    if (!hasExistingScheduler) {
      return;
    }

    metadata.scheduler = {
      ...(metadata.scheduler || {}),
      jobId: undefined,
      scheduledFor: null,
      lastStatus: 'skipped',
      lastError: null,
    };

    await this.postsRepository.update(postId, {
      metadata: JSON.stringify(metadata),
    });
  }

  private async handleJob(job: Job<PostJobData>) {
    if (!this.isEnabled) {
      return;
    }
    const { postId } = job.data;
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      this.logger.warn(`Post ${postId} not found while processing scheduled job`);
      return;
    }

    if (post.status !== PostStatus.SCHEDULED) {
      this.logger.debug(`Post ${postId} is no longer scheduled. Skipping job.`);
      await this.updateSchedulerMetadata(postId, {
        lastStatus: 'skipped',
        lastRunAt: new Date().toISOString(),
        lastError: null,
      });
      return;
    }

    const now = new Date();
    const scheduledFor = post.scheduledFor ? new Date(post.scheduledFor) : null;

    if (scheduledFor && scheduledFor.getTime() > now.getTime() + 5000) {
      const delay = scheduledFor.getTime() - now.getTime();
      this.logger.debug(`Post ${postId} scheduled time is in the future. Rescheduling (delay ${delay}ms).`);
      await this.schedulePost(post);
      return;
    }

    try {
      // TODO: integrate with actual publishing to platforms
      const metadata = this.parseMetadata(post.metadata);
      metadata.scheduler = {
        ...(metadata.scheduler || {}),
        lastStatus: 'published',
        lastRunAt: now.toISOString(),
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
        jobId: this.getJobId(postId),
        lastError: null,
      } satisfies SchedulerMetadata;

      await this.postsRepository.update(postId, {
        status: PostStatus.PUBLISHED,
        publishedAt: now,
        metadata: JSON.stringify(metadata),
      });

      this.logger.log(`Post ${postId} marked as published by scheduler.`);
    } catch (error: any) {
      this.logger.error(`Failed to publish scheduled post ${postId}: ${error.message}`, error.stack);

      const metadata = this.parseMetadata(post.metadata);
      metadata.scheduler = {
        ...(metadata.scheduler || {}),
        lastStatus: 'failed',
        lastRunAt: now.toISOString(),
        scheduledFor: scheduledFor ? scheduledFor.toISOString() : null,
        jobId: this.getJobId(postId),
        lastError: error.message,
      } satisfies SchedulerMetadata;

      await this.postsRepository.update(postId, {
        status: PostStatus.FAILED,
        metadata: JSON.stringify(metadata),
      });

      throw error;
    }
  }

  private async updateSchedulerMetadata(postId: number, updates: Partial<SchedulerMetadata>) {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      return;
    }

    const metadata = this.parseMetadata(post.metadata);
    metadata.scheduler = {
      ...(metadata.scheduler || {}),
      ...updates,
    };

    await this.postsRepository.update(postId, {
      metadata: JSON.stringify(metadata),
    });
  }

  private parseMetadata(metadata?: string | null): Record<string, any> {
    if (!metadata) {
      return {};
    }
    try {
      return JSON.parse(metadata);
    } catch (error) {
      this.logger.warn('Failed to parse post metadata JSON. Resetting metadata.');
      return {};
    }
  }

  private getJobId(postId: number) {
    return `post-${postId}`;
  }

  private getPostIdFromJobId(jobId: string | null | undefined): number | null {
    if (!jobId || !jobId.startsWith('post-')) {
      return null;
    }
    const id = parseInt(jobId.split('-')[1], 10);
    return Number.isNaN(id) ? null : id;
  }

  private normalizeToDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private async recoverScheduledPosts() {
    if (!this.isEnabled || !this.queue) {
      return;
    }
    const scheduledPosts = await this.postsRepository.find({
      where: {
        status: PostStatus.SCHEDULED,
      },
      order: {
        scheduledFor: 'ASC',
      },
    });

    if (!scheduledPosts.length) {
      return;
    }

    const now = Date.now();
    const immediateThresholdMs = 5 * 60 * 1000; // 5 minutes

    for (const post of scheduledPosts) {
      if (!post.scheduledFor) {
        continue;
      }

      const scheduledTime = new Date(post.scheduledFor);
      const jobId = this.getJobId(post.id);

      await this.queue.remove(jobId).catch(() => undefined);

      if (scheduledTime.getTime() <= now) {
        const delay = Math.max(0, scheduledTime.getTime() + 2000 - now); // slight buffer

        await this.queue.add(
          'publish-post',
          { postId: post.id },
          {
            jobId,
            delay,
          },
        );

        await this.updateSchedulerMetadata(post.id, {
          jobId,
          scheduledFor: scheduledTime.toISOString(),
          lastScheduledAt: new Date().toISOString(),
          lastStatus: 'scheduled',
          lastError: null,
          lastRecoveryAt: new Date().toISOString(),
        });

        this.logger.warn(
          `Recovered overdue scheduled post ${post.id}. Queued for immediate processing (delay ${delay}ms).`,
        );
      } else if (scheduledTime.getTime() - now <= immediateThresholdMs) {
        const delay = Math.max(0, scheduledTime.getTime() - now);

        await this.queue.add(
          'publish-post',
          { postId: post.id },
          {
            jobId,
            delay,
          },
        );

        await this.updateSchedulerMetadata(post.id, {
          jobId,
          scheduledFor: scheduledTime.toISOString(),
          lastScheduledAt: new Date().toISOString(),
          lastStatus: 'scheduled',
          lastError: null,
          lastRecoveryAt: new Date().toISOString(),
        });

        this.logger.log(`Recovered scheduled post ${post.id} due soon. Rescheduled with delay ${delay}ms.`);
      } else {
        await this.schedulePost(post);
        await this.updateSchedulerMetadata(post.id, {
          lastRecoveryAt: new Date().toISOString(),
        });
        this.logger.log(`Recovered scheduled post ${post.id} for ${scheduledTime.toISOString()}.`);
      }
    }
  }
}
