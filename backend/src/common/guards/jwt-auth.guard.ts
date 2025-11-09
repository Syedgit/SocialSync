import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err || !user) {
      console.warn('[JwtAuthGuard] Unauthorized access', {
        error: err?.message,
        info: info?.message || info,
        status,
      });
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}

