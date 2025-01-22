import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PaymentSchedule } from '../../entities/payment-schedule.entity';
import { Payment } from '../../entities/payment.entity';
import { PaymentStatus } from '../../entities/enums/payment-status.enum';
import { CreatePaymentScheduleDto } from '../dto/create-payment-schedule.dto';
@Injectable()
export class PaymentScheduleService {
  constructor(
    @InjectRepository(PaymentSchedule)
    private paymentScheduleRepository: Repository<PaymentSchedule>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentScheduleDto: CreatePaymentScheduleDto): Promise<PaymentSchedule> {
    const schedule = this.paymentScheduleRepository.create({
      startDate: createPaymentScheduleDto.startDate,
      endDate: createPaymentScheduleDto.endDate,
      monthlyAmount: createPaymentScheduleDto.monthlyAmount,
      dayOfMonth: createPaymentScheduleDto.dayOfMonth,
      property: { id: createPaymentScheduleDto.propertyId },
      tenant: { id: createPaymentScheduleDto.tenantId }
    });
    
    await this.paymentScheduleRepository.save(schedule);
    
    // Générer les paiements mensuels pour toute la période
    await this.generateMonthlyPayments(schedule);
    
    return schedule;
  }

  private async generateMonthlyPayments(schedule: PaymentSchedule): Promise<void> {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Début de la journée

    while (currentDate <= endDate) {
      const dueDate = new Date(currentDate.setDate(schedule.dayOfMonth));
      
      const payment = this.paymentRepository.create({
        paymentSchedule: schedule,
        dueDate: dueDate,
        amount: schedule.monthlyAmount,
        status: dueDate < today ? PaymentStatus.LATE : PaymentStatus.PENDING
      });

      await this.paymentRepository.save(payment);
      
      // Passer au mois suivant
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  async findAll(): Promise<PaymentSchedule[]> {
    try {
      return this.paymentScheduleRepository.find({
        relations: {
          property: {
            owner: true
          },
          tenant: true,
          payments: true
        },
        select: {
          tenant: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            guarantorName: true,
            guarantorPhone: true
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
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération des échéanciers: ${error.message}`
      );
    }
  }

  async findOne(id: number): Promise<PaymentSchedule> {
    const schedule = await this.paymentScheduleRepository.findOne({
      where: { id },
      relations: [
        'property',
        'tenant',
        'payments',
        'tenant.rentedProperties',
        'property.owner'
      ],
      select: {
        tenant: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          guarantorName: true,
          guarantorPhone: true
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
    });

    if (!schedule) {
      throw new NotFoundException(`Échéancier #${id} non trouvé`);
    }

    return schedule;
  }

  async findByTenant(tenantId: number): Promise<PaymentSchedule[]> {
    return this.paymentScheduleRepository.find({
      where: { tenant: { id: tenantId } },
      relations: [
        'property',
        'payments',
        'property.owner'
      ],
      select: {
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
    });
  }

  async findByProperty(propertyId: number): Promise<PaymentSchedule[]> {
    return this.paymentScheduleRepository.find({
      where: { property: { id: propertyId } },
      relations: [
        'tenant',
        'payments',
        'tenant.rentedProperties'
      ],
      select: {
        tenant: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          address: true,
          guarantorName: true,
          guarantorPhone: true
        }
      }
    });
  }

  async getLatePayments(): Promise<Payment[]> {
    const today = new Date();
    return this.paymentRepository.find({
      where: {
        status: PaymentStatus.PENDING,
        dueDate: Between(new Date('2000-01-01'), today)
      },
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
      }
    });
  }

  async deactivate(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    schedule.isActive = false;
    await this.paymentScheduleRepository.save(schedule);
  }

  async updatePaymentAmount(id: number, newAmount: number): Promise<void> {
    if (newAmount <= 0) {
      throw new BadRequestException('Le montant doit être supérieur à 0');
    }

    const schedule = await this.findOne(id);
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