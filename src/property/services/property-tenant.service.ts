import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/property.entity';
import { Tenant } from '../../entities/tenant.entity';
import { PropertyBaseService } from './property-base.service';

@Injectable()
export class PropertyTenantService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly propertyBaseService: PropertyBaseService,
  ) {}

  async addTenants(propertyId: number, tenantIds: number[]): Promise<Property> {
    const property = await this.propertyBaseService.findOne(propertyId);
    const tenants = await this.findTenantsByIds(tenantIds);
    
    property.tenants = tenants;
    return this.propertyRepository.save(property);
  }

  async findPropertiesByTenant(tenantId: number): Promise<Property[]> {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenants', 'tenants')
      .leftJoinAndSelect('property.owner', 'owner')
      .where('tenants.id = :tenantId', { tenantId })
      .getMany();
  }

  private async findTenantsByIds(tenantIds: number[]): Promise<Tenant[]> {
    const tenants = await this.tenantRepository.findByIds(tenantIds);
    
    if (tenants.length !== tenantIds.length) {
      const foundIds = tenants.map(tenant => tenant.id);
      const missingIds = tenantIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Locataires non trouvés avec les IDs: ${missingIds.join(', ')}`);
    }
    
    return tenants;
  }
} 