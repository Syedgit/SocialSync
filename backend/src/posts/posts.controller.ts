import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.postsService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.postsService.findOne(parseInt(id), userId);
  }

  @Post()
  async create(@Body() createDto: any, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.postsService.create({
      ...createDto,
      userId,
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.postsService.update(parseInt(id), userId, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    await this.postsService.delete(parseInt(id), userId);
    return { message: 'Post deleted successfully' };
  }
}

