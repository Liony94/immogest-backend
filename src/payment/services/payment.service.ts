import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../entities/enums/payment-status.enum';
import { RecordPaymentDto } from '../dto/record-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async recordPayment(paymentId: number, recordPaymentDto: RecordPaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['paymentSchedule']
    });

    if (!payment) {
      throw new NotFoundException(`Paiement #${paymentId} non trouvé`);
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Ce paiement a déjà été effectué');
    }

    const { amount, paymentMethod, transactionId, notes } = recordPaymentDto;

    // Mise à jour du statut en fonction du montant payé
    if (amount >= payment.amount) {
      payment.status = PaymentStatus.PAID;
      payment.paidAmount = payment.amount;
    } else {
      payment.status = PaymentStatus.PARTIALLY_PAID;
      payment.paidAmount = amount;
    }

    payment.paidAt = new Date();
    payment.paymentMethod = paymentMethod;
    payment.transactionId = transactionId;
    payment.notes = notes;

    return this.paymentRepository.save(payment);
  }

  async cancelPayment(paymentId: number): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    
    if (payment.status === PaymentStatus.PAID) {
      throw new BadRequestException('Impossible d\'annuler un paiement déjà effectué');
    }

    payment.status = PaymentStatus.CANCELLED;
    return this.paymentRepository.save(payment);
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.paymentSchedule', 'schedule')
      .leftJoinAndSelect('schedule.tenant', 'tenant')
      .leftJoinAndSelect('schedule.property', 'property')
      .leftJoinAndSelect('property.owner', 'owner')
      .where('payment.id = :id', { id })
      .getOne();

    if (!payment) {
      throw new NotFoundException(`Paiement #${id} non trouvé`);
    }

    return payment;
  }

  async updatePaymentStatus(): Promise<void> {
    const today = new Date();
    const pendingPayments = await this.paymentRepository.find({
      where: { status: PaymentStatus.PENDING }
    });

    for (const payment of pendingPayments) {
      if (payment.dueDate < today) {
        payment.status = PaymentStatus.LATE;
        await this.paymentRepository.save(payment);
      }
    }
  }

  async getPaymentStatistics(scheduleId: number) {
    const payments = await this.paymentRepository.find({
      where: { paymentSchedule: { id: scheduleId } }
    });

    const totalDue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0);
    const totalLate = payments.filter(p => p.status === PaymentStatus.LATE).length;
    const totalPending = payments.filter(p => p.status === PaymentStatus.PENDING).length;

    return {
      totalDue,
      totalPaid,
      totalLate,
      totalPending,
      balance: totalDue - totalPaid
    };
  }

  async updateLatePaymentsStatus(): Promise<{ updated: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée

    const result = await this.paymentRepository
      .createQueryBuilder()
      .update(Payment)
      .set({ status: PaymentStatus.LATE })
      .where('status = :status', { status: PaymentStatus.PENDING })
      .andWhere('dueDate < :today', { today })
      .execute();

    return { updated: result.affected || 0 };
  }

  async archivePayment(paymentId: number): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    payment.isArchived = true;
    return this.paymentRepository.save(payment);
  }

  async unarchivePayment(paymentId: number): Promise<Payment> {
    const payment = await this.findOne(paymentId);
    payment.isArchived = false;
    return this.paymentRepository.save(payment);
  }

  async archiveMultiplePayments(paymentIds: number[]): Promise<{ archived: number }> {
    const result = await this.paymentRepository
      .createQueryBuilder()
      .update(Payment)
      .set({ isArchived: true })
      .where('id IN (:...ids)', { ids: paymentIds })
      .execute();

    return { archived: result.affected || 0 };
  }

  async getArchivedPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { isArchived: true },
      relations: [
        'paymentSchedule',
        'paymentSchedule.tenant',
        'paymentSchedule.property',
        'paymentSchedule.property.owner'
      ],
      select: {
        paymentSchedule: {
          tenant: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          },
          property: {
            id: true,
            identifier: true,
            address: true,
            city: true,
            zipCode: true,
            type: true,
            surface: true,
            owner: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      },
      order: {
        dueDate: 'DESC'
      }
    });
  }
} 