import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  private readonly logger = new Logger(DiscordStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientId = configService.get<string>('DISCORD_CLIENT_ID');
    const clientSecret = configService.get<string>('DISCORD_CLIENT_SECRET');

    super({
      clientID: clientId || 'fake-discord-client-id',
      clientSecret: clientSecret || 'fake-discord-client-secret',
      callbackURL: configService.get<string>('DISCORD_CALLBACK_URL', 'http://localhost:5000/api/auth/discord/callback'),
      scope: ['identify', 'email'],
    });

    if (!clientId || clientId === 'discord-client-id-placeholder') {
      this.logger.warn('DISCORD_CLIENT_ID is not configured. Discord OAuth will fail in execution.');
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { email, username, id } = profile;
      const finalEmail = email || `${id}@discord.com`;
      const user = await this.authService.validateOrCreateOAuthUser({
        email: finalEmail,
        name: username,
        providerId: id,
        provider: 'DISCORD',
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
