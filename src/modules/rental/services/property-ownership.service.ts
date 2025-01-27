import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../../entities/property.entity';

@Injectable()
export class PropertyOwnershipService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>
  ) {}

  async verifyPropertyOwner(propertyId: number, userId: number): Promise<boolean> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['owner']
    });

    if (!property) {
      throw new NotFoundException(`Propriété #${propertyId} non trouvée`);
    }

    return property.owner.id === userId;
  }
} 