import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    super({
      clientID: clientId || 'fake-google-client-id',
      clientSecret: clientSecret || 'fake-google-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/auth/google/callback'),
      scope: ['email', 'profile'],
    });

    if (!clientId || clientId === 'google-client-id-placeholder') {
      this.logger.warn('GOOGLE_CLIENT_ID is not configured. Google OAuth will fail in execution.');
    }
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const { emails, displayName, id } = profile;
      const email = emails && emails[0] ? emails[0].value : `${id}@google.com`;
      const user = await this.authService.validateOrCreateOAuthUser({
        email,
        name: displayName,
        providerId: id,
        provider: 'GOOGLE',
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
