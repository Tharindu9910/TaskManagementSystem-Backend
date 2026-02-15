import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private authRepo: AuthRepository,
  ) {}
  private users: { email: string; passwordHash: string }[] = [];

  private async generateAccessToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId });
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
    const existingUser = this.users.find((user) => user.email === dto.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const newUser = {
      email: dto.email,
      passwordHash,
    };

    this.users.push(newUser);

    return { message: 'User registered successfully' };
  }

  async login(dto: LoginDto) {
    const user = this.users.find((user) => user.email === dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const token = await this.jwtService.signAsync({
    //   email: user.email,
    // });

    const accessToken = await this.generateAccessToken(user.email);
    const refreshToken = await this.generateRefreshToken(user.email);

    // store refresh token (in memory DB)
    this.authRepo.setRefreshToken(user.email, refreshToken);

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  async refreshToken(token: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const savedToken = this.authRepo.getRefreshToken(payload.sub);

      if (!savedToken || savedToken !== token) {
        throw new Error('Invalid refresh token');
      }

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
