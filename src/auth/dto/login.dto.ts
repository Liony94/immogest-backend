import { IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../common/types';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
} 