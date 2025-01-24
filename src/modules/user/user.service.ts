import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Tenant } from 'src/entities/tenant.entity';
import { Owner } from 'src/entities/owner.entity';
import { UserRole } from 'src/common/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Owner)
    private ownerRepository: Repository<Owner>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUserByRoleTenant(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findTenantByLastName(lastName: string): Promise<User[]> {
    return this.userRepository.find({ where: { lastName } });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    // Chercher d'abord dans les propriétaires
    const owner = await this.ownerRepository.findOne({ where: { email } });
    if (owner) {
      return { ...owner, role: UserRole.OWNER };
    }

    // Si pas trouvé, chercher dans les locataires
    const tenant = await this.tenantRepository.findOne({ where: { email } });
    if (tenant) {
      return { ...tenant, role: UserRole.TENANT };
    }

    return null;
  }
}
