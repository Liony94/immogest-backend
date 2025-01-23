import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './controllers/property.controller';
import { PropertyAccessController } from './controllers/property-access.controller';
import { PropertyDocumentController } from './controllers/property-document.controller';
import { PropertyTenantController } from './controllers/property-tenant.controller';
import { PropertyService } from './property.service';
import { Property } from '../entities/property.entity';
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
  controllers: [
    PropertyController,
    PropertyAccessController,
    PropertyDocumentController,
    PropertyTenantController,
  ],
  providers: [PropertyService],
  exports: [PropertyService]
})
export class PropertyModule {}
