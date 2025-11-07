import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
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
    return this.postsRepository.save(post);
  }

  async update(id: number, userId: number, data: Partial<Post>): Promise<Post> {
    await this.postsRepository.update({ id, userId }, data);
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.postsRepository.delete({ id, userId });
  }
}

