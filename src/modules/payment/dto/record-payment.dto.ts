import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class RecordPaymentDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
} 