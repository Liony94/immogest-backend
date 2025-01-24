import { IsNotEmpty, IsNumber, IsDate, Min, IsInt, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentScheduleDto {
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  monthlyAmount: number;

  @IsInt()
  @Min(1)
  @Max(31)
  @IsNotEmpty()
  dayOfMonth: number;

  @IsNumber()
  @IsNotEmpty()
  propertyId: number;

  @IsNumber()
  @IsNotEmpty()
  tenantId: number;
} 