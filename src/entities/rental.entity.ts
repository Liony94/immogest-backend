import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Property } from './property.entity';
import { Tenant } from './tenant.entity';
import { PaymentSchedule } from './payment-schedule.entity';
import { RentalType } from './enums/rentals/rental-type.enum';
import { UsageType } from './enums/rentals/usage-type.enum';
import { PaymentFrequency } from './enums/rentals/payment-frequency.enum';
import { PaymentType } from './enums/rentals/payment-type.enum';
import { ChargeType } from './enums/rentals/charge-type.enum';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  // Relations
  @ManyToOne(() => Property, { eager: true })
  property: Property;

  @ManyToOne(() => Tenant, { eager: true })
  tenant: Tenant;

  @OneToMany(() => PaymentSchedule, schedule => schedule.rental)
  paymentSchedules: PaymentSchedule[];

  // Informations générales
  @Column({ type: 'enum', enum: RentalType })
  type: RentalType;

  @Column({ type: 'enum', enum: UsageType })
  usage: UsageType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  tacitRenewal: boolean;

  // Paiement
  @Column({ type: 'enum', enum: PaymentFrequency, default: PaymentFrequency.MONTHLY })
  paymentFrequency: PaymentFrequency;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.IN_ADVANCE })
  paymentType: PaymentType;

  @Column({ type: 'int', default: 1 })
  paymentDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rentVatRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  charges: number;

  @Column({ type: 'enum', enum: ChargeType, default: ChargeType.PROVISION })
  chargeType: ChargeType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  chargesVatRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deposit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  housingBenefit: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  latePaymentFee: number;

  // Révision de loyer
  @Column({ default: true })
  rentRevisionEnabled: boolean;

  @Column({ default: 'IRL' })
  rentRevisionIndex: string;

  @Column({ type: 'int', default: 12 })
  rentRevisionPeriod: number;

  // Encadrement des loyers
  @Column({ default: false })
  rentControlEnabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  referenceRent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxRent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentSupplement: number;

  @Column({ type: 'text', nullable: true })
  rentSupplementJustification: string;

  // Informations complémentaires
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  ownerWorkAmount: number;

  @Column({ type: 'text', nullable: true })
  ownerWorkDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tenantWorkAmount: number;

  @Column({ type: 'text', nullable: true })
  tenantWorkDescription: string;

  @Column({ type: 'text', nullable: true })
  specialConditions: string;

  @Column({ type: 'text', nullable: true })
  specialClauses: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  // État des lieux
  @Column({ type: 'timestamp', nullable: true })
  checkInDate: Date;

  @Column({ type: 'text', nullable: true })
  checkInNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  checkOutDate: Date;

  @Column({ type: 'text', nullable: true })
  checkOutNotes: string;

  // Quittances
  @Column({ default: 1 })
  billingDay: number;

  @Column({ default: false })
  separateBillingAddress: boolean;

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @Column({ default: 'Quittance' })
  documentTitle: string;

  @Column({ default: true })
  automaticNumbering: boolean;

  @Column({ default: false })
  includeNoticeSecondPage: boolean;

  @Column({ type: 'text', nullable: true })
  receiptText: string;

  @Column({ type: 'text', nullable: true })
  noticeText: string;

  // Autres réglages
  @Column({ default: 'manual' })
  balanceReportType: string;

  @Column({ default: true })
  notifyOwner: boolean;

  @Column({ default: true })
  notifyTenant: boolean;

  @Column({ default: true })
  notifyContractEnd: boolean;

  @Column({ default: true })
  isActive: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 