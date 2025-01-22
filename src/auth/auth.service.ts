import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../common/types';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Owner)
    private ownerRepository: Repository<Owner>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) { }

  private async checkEmailExists(email: string): Promise<boolean> {
    const ownerExists = await this.ownerRepository.findOne({ where: { email } });
    const tenantExists = await this.tenantRepository.findOne({ where: { email } });
    return !!ownerExists || !!tenantExists;
  }

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const emailExists = await this.checkEmailExists(createUserDto.email);
    if (emailExists) {
      throw new UnauthorizedException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    if (createUserDto.role === UserRole.OWNER) {
      const user = this.ownerRepository.create({
        ...createUserDto,
        password: hashedPassword
      });
      return this.ownerRepository.save(user);
    } else {
      const user = this.tenantRepository.create({
        ...createUserDto,
        password: hashedPassword
      });
      return this.tenantRepository.save(user);
    }
  }

  async validateUser(loginDto: LoginDto): Promise<Owner | Tenant> {
    try {
      console.log('Login attempt for:', loginDto.email, 'with role:', loginDto.role);

      const role = loginDto.role.toLowerCase();

      if (role === 'owner') {
        const user = await this.ownerRepository
          .createQueryBuilder('owner')
          .where('owner.email = :email', { email: loginDto.email })
          .getOne();

        console.log('Found owner:', user);

        if (!user) {
          throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (isPasswordValid) {
          return user;
        }
      } else if (role === 'tenant') {
        const user = await this.tenantRepository
          .createQueryBuilder('tenant')
          .where('tenant.email = :email', { email: loginDto.email })
          .getOne();

        console.log('Found tenant:', user);

        if (!user) {
          throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (isPasswordValid) {
          return user;
        }
      }

      throw new UnauthorizedException('Email ou mot de passe incorrect');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si le rôle correspond
    if (user.role !== loginDto.role) {
      throw new UnauthorizedException('Type d\'utilisateur incorrect');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  }

  async getCurrentUser(id: string): Promise<Owner | Tenant> {
    const repository = await this.ownerRepository.findOne({ where: { id: Number(id) } })
      ? this.ownerRepository
      : this.tenantRepository;
    return repository.findOne({ where: { id: Number(id) } });
  }
}
