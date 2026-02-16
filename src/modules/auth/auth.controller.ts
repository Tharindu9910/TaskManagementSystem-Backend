import { BadRequestException, Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import express from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return { message: 'Logged in successfully' };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token missing');
    }

    const { accessToken } = await this.authService.refreshToken(refreshToken);

    // set new access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    return { message: 'Access token refreshed' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @GetUser() userEmail: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // 1️⃣ Invalidate refresh token on server
    await this.authService.logout(userEmail);

    // 2️⃣ Remove cookies from browser
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0),
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0),
    });

    return { message: 'Logged out successfully' };
  }

  //   @Post('logout')
  //   async logout(@Res({ passthrough: true }) res: express.Response) {
  //     // We overwrite the cookie with an empty string and set maxAge to 0
  //     res.cookie('access_token', '', {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'none',
  //       expires: new Date(0), // Sets the expiration to Jan 1, 1970
  //     });

  //     return { message: 'Logged out successfully' };
  //   }
}
