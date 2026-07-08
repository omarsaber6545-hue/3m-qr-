import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GithubStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientId = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');

    super({
      clientID: clientId || 'fake-github-client-id',
      clientSecret: clientSecret || 'fake-github-client-secret',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL', 'http://localhost:5000/api/auth/github/callback'),
      scope: ['user:email'],
    });

    if (!clientId || clientId === 'github-client-id-placeholder') {
      this.logger.warn('GITHUB_CLIENT_ID is not configured. GitHub OAuth will fail in execution.');
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { emails, displayName, username, id } = profile;
      const email = emails && emails[0] ? emails[0].value : `${id}@github.com`;
      const name = displayName || username || `GitHub User ${id}`;
      const user = await this.authService.validateOrCreateOAuthUser({
        email,
        name,
        providerId: id,
        provider: 'GITHUB',
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
