import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../entities/property.entity';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { User } from 'src/entities/user.entity';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';
import { PropertyAccess } from '../entities/property-access.entity';
import { PropertyDocument } from '../entities/property-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      User,
      Owner,
      Tenant,
      PropertyAccess,
      PropertyDocument
    ])
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService]
})
export class PropertyModule {}
