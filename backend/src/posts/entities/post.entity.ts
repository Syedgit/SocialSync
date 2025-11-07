import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SocialAccount } from '../../social-accounts/entities/social-account.entity';

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => SocialAccount, { nullable: true })
  @JoinColumn({ name: 'socialAccountId' })
  socialAccount: SocialAccount;

  @Column({ nullable: true })
  socialAccountId: number;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  mediaUrls: string; // JSON string array

  @Column({
    type: 'text',
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ nullable: true })
  scheduledFor: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column('text', { nullable: true })
  platforms: string; // JSON string array of platform IDs

  @Column('text', { nullable: true })
  platformPostIds: string; // JSON string: Map of platform -> post ID

  @Column('text', { nullable: true })
  metadata: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

