import { Controller, Post, Body, Get, Req, UseGuards, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: any) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { success: true };
  }

  // --- OAuth Routes (Placeholders/Implementation) ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    this.sendTokenCookieAndRedirect(res, result.tokens.accessToken);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Req() req) {
    // Initiates GitHub OAuth
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    this.sendTokenCookieAndRedirect(res, result.tokens.accessToken);
  }

  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordAuth(@Req() req) {
    // Initiates Discord OAuth
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordAuthRedirect(@Req() req, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    this.sendTokenCookieAndRedirect(res, result.tokens.accessToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    return req.user;
  }

  private sendTokenCookieAndRedirect(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });
    // Redirect to frontend app dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard`);
  }
}
