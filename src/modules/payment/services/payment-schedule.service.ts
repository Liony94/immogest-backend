import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PaymentSchedule } from '../../../entities/payment-schedule.entity';
import { Payment } from '../../../entities/payment.entity';
import { PaymentStatus } from '../../../entities/enums/payment-status.enum';
import { CreatePaymentScheduleDto } from '../dto/create-payment-schedule.dto';
import { UpdatePaymentScheduleDto } from '../dto/update-payment-schedule.dto';

@Injectable()
export class PaymentScheduleService {
  constructor(
    @InjectRepository(PaymentSchedule)
    private paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>
  ) {}

  async create(createPaymentScheduleDto: CreatePaymentScheduleDto) {
    const schedule = this.paymentScheduleRepository.create({
      startDate: createPaymentScheduleDto.startDate,
      endDate: createPaymentScheduleDto.endDate,
      monthlyAmount: createPaymentScheduleDto.monthlyAmount,
      dayOfMonth: createPaymentScheduleDto.dayOfMonth,
      rental: { id: createPaymentScheduleDto.rentalId }
    });

    await this.paymentScheduleRepository.save(schedule);

    // Générer les paiements mensuels
    await this.generateMonthlyPayments(schedule);

    return schedule;
  }

  private async generateMonthlyPayments(schedule: PaymentSchedule) {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dueDate = new Date(currentDate.setDate(schedule.dayOfMonth));
      
      const payment = this.paymentRepository.create({
        paymentSchedule: schedule,
        dueDate: dueDate,
        amount: schedule.monthlyAmount,
        status: dueDate < today ? PaymentStatus.LATE : PaymentStatus.PENDING
      });

      await this.paymentRepository.save(payment);
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  async findAll() {
    return this.paymentScheduleRepository.find({
      relations: {
        rental: {
          property: {
            owner: true
          },
          tenant: true
        },
        payments: true
      }
    });
  }

  async findOne(id: number) {
    return this.paymentScheduleRepository.findOne({
      where: { id },
      relations: {
        rental: {
          property: {
            owner: true
          },
          tenant: true
        },
        payments: true
      }
    });
  }

  async findByTenantId(tenantId: number) {
    return this.paymentScheduleRepository.find({
      where: { rental: { tenant: { id: tenantId } } },
      relations: {
        rental: {
          property: {
            owner: true
          },
          tenant: true
        },
        payments: true
      }
    });
  }

  async findByPropertyId(propertyId: number) {
    return this.paymentScheduleRepository.find({
      where: { rental: { property: { id: propertyId } } },
      relations: {
        rental: {
          property: {
            owner: true
          },
          tenant: true
        },
        payments: true
      }
    });
  }

  async update(id: number, updatePaymentScheduleDto: UpdatePaymentScheduleDto) {
    const schedule = await this.paymentScheduleRepository.findOne({
      where: { id },
      relations: {
        rental: {
          property: {
            owner: true
          },
          tenant: true
        }
      }
    });

    if (!schedule) {
      return null;
    }

    Object.assign(schedule, updatePaymentScheduleDto);
    return this.paymentScheduleRepository.save(schedule);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id);
    if (!schedule) {
      return null;
    }
    return this.paymentScheduleRepository.remove(schedule);
  }

  async getLatePayments(): Promise<Payment[]> {
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

  async deactivate(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    if (!schedule) {
      throw new NotFoundException(`Échéancier #${id} non trouvé`);
    }
    schedule.isActive = false;
    await this.paymentScheduleRepository.save(schedule);
  }

  async updatePaymentAmount(id: number, newAmount: number): Promise<void> {
    if (newAmount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    const schedule = await this.findOne(id);
    if (!schedule) {
      throw new NotFoundException(`Échéancier #${id} non trouvé`);
    }

    schedule.monthlyAmount = newAmount;

    // Mettre à jour les paiements futurs non payés
    const today = new Date();
    const futurePendingPayments = await this.paymentRepository.find({
      where: {
        paymentSchedule: { id },
        status: PaymentStatus.PENDING,
        dueDate: Between(today, schedule.endDate)
      }
    });

    for (const payment of futurePendingPayments) {
      payment.amount = newAmount;
      await this.paymentRepository.save(payment);
    }

    await this.paymentScheduleRepository.save(schedule);
  }
} 