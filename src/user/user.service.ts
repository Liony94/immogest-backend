import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUserByRoleTenant(): Promise<User[]> {
    return this.userRepository.find({ where: { role: UserRole.TENANT } });
  }

  async findTenantByLastName(lastName: string): Promise<User[]> {
    return this.userRepository.find({ where: { lastName } });
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
