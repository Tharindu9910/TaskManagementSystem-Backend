import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
