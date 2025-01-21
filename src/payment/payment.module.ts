import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentScheduleService } from './services/payment-schedule.service';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentSchedule]),
    ScheduleModule.forRoot()
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentScheduleService],
  exports: [PaymentService, PaymentScheduleService]
})
export class PaymentModule {} 