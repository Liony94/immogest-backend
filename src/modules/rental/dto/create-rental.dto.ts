import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsDate, IsEnum, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { RentalType } from '../../../entities/enums/rentals/rental-type.enum';
import { UsageType } from '../../../entities/enums/rentals/usage-type.enum';
import { PaymentFrequency } from '../../../entities/enums/rentals/payment-frequency.enum';
import { PaymentType } from '../../../entities/enums/rentals/payment-type.enum';
import { ChargeType } from '../../../entities/enums/rentals/charge-type.enum';

export class CreateRentalDto {
  // Informations générales
  @IsNotEmpty()
  @IsNumber()
  propertyId: number;

  @IsNotEmpty()
  @IsNumber()
  tenantId: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(RentalType)
  type: RentalType;

  @IsNotEmpty()
  @IsEnum(UsageType)
  usage: UsageType;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  tacitRenewal?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  furniture?: string[];

  // Paiement
  @IsNotEmpty()
  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency = PaymentFrequency.MONTHLY;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: PaymentType = PaymentType.IN_ADVANCE;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(31)
  paymentDay: number = 1;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rentVatRate?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  charges?: number = 0;

  @IsOptional()
  @IsEnum(ChargeType)
  chargeType?: ChargeType = ChargeType.PROVISION;

  @IsOptional()
  @IsNumber()
  @Min(0)
  chargesVatRate?: number = 0;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  deposit: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  housingBenefit?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  latePaymentFee?: number = 0;

  // Révision de loyer
  @IsOptional()
  @IsBoolean()
  rentRevisionEnabled?: boolean = true;

  @IsOptional()
  @IsString()
  rentRevisionIndex?: string = 'IRL';

  @IsOptional()
  @IsNumber()
  @Min(1)
  rentRevisionPeriod?: number = 12;

  // Encadrement des loyers
  @IsOptional()
  @IsBoolean()
  rentControlEnabled?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  referenceRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rentSupplement?: number;

  @IsOptional()
  @IsString()
  rentSupplementJustification?: string;

  // Travaux
  @IsOptional()
  @IsNumber()
  @Min(0)
  ownerWorkAmount?: number = 0;

  @IsOptional()
  @IsString()
  ownerWorkDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tenantWorkAmount?: number = 0;

  @IsOptional()
  @IsString()
  tenantWorkDescription?: string;

  // Informations complémentaires
  @IsOptional()
  @IsString()
  specialConditions?: string;

  @IsOptional()
  @IsString()
  specialClauses?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  // Facturation
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  billingDay?: number = 1;

  @IsOptional()
  @IsBoolean()
  separateBillingAddress?: boolean = false;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  documentTitle?: string = 'Quittance';

  @IsOptional()
  @IsBoolean()
  automaticNumbering?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeNoticeSecondPage?: boolean = false;

  @IsOptional()
  @IsString()
  receiptText?: string;

  @IsOptional()
  @IsString()
  noticeText?: string;

  // Notifications
  @IsOptional()
  @IsBoolean()
  notifyOwner?: boolean = true;

  @IsOptional()
  @IsBoolean()
  notifyTenant?: boolean = true;

  @IsOptional()
  @IsBoolean()
  notifyContractEnd?: boolean = true;

  // État des lieux
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkInDate?: Date;

  @IsOptional()
  @IsString()
  checkInNotes?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  checkOutDate?: Date;

  @IsOptional()
  @IsString()
  checkOutNotes?: string;

  // Autres propriétés
  @IsOptional()
  @IsString()
  balanceReportType?: string = 'manual';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
} 