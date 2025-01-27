import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRentalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  rent: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  charges?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deposit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  surface?: number;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean;

  @IsOptional()
  furniture?: string[];

  @IsNotEmpty()
  @IsNumber()
  propertyId: number;

  @IsNotEmpty()
  @IsNumber()
  tenantId: number;
} 