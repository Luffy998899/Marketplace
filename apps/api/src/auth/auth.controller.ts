import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser, JwtPayload } from './auth.decorators';
import { JwtAuthGuard } from './auth.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; displayName: string }) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  /** Stub Google OAuth — accepts profile from client redirect. Replace with real OAuth flow. */
  @Post('google')
  google(@Body() body: { email: string; displayName: string; googleId: string }) {
    return this.auth.loginWithGoogle(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }
}
