import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('OpenAI API key not found. AI features will be disabled.');
    }
  }

  async generatePost(
    prompt: string,
    tone: 'professional' | 'casual' | 'friendly' | 'humorous' = 'friendly',
    platforms: string[] = [],
  ): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const platformInstructions = this.getPlatformInstructions(platforms);
      const systemPrompt = `You are a social media content expert. Generate engaging social media posts based on user prompts.

Guidelines:
- Tone: ${tone}
- Be concise and engaging
- Use emojis sparingly but effectively
- Include a call-to-action when appropriate
${platformInstructions}

Generate 3-5 variations of the post, each optimized for different platforms or approaches.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Split content into variations (assuming they're separated by newlines or numbers)
      const variations = content
        .split(/\n\n|\d+[.)]/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .slice(0, 5);

      return variations.length > 0 ? variations : [content];
    } catch (error) {
      this.logger.error('Error generating post:', error);
      throw error;
    }
  }

  async suggestHashtags(content: string, platform: string): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const platformInstructions = this.getHashtagInstructions(platform);
      const systemPrompt = `You are a social media hashtag expert. Suggest relevant, trending hashtags for social media posts.

${platformInstructions}

Return only hashtags, separated by spaces, without # symbols. Maximum 10 hashtags.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Suggest hashtags for this post: ${content}` },
          ],
          temperature: 0.8,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const hashtags = data.choices[0]?.message?.content || '';

      // Parse hashtags from response
      const hashtagList = hashtags
        .split(/\s+|,/)
        .map((h) => h.trim().replace(/^#/, ''))
        .filter((h) => h.length > 0 && h.length <= 50)
        .slice(0, 10);

      return hashtagList;
    } catch (error) {
      this.logger.error('Error suggesting hashtags:', error);
      throw error;
    }
  }

  async rewriteContent(
    content: string,
    tone: 'professional' | 'casual' | 'friendly' | 'humorous',
    platform?: string,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const platformInstruction = platform ? `Optimize for ${platform}.` : '';
      const systemPrompt = `You are a social media content expert. Rewrite the given content in a ${tone} tone.

${platformInstruction}

Keep the core message the same, but adjust the tone and style.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Rewrite this: ${content}` },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || content;
    } catch (error) {
      this.logger.error('Error rewriting content:', error);
      throw error;
    }
  }

  private getPlatformInstructions(platforms: string[]): string {
    const instructions: Record<string, string> = {
      twitter: 'Twitter/X: Maximum 280 characters, concise, can include hashtags',
      linkedin: 'LinkedIn: Professional tone, 300-600 characters, engaging',
      facebook: 'Facebook: Conversational, 100-250 characters, friendly',
      instagram: 'Instagram: Visual-focused, can be longer, include emojis',
      tiktok: 'TikTok: Trendy, engaging, use trending language',
      pinterest: 'Pinterest: Descriptive, keyword-rich, actionable',
      youtube: 'YouTube: Engaging, descriptive, include call-to-action',
    };

    if (platforms.length === 0) {
      return 'Generate a versatile post that works across platforms.';
    }

    return platforms
      .map((p) => instructions[p.toLowerCase()] || `${p}: Engaging and platform-appropriate`)
      .join('\n');
  }

  private getHashtagInstructions(platform: string): string {
    const instructions: Record<string, string> = {
      instagram: 'Instagram: Use 5-10 hashtags, mix popular and niche hashtags',
      twitter: 'Twitter/X: Use 1-3 hashtags, trending topics',
      linkedin: 'LinkedIn: Use 3-5 professional hashtags',
      facebook: 'Facebook: Use 1-3 relevant hashtags',
      tiktok: 'TikTok: Use 3-5 trending hashtags',
      pinterest: 'Pinterest: Use 5-10 keyword-rich hashtags',
      youtube: 'YouTube: Use 3-5 descriptive hashtags',
    };

    return instructions[platform.toLowerCase()] || 'Use 5-10 relevant hashtags';
  }
}

