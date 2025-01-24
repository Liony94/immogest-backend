import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyController } from './controllers/property.controller';
import { PropertyAccessController } from './controllers/property-access.controller';
import { PropertyDocumentController } from './controllers/property-document.controller';
import { PropertyTenantController } from './controllers/property-tenant.controller';
import { PropertyBaseService } from './services/property-base.service';
import { PropertyAccessService } from './services/property-access.service';
import { PropertyDocumentService } from './services/property-document.service';
import { PropertyTenantService } from './services/property-tenant.service';
import { Property } from '../entities/property.entity';
import { User } from 'src/entities/user.entity';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';
import { PropertyAccess } from '../entities/property-access.entity';
import { PropertyDocument } from '../entities/property-document.entity';
import { PropertyOwnershipService } from './services/property-ownership.service';

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
  providers: [
    PropertyBaseService,
    PropertyAccessService,
    PropertyDocumentService,
    PropertyTenantService,
    PropertyOwnershipService
  ],
  exports: [
    PropertyBaseService,
    PropertyAccessService,
    PropertyDocumentService,
    PropertyTenantService,
    PropertyOwnershipService
  ]
})
export class PropertyModule {}
