import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { Owner } from '../../entities/owner.entity';

@Injectable()
export class PropertyBaseService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, ownerId: number): Promise<Property> {
    try {
      const owner = await this.ownerRepository.findOne({
        where: { id: ownerId }
      });

      if (!owner) {
        throw new NotFoundException(`Propriétaire avec l'ID ${ownerId} non trouvé`);
      }

      const existingProperty = await this.propertyRepository.findOne({
        where: { identifier: createPropertyDto.identifier }
      });

      if (existingProperty) {
        throw new BadRequestException(`Une propriété avec l'identifiant ${createPropertyDto.identifier} existe déjà`);
      }
      
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        owner,
      });

      const savedProperty = await this.propertyRepository.save(property);
      return this.findOne(savedProperty.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erreur lors de la création du bien: ${error.message}`);
    }
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      relations: ['owner']
    });
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['owner']
    });

    if (!property) {
      throw new NotFoundException(`Propriété avec l'ID ${id} non trouvée`);
    }

    return property;
  }

  async findPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner'],
    });
  }
} 