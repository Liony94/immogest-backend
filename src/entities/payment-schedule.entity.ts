import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Property } from './property.entity';
import { Tenant } from './tenant.entity';
import { Payment } from './payment.entity';
@Entity()
export class PaymentSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column()
  monthlyAmount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int' })
  dayOfMonth: number; // Jour du mois où le paiement est dû

  @ManyToOne(() => Property, { nullable: false })
  property: Property;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @OneToMany(() => Payment, payment => payment.paymentSchedule)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 