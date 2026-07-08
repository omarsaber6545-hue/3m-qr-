import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';
import { DiscordStrategy } from './discord.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET', 'super-secret-access-token-key-change-in-production'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    ConfigModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    DiscordStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
