import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Tenant } from 'src/entities/tenant.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createPropertyDto: CreatePropertyDto, user: User): Promise<Property> {
    const property = this.propertyRepository.create({
      title: createPropertyDto.title,
      description: createPropertyDto.description,
      price: createPropertyDto.price,
      address: createPropertyDto.address,
      city: createPropertyDto.city,
      zipCode: createPropertyDto.zipCode,
      type: createPropertyDto.type,
      surface: createPropertyDto.surface,
      image: createPropertyDto.image,
      user: user,
    });

    const savedProperty = await this.propertyRepository.save(property);

    if (createPropertyDto.tenants && createPropertyDto.tenants.length > 0) {
      for (const tenant of createPropertyDto.tenants) {
        await this.tenantRepository.update(tenant.id, {
          property: savedProperty,
        });
      }
      
      return this.propertyRepository.findOne({
        where: { id: savedProperty.id },
        relations: ['tenants', 'user'],
      });
    }

    return this.propertyRepository.findOne({
      where: { id: savedProperty.id },
      relations: ['user'],
    });
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      relations: ['tenants', 'user'],
    });
  }

  async findOne(id: number): Promise<Property> {
    return this.propertyRepository.findOne({
      where: { id },
      relations: ['tenants', 'user'],
    });
  }
}
