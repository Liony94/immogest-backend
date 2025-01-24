import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PropertyBaseService } from "./property-base.service";

@Injectable()
export class PropertyOwnershipService {
  constructor(private readonly propertyBaseService: PropertyBaseService) {}

  async checkPropertyOwnership(propertyId: number, userId: number): Promise<void> {
    const property = await this.propertyBaseService.findOne(propertyId);
    if (property.owner.id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
  }
} 