import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AIService } from './ai.service';

interface GeneratePostDto {
  prompt: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'humorous';
  platforms?: string[];
}

interface SuggestHashtagsDto {
  content: string;
  platform?: string;
}

interface RewriteContentDto {
  content: string;
  tone: 'professional' | 'casual' | 'friendly' | 'humorous';
  platform?: string;
}

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate-post')
  async generatePost(@Body() dto: GeneratePostDto) {
    try {
      const variations = await this.aiService.generatePost(
        dto.prompt,
        dto.tone || 'friendly',
        dto.platforms || [],
      );
      return {
        success: true,
        variations,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to generate post',
      };
    }
  }

  @Post('suggest-hashtags')
  async suggestHashtags(@Body() dto: SuggestHashtagsDto) {
    try {
      const hashtags = await this.aiService.suggestHashtags(dto.content, dto.platform || 'instagram');
      return {
        success: true,
        hashtags,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to suggest hashtags',
      };
    }
  }

  @Post('rewrite')
  async rewriteContent(@Body() dto: RewriteContentDto) {
    try {
      const rewritten = await this.aiService.rewriteContent(dto.content, dto.tone, dto.platform);
      return {
        success: true,
        content: rewritten,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to rewrite content',
      };
    }
  }
}

