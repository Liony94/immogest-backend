import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyAccess } from '../../entities/property-access.entity';
import { CreatePropertyAccessDto } from '../dto/create-property-access.dto';
import { UpdatePropertyAccessDto } from '../dto/update-property-access.dto';
import { PropertyBaseService } from './property-base.service';

@Injectable()
export class PropertyAccessService {
  constructor(
    @InjectRepository(PropertyAccess)
    private readonly propertyAccessRepository: Repository<PropertyAccess>,
    private readonly propertyBaseService: PropertyBaseService,
  ) {}

  async addAccess(propertyId: number, accessData: CreatePropertyAccessDto): Promise<PropertyAccess> {
    const property = await this.propertyBaseService.findOne(propertyId);
    const access = this.propertyAccessRepository.create({
      ...accessData,
      property
    });
    return this.propertyAccessRepository.save(access);
  }

  async updateAccess(accessId: number, updateAccessDto: UpdatePropertyAccessDto): Promise<PropertyAccess> {
    const access = await this.findAccessWithRelations(accessId);
    Object.assign(access, updateAccessDto);
    return this.propertyAccessRepository.save(access);
  }

  async deleteAccess(accessId: number): Promise<void> {
    const access = await this.findAccessWithRelations(accessId);
    await this.propertyAccessRepository.remove(access);
  }

  async findAccessWithRelations(accessId: number): Promise<PropertyAccess> {
    const access = await this.propertyAccessRepository.findOne({
      where: { id: accessId },
      relations: ['property']
    });

    if (!access) {
      throw new NotFoundException(`Accès avec l'ID ${accessId} non trouvé`);
    }

    return access;
  }
} 