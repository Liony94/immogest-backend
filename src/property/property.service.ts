import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
import { CreatePropertyDto } from './dto/create-property.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

    if (createPropertyDto.users && createPropertyDto.users.length > 0) {
      const tenants = await Promise.all(
        createPropertyDto.users.map(userId =>
          this.userRepository.findOne({ where: { id: userId } })
        )
      );

      savedProperty.tenants = tenants.filter(tenant => tenant !== null);
      await this.propertyRepository.save(savedProperty);
    }

    return this.propertyRepository.findOne({
      where: { id: savedProperty.id },
      relations: ['tenants', 'user'],
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

  async findPropertiesByTenant(tenantId: number): Promise<Property[]> {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenants', 'tenants')
      .leftJoinAndSelect('property.user', 'owner')
      .where('tenants.id = :tenantId', { tenantId })
      .getMany();
  }
}
