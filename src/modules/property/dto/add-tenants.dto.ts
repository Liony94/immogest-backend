import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class AddTenantsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un locataire doit être spécifié' })
  @IsNumber({}, { each: true, message: 'Chaque ID de locataire doit être un nombre' })
  @Type(() => Number)
  tenantIds: number[];
} 