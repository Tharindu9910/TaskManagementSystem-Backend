import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4, { message: 'Password must be at least 6 characters' })
  @MaxLength(64, { message: 'Password too long' })
  // @Matches(
  //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/,
  //   { message: 'Password must contain at least one letter and one number' },
  // )
  password: string;
}
