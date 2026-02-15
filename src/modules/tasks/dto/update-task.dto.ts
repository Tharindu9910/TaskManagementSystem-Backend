import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
// export class UpdateTaskDto {
//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   title?: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(500)
//   description?: string;

//   @IsOptional()
//   @IsBoolean()
//   completed?: boolean;
// }

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
