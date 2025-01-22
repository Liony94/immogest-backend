import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentScheduleService } from './services/payment-schedule.service';
import { ReceiptService } from './services/receipt.service';
import { Payment } from '../entities/payment.entity';
import { PaymentSchedule } from '../entities/payment-schedule.entity';
import { Receipt } from '../entities/receipt.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentSchedule, Receipt]),
    ScheduleModule.forRoot()
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentScheduleService, ReceiptService],
  exports: [PaymentService, PaymentScheduleService, ReceiptService]
})
export class PaymentModule {} 