import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { AccessType } from '../../../entities/enums/properties/access-type.enum';

export class UpdatePropertyAccessDto {
  @IsOptional()
  @IsEnum(AccessType)
  type?: AccessType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
} 