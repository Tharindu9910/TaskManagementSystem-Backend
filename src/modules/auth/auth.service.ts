import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  private users: { email: string; passwordHash: string }[] = [];
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

    const token = await this.jwtService.signAsync({
      email: user.email,
    });
    return { accessToken: token };
  }
}
