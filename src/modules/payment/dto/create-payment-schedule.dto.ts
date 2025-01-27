import { IsNotEmpty, IsNumber, IsDate, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentScheduleDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  monthlyAmount: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth: number;

  @IsNotEmpty()
  @IsNumber()
  rentalId: number;
} 