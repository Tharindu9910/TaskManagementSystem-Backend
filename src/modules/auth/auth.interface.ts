export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
}
