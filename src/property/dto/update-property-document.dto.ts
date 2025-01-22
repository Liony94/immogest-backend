import { IsString, IsOptional, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType } from '../../entities/enums/document-type.enum';

export class UpdatePropertyDocumentDto {
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsString()
  description?: string;

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