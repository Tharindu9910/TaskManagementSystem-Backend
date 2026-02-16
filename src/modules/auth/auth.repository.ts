import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthRepository {
  // userId -> refreshToken
  private refreshTokens = new Map<string, string>();

  setRefreshToken(userId: string, token: string) {
    this.refreshTokens.set(userId, token);
  }

  getRefreshToken(userId: string): string | undefined {
    return this.refreshTokens.get(userId);
  }

  removeRefreshToken(userId: string) {
    this.refreshTokens.delete(userId);
  }
}
