import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { PostsSchedulerService } from './posts.scheduler';
import { PlatformPublisherService } from './platform-publisher.service';
import { SocialAccount } from '../social-accounts/entities/social-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, SocialAccount]), ConfigModule],
  controllers: [PostsController],
  providers: [PostsService, PostsSchedulerService, PlatformPublisherService],
  exports: [PostsService, PostsSchedulerService],
})
export class PostsModule {}

