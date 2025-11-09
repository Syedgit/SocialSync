import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAccount, Platform } from './entities/social-account.entity';

@Injectable()
export class SocialAccountsService {
  constructor(
    @InjectRepository(SocialAccount)
    private socialAccountsRepository: Repository<SocialAccount>,
  ) {}

  async findAllByUser(userId: number): Promise<SocialAccount[]> {
    return this.socialAccountsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<SocialAccount | null> {
    return this.socialAccountsRepository.findOne({
      where: { id, userId },
    });
  }

  async create(data: Partial<SocialAccount>): Promise<SocialAccount> {
    const account = this.socialAccountsRepository.create(data);
    return this.socialAccountsRepository.save(account);
  }

  async update(id: number, userId: number, data: Partial<SocialAccount>): Promise<SocialAccount> {
    await this.socialAccountsRepository.update({ id, userId }, data);
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.socialAccountsRepository.delete({ id, userId });
  }
}

