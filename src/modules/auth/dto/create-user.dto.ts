
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from 'src/common/types';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Le rôle doit être soit "owner" soit "tenant"' })
  role: UserRole;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
