import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    const userData = await this.usersService.findOne(user.userId);
    if (!userData) {
      return null;
    }
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      emailVerified: userData.emailVerified,
    };
  }
}
