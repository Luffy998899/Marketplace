import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { clearSessionCookie, setSessionCookie } from './cookie.util';
import { CurrentUser, JwtPayload } from './auth.decorators';
import { JwtAuthGuard } from './auth.guards';
import { GoogleAuthDto, LoginDto, RegisterDto } from '../dto/auth.dto';
import { KycService } from '../kyc/kyc.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly kyc: KycService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.register(body);
    setSessionCookie(res, tokens.accessToken);
    return { user: tokens.user, expiresIn: tokens.expiresIn };
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(body.email, body.password);
    setSessionCookie(res, tokens.accessToken);
    return { user: tokens.user, expiresIn: tokens.expiresIn };
  }

  @Post('google')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async google(@Body() body: GoogleAuthDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.loginWithGoogle(body);
    setSessionCookie(res, tokens.accessToken);
    return { user: tokens.user, expiresIn: tokens.expiresIn };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }

  @Post('become-creator')
  @UseGuards(JwtAuthGuard)
  becomeCreator(@CurrentUser() user: JwtPayload) {
    if (!this.kyc.isApproved(user.sub)) {
      throw new ForbiddenException('Complete identity verification (KYC) before becoming a creator');
    }
    return this.auth.becomeCreator(user.sub);
  }

  @Post('become-freelancer')
  @UseGuards(JwtAuthGuard)
  becomeFreelancer(@CurrentUser() user: JwtPayload) {
    if (!this.kyc.isApproved(user.sub)) {
      throw new ForbiddenException('Complete identity verification (KYC) before becoming a freelancer');
    }
    return this.auth.becomeFreelancer(user.sub);
  }
}
