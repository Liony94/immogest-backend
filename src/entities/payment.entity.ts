import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentSchedule } from './payment-schedule.entity';
import { PaymentStatus } from './enums/properties/payment-status.enum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dueDate: Date;

  @Column()
  amount: number;

  @Column({ nullable: true })
  paidAmount: number;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isArchived: boolean;

  @ManyToOne(() => PaymentSchedule, schedule => schedule.payments, { nullable: false })
  paymentSchedule: PaymentSchedule;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 