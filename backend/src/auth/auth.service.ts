import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * Registers a new user with standard email/password credentials.
   */
  async register(data: any): Promise<any> {
    const { email, password, name } = data;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        provider: 'LOCAL',
      },
    });

    return this.login(user);
  }

  /**
   * Validates standard user login.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...result } = user;
    return result;
  }

  /**
   * Signs a user in, returning tokens and basic info.
   */
  async login(user: any): Promise<any> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Refresh access token using valid refresh token.
   */
  async refreshToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid user context');
      }

      return this.login(user);
    } catch (err) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
  }

  /**
   * OAuth integration fallback. Creates/finds user based on provider key.
   */
  async validateOrCreateOAuthUser(profile: { email: string; name: string; providerId: string; provider: 'GOOGLE' | 'GITHUB' | 'DISCORD' }): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          provider: profile.provider,
          providerId: profile.providerId,
          credits: 10, // Initial sign up credits
        },
      });
    } else {
      // Update provider identity
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      });
    }

    return user;
  }
}
