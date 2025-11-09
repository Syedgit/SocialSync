import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
    console.log('[JwtStrategy] initialized. Secret:', process.env.JWT_SECRET || 'your-secret-key');
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] validate payload received', payload);
    const userId = typeof payload.sub === 'string' ? parseInt(payload.sub) : payload.sub;
    const user = await this.authService.validateUser(userId);
    if (!user) {
      console.warn('JWT validation failed: user not found', { payload, userId });
      throw new UnauthorizedException(`User not found for id ${userId}`);
    }
    console.log('[JwtStrategy] validate success for user', { id: user.id, email: user.email });
    return { userId: user.id, email: user.email };
  }
}

