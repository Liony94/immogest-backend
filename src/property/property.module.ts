import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from 'src/entities/property.entity';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { Tenant } from 'src/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Tenant])],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
