import { Injectable } from '@nestjs/common';
import { User } from './auth.interface';

@Injectable()
export class AuthRepository {
  private refreshTokens = new Map<string, string>();
  private users: User[] = [];

  createUser(user: User) {
    this.users.push(user);
    return user;
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  deleteUser(userId: string) {
    this.users = this.users.filter((u) => u.id !== userId);
    this.refreshTokens.delete(userId);
  }

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
