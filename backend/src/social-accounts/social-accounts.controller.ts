import { Controller, Get, Post, Delete, Param, Body, UseGuards, Query, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialAccountsService } from './social-accounts.service';
import { OAuthService } from './oauth/oauth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectAccountDto } from './dto/connect-account.dto';
import { Platform } from './entities/social-account.entity';
import { JwtService } from '@nestjs/jwt';

@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.socialAccountsService.findAllByUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    return this.socialAccountsService.findOne(parseInt(id), userId);
  }

  @Get('oauth/:platform/auth-url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl(@Param('platform') platform: string, @CurrentUser() user: any) {
    let authUrl: string;

    // Include user ID in state for callback
    let statePayload: { userId: number; platform: string; codeVerifier?: string } = {
      userId: user.userId,
      platform,
    };

    switch (platform) {
      case 'facebook':
        authUrl = this.oauthService.getFacebookAuthUrl(this.jwtService.sign(statePayload, { expiresIn: '10m' }));
        break;
      case 'twitter':
        // Generate codeVerifier first (without state to get verifier)
        const tempTwitterAuth = this.oauthService.getTwitterAuthUrl();
        // Store codeVerifier in state for later retrieval
        statePayload.codeVerifier = tempTwitterAuth.codeVerifier;
        const twitterState = this.jwtService.sign(statePayload, { expiresIn: '10m' });
        // Generate auth URL with state and reuse the codeVerifier
        const finalTwitterAuth = this.oauthService.getTwitterAuthUrl(twitterState, tempTwitterAuth.codeVerifier);
        authUrl = finalTwitterAuth.authUrl;
        break;
      case 'linkedin':
        authUrl = this.oauthService.getLinkedInAuthUrl(this.jwtService.sign(statePayload, { expiresIn: '10m' }));
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return { authUrl };
  }

  @Get('oauth/:platform/callback')
  async handleOAuthCallback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    // Get frontend URL with fallback
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const frontendUrls = this.configService.get<string>('FRONTEND_URLS') || frontendUrl;
    const firstFrontendUrl = frontendUrls.split(',')[0].trim();

    // Handle OAuth errors
    if (error) {
      return res.redirect(
        `${firstFrontendUrl}/dashboard/accounts?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || 'Authorization failed')}`
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${firstFrontendUrl}/dashboard/accounts?error=missing_parameters&error_description=${encodeURIComponent('Missing authorization code or state')}`
      );
    }

    // Decode state to get user ID
    let userId: number;
    let codeVerifier: string | undefined;
    try {
      const decoded = this.jwtService.verify(state);
      userId = parseInt(decoded.userId);
      codeVerifier = decoded.codeVerifier;
    } catch (error) {
      return res.redirect(
        `${firstFrontendUrl}/dashboard/accounts?error=invalid_state&error_description=${encodeURIComponent('Invalid or expired state parameter')}`
      );
    }

    try {
      let accountData: any;

      switch (platform) {
        case 'facebook':
          const fbTokenData = await this.oauthService.getFacebookAccessToken(code);
          const fbUserInfo = await this.oauthService.getFacebookUserInfo(fbTokenData.access_token);
          const fbPages = await this.oauthService.getFacebookPages(fbTokenData.access_token);

          accountData = {
            platform: Platform.FACEBOOK,
            platformAccountId: fbUserInfo.id,
            platformAccountName: fbUserInfo.name,
            platformAccountUsername: fbUserInfo.email,
            avatar: fbUserInfo.picture?.data?.url,
            accessToken: fbTokenData.access_token,
            refreshToken: fbTokenData.access_token,
            isVerified: true,
            metadata: JSON.stringify({
              pages: fbPages,
              email: fbUserInfo.email,
            }),
          };
          break;

        case 'twitter':
          if (!codeVerifier) {
            throw new Error('Code verifier missing for Twitter OAuth');
          }
          const twitterTokenData = await this.oauthService.getTwitterAccessToken(code, codeVerifier);
          const twitterUserInfo = await this.oauthService.getTwitterUserInfo(twitterTokenData.access_token);

          accountData = {
            platform: Platform.TWITTER,
            platformAccountId: twitterUserInfo.id,
            platformAccountName: twitterUserInfo.name,
            platformAccountUsername: twitterUserInfo.username,
            avatar: twitterUserInfo.profile_image_url,
            accessToken: twitterTokenData.access_token,
            refreshToken: twitterTokenData.refresh_token,
            tokenExpiresAt: twitterTokenData.expires_in
              ? new Date(Date.now() + twitterTokenData.expires_in * 1000)
              : null,
            isVerified: true,
            metadata: JSON.stringify({
              email: twitterUserInfo.email,
            }),
          };
          break;

        case 'linkedin':
          const linkedInTokenData = await this.oauthService.getLinkedInAccessToken(code);
          const linkedInUserInfo = await this.oauthService.getLinkedInUserInfo(linkedInTokenData.access_token);

          accountData = {
            platform: Platform.LINKEDIN,
            platformAccountId: linkedInUserInfo.sub,
            platformAccountName: linkedInUserInfo.name || linkedInUserInfo.email,
            platformAccountUsername: linkedInUserInfo.email,
            avatar: linkedInUserInfo.picture,
            accessToken: linkedInTokenData.access_token,
            refreshToken: linkedInTokenData.refresh_token,
            tokenExpiresAt: linkedInTokenData.expires_in
              ? new Date(Date.now() + linkedInTokenData.expires_in * 1000)
              : null,
            isVerified: true,
            metadata: JSON.stringify({
              email: linkedInUserInfo.email,
            }),
          };
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Check if account already exists
      const existingAccounts = await this.socialAccountsService.findAllByUser(userId);
      const duplicate = existingAccounts.find(
        (acc) => acc.platform === accountData.platform && acc.platformAccountId === accountData.platformAccountId,
      );

      if (duplicate) {
        // Update existing account
        await this.socialAccountsService.update(duplicate.id, userId, accountData);
      } else {
        // Create new account
        await this.socialAccountsService.create({
          ...accountData,
          userId,
        });
      }

      // Redirect to frontend accounts page with success
      return res.redirect(
        `${firstFrontendUrl}/dashboard/accounts?success=true&platform=${platform}`
      );
    } catch (error: any) {
      console.error(`OAuth callback error for ${platform}:`, error.message);
      return res.redirect(
        `${firstFrontendUrl}/dashboard/accounts?error=connection_failed&error_description=${encodeURIComponent(error.message || 'Failed to connect account')}`
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: ConnectAccountDto, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    const accountData: any = {
      ...createDto,
      userId,
    };
    // Convert metadata to JSON string if present
    if (accountData.metadata && typeof accountData.metadata === 'object') {
      accountData.metadata = JSON.stringify(accountData.metadata);
    }
    return this.socialAccountsService.create(accountData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    const userId = typeof user.userId === 'string' ? parseInt(user.userId) : user.userId;
    await this.socialAccountsService.delete(parseInt(id), userId);
    return { message: 'Account disconnected successfully' };
  }
}
