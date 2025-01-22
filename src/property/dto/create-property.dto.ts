import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, IsDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PropertyType } from '../../entities/enums/property-type.enum';
import { BuildingType, BuildingLegalStatus } from '../../entities/enums/building-type.enum';
import { PropertyTaxRegime } from '../../entities/enums/property-tax-regime.enum';
import { VisibilityStatus } from '../../entities/enums/visibility-status.enum';

// Fonction utilitaire pour convertir les chaînes en nombres décimaux
const toDecimal = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const strValue = String(value).replace(',', '.');
  const num = parseFloat(strValue);
  return isNaN(num) ? 0 : num;
};

export class CreatePropertyDto {
  // Informations générales
  @IsString()
  identifier: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsEnum(PropertyType)
  type: PropertyType;

  // Adresse
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  staircase?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsString()
  city: string;

  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  country: string;

  // Informations locatives
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  rentExcludingCharges: number;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  charges?: number;

  @IsOptional()
  @IsString()
  paymentFrequency?: string;

  // Description physique
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  surface: number;

  @IsOptional()
  @IsNumber()
  numberOfRooms?: number;

  @IsOptional()
  @IsNumber()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  numberOfBathrooms?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  constructionDate?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  privateNote?: string;

  // Informations complémentaires
  @IsOptional()
  @IsEnum(BuildingType)
  buildingType?: BuildingType;

  @IsOptional()
  @IsEnum(BuildingLegalStatus)
  buildingLegalStatus?: BuildingLegalStatus;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean;

  @IsOptional()
  @IsBoolean()
  smokersAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outdoorSpaces?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  buildingAmenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  securityFeatures?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sportsFacilities?: string[];

  // Informations cadastrales
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @IsOptional()
  @IsString()
  coownershipUnits?: string;

  @IsOptional()
  @IsString()
  cadastralReference?: string;

  // Informations financières
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  acquisitionDate?: Date;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  acquisitionPrice?: number;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  acquisitionFees?: number;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  agencyFees?: number;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  currentValue?: number;

  // Informations fiscales
  @IsOptional()
  @IsEnum(PropertyTaxRegime)
  taxRegime?: PropertyTaxRegime;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  activityStartDate?: Date;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  housingTax?: number;

  @IsOptional()
  @Transform(({ value }) => toDecimal(value))
  @IsNumber()
  propertyTax?: number;

  // Centre des impôts
  @IsOptional()
  @IsString()
  taxCenterName?: string;

  @IsOptional()
  @IsString()
  taxCenterAddress?: string;

  @IsOptional()
  @IsString()
  taxCenterAddress2?: string;

  @IsOptional()
  @IsString()
  taxCenterZipCode?: string;

  @IsOptional()
  @IsString()
  taxCenterCity?: string;

  @IsOptional()
  @IsString()
  taxNotes?: string;

  // Flyer numérique
  @IsOptional()
  @IsString()
  publicDescription?: string;

  @IsOptional()
  @IsString()
  internalRules?: string;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  propertyVisibility?: VisibilityStatus;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  addressVisibility?: VisibilityStatus;

  @IsOptional()
  @IsEnum(VisibilityStatus)
  phoneVisibility?: VisibilityStatus;

  @IsOptional()
  @IsBoolean()
  isAvailableForRent?: boolean;

  // Images
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}


