import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from '../../../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentStatus } from '../../../entities/enums/payment-status.enum';
import { RecordPaymentDto } from '../dto/record-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentSchedule: { id: createPaymentDto.paymentScheduleId }
    });
    return this.paymentRepository.save(payment);
  }

  async findOne(id: number) {
    return this.paymentRepository.findOne({
      where: { id },
      relations: {
        paymentSchedule: {
          rental: {
            property: {
              owner: true
            },
            tenant: true
          }
        }
      }
    });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }
    Object.assign(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }
    return this.paymentRepository.remove(payment);
  }

  async findAllLatePayments() {
    const today = new Date();
    return this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: Between(new Date('2000-01-01'), today)
      },
      relations: {
        paymentSchedule: {
          rental: {
            property: {
              owner: true
            },
            tenant: true
          }
        }
      }
    });
  }

  async recordPayment(id: number, recordPaymentDto: RecordPaymentDto) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }

    payment.paidAmount = recordPaymentDto.amount;
    payment.paidAt = new Date();
    payment.paymentMethod = recordPaymentDto.paymentMethod;
    payment.transactionId = recordPaymentDto.transactionId;
    payment.status = PaymentStatus.PAID;
    payment.notes = recordPaymentDto.notes;

    return this.paymentRepository.save(payment);
  }

  async cancelPayment(id: number) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }

    payment.status = PaymentStatus.CANCELLED;
    return this.paymentRepository.save(payment);
  }

  async getPaymentStatistics(scheduleId: number) {
    const payments = await this.paymentRepository.find({
      where: { paymentSchedule: { id: scheduleId } }
    });

    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID).length;
    const latePayments = payments.filter(p => p.status === PaymentStatus.LATE).length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter(p => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

    return {
      totalPayments,
      paidPayments,
      latePayments,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount
    };
  }

  async updateLatePaymentsStatus() {
    const today = new Date();
    const latePayments = await this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: Between(new Date('2000-01-01'), today)
      }
    });

    for (const payment of latePayments) {
      payment.status = PaymentStatus.LATE;
      await this.paymentRepository.save(payment);
    }

    return { updated: latePayments.length };
  }

  async archivePayment(id: number) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }

    payment.isArchived = true;
    return this.paymentRepository.save(payment);
  }

  async unarchivePayment(id: number) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }

    payment.isArchived = false;
    return this.paymentRepository.save(payment);
  }

  async archiveMultiplePayments(paymentIds: number[]) {
    const payments = await this.paymentRepository.findByIds(paymentIds);
    for (const payment of payments) {
      payment.isArchived = true;
      await this.paymentRepository.save(payment);
    }
    return { archived: payments.length };
  }

  async getArchivedPayments() {
    return this.paymentRepository.find({
      where: { isArchived: true },
      relations: {
        paymentSchedule: {
          rental: {
            property: {
              owner: true
            },
            tenant: true
          }
        }
      }
    });
  }
} 