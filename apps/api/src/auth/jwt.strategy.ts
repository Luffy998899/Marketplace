import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { getJwtSecret } from '../config/env';
import { SESSION_COOKIE } from './cookie.util';
import type { JwtPayload } from './auth.decorators';
import { AuthService } from './auth.service';

function extractJwt(req: Request): string | null {
  if (req?.cookies?.[SESSION_COOKIE]) {
    return req.cookies[SESSION_COOKIE] as string;
  }
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => extractJwt(req)]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    const user = this.auth.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { sub: user.id, email: user.email, role: user.role };
  }
}
