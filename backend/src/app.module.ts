import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SocialAccountsModule } from './social-accounts/social-accounts.module';
import { PostsModule } from './posts/posts.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    // Database module - switches between SQLite (dev) and Postgres (prod)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbType = configService.get<string>('DB_TYPE', databaseUrl ? 'postgres' : 'sqlite');
        const synchronizeEnv = configService.get<string>('DB_SYNCHRONIZE');
        const synchronize =
          typeof synchronizeEnv === 'string'
            ? synchronizeEnv.toLowerCase() === 'true'
            : nodeEnv !== 'production';
        const logging = nodeEnv === 'development';

        if (databaseUrl) {
          const sslEnabled = configService.get<string>('DB_SSL', 'false').toLowerCase() === 'true';
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize,
            logging,
            ssl: sslEnabled
              ? {
                  rejectUnauthorized: false,
                }
              : undefined,
          };
        }

        if (dbType === 'postgres') {
          const sslEnabled = configService.get<string>('DB_SSL', 'false').toLowerCase() === 'true';
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
            username: configService.get<string>('DB_USERNAME', 'postgres'),
            password: configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DB_DATABASE', 'socialsync'),
            autoLoadEntities: true,
            synchronize,
            logging,
            ssl: sslEnabled
              ? {
                  rejectUnauthorized: false,
                }
              : undefined,
          };
        }

        const sqliteDatabase = configService.get<string>('SQLITE_DATABASE', 'socialsync.db');
        return {
          type: 'sqlite',
          database: sqliteDatabase,
          autoLoadEntities: true,
          synchronize: true,
          logging,
        };
      },
    }),
    AuthModule,
    UsersModule,
    SocialAccountsModule,
    PostsModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

