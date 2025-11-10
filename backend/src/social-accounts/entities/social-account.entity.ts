import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { encryptionTransformer } from '../../common/security/encryption.transformer';

export enum Platform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  PINTEREST = 'pinterest',
  YOUTUBE = 'youtube',
}

@Entity('social_accounts')
export class SocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.socialAccounts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({
    type: 'text',
  })
  platform: Platform;

  @Column()
  platformAccountId: string;

  @Column()
  platformAccountName: string;

  @Column({ nullable: true })
  platformAccountUsername: string;

  @Column({ nullable: true })
  avatar: string;

  @Column('text', { nullable: true, transformer: encryptionTransformer })
  accessToken: string;

  @Column('text', { nullable: true, transformer: encryptionTransformer })
  refreshToken: string;

  @Column({ nullable: true })
  tokenExpiresAt: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  metadata: string; // JSON string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.socialAccount)
  posts: Post[];
}

