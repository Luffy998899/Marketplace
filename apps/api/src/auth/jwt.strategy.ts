import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from './auth.decorators';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    const user = this.auth.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { sub: user.id, email: user.email, role: user.role };
  }
}
