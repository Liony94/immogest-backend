import { IsString, IsOptional, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType } from '../../../entities/enums/properties/document-type.enum';

export class CreatePropertyDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  description: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  establishmentDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsBoolean()
  isExistingDocument?: boolean;
} 