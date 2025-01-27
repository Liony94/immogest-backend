import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleRef } from '@nestjs/core';
import { Rental } from '../../entities/rental.entity';
import { Property } from '../../entities/property.entity';
import { RentalService } from './services/rental.service';
import { RentalController } from './controllers/rental.controller';
import { setModuleRef } from '../../core/decorators/check-ownership.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([Rental, Property])],
  providers: [RentalService],
  controllers: [RentalController],
  exports: [RentalService]
})
export class RentalModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    setModuleRef(this.moduleRef);
  }
}