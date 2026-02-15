import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Shape of the JWT payload we sign in login
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const options: StrategyOptions = {
      // We read JWT from HTTP-only cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          if (!req || !req.cookies) return null;
          return req.cookies['access_token'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    };

    super(options);
  }

  /**
   * Runs after token is verified.
   * Whatever we return becomes req.user
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // if (!payload?.sub) {
    //   throw new UnauthorizedException('Invalid token payload');
    // }

    return payload;
  }
}
