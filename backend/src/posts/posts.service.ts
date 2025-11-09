import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { PostsSchedulerService } from './posts.scheduler';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly postsSchedulerService: PostsSchedulerService,
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

    if (saved.status === PostStatus.PUBLISHED && !saved.publishedAt) {
      saved.publishedAt = new Date();
      await this.postsRepository.update(saved.id, {
        publishedAt: saved.publishedAt,
      });
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

