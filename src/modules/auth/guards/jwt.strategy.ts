import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private authService: AuthService,
  ) {
    const options: StrategyOptions = {
      // read JWT from HTTP-only cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          if (!req || !req.cookies) return null;
          return req.cookies['access_token'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    };

    super(options);
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    Logger.log(`payload.id`, payload);
    const user = this.authService.findUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      sub: user.id,
      email: user.email,
    };
  }
}
