import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Owner)
    private ownerRepository: Repository<Owner>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) { }

  async create(createPropertyDto: CreatePropertyDto, ownerId: number) {
    try {
      const owner = await this.ownerRepository.findOneOrFail({ where: { id: ownerId } });

      const property = this.propertyRepository.create({
        ...createPropertyDto,
        owner
      });

      return await this.propertyRepository.save(property);
    } catch (error) {
      throw new Error(`Erreur lors de la création du bien: ${error.message}`);
    }
  }

  async addTenants(propertyId: number, tenantIds: number[]) {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['tenants']
    });

    if (!property) {
      throw new Error('Property not found');
    }

    property.tenants = await Promise.all(
      tenantIds.map(id => this.tenantRepository.findOne({ where: { id } }))
    );

    return this.propertyRepository.save(property);
  }

  async findByOwner(ownerId: number) {
    return this.propertyRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner', 'tenants']
    });
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      relations: ['tenants', 'user'],
    });
  }

  async findPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['tenants', 'owner'],
    });
  }

  async findOne(id: number): Promise<Property> {
    return this.propertyRepository.findOne({
      where: { id },
      relations: ['tenants', 'user'],
    });
  }

  async findPropertiesByTenant(tenantId: number): Promise<Property[]> {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenants', 'tenants')
      .leftJoinAndSelect('property.user', 'owner')
      .where('tenants.id = :tenantId', { tenantId })
      .getMany();
  }
}
