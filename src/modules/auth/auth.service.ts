import { Injectable, Logger } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private authRepo: AuthRepository,
  ) {}
  private users: { email: string; passwordHash: string }[] = [];

  private async generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId }, { expiresIn: '15m' });
  }
  private async generateRefreshToken(userId: string) {
    return this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = this.authRepo.findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const newUser = {
      id: randomUUID(),
      email: dto.email,
      passwordHash,
    };

    this.authRepo.createUser(newUser);

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    const user = this.authRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    // store refresh token (in memory DB)
    const refreshTokenHash = await argon2.hash(refreshToken);
    this.authRepo.setRefreshToken(user.id, refreshTokenHash);

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  findUser(userId: string) {
    const user = this.authRepo.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User Not Found');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }

  async refreshToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedHash = this.authRepo.getRefreshToken(payload.sub);
      if (!storedHash) throw new UnauthorizedException();
      const tokenMatches = await argon2.verify(storedHash, token);
      if (!tokenMatches) throw new UnauthorizedException();

      const newAccessToken = await this.generateAccessToken(payload.sub);

      return { accessToken: newAccessToken };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    this.authRepo.removeRefreshToken(userId);
    return { message: 'Logged out' };
  }
}
