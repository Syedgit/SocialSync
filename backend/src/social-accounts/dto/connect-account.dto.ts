import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Platform } from '../entities/social-account.entity';

export class ConnectAccountDto {
  @IsEnum(Platform)
  @IsNotEmpty()
  platform: Platform;

  @IsString()
  @IsNotEmpty()
  platformAccountId: string;

  @IsString()
  @IsNotEmpty()
  platformAccountName: string;

  @IsString()
  @IsOptional()
  platformAccountUsername?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsOptional()
  tokenExpiresAt?: Date;

  @IsOptional()
  metadata?: Record<string, any>;
}

