import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Property } from './property.entity';
import { Tenant } from './tenant.entity';
import { PaymentSchedule } from './payment-schedule.entity';

@Entity()
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  // Informations de la location
  @Column()
  name: string; 

  @Column({ type: 'text', nullable: true })
  description: string;

  // Dates de la location
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // Informations financières spécifiques à la location
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rent: number; // Loyer spécifique à cette location

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  charges: number; // Charges spécifiques à cette location

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deposit: number; // Dépôt de garantie

  // Caractéristiques spécifiques
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  surface: number; // Surface de la location si différente de la propriété

  @Column({ default: false })
  isFurnished: boolean;

  @Column({ type: 'simple-array', nullable: true })
  furniture: string[]; // Liste des meubles si meublé

  // État des lieux
  @Column({ type: 'date', nullable: true })
  checkInDate: Date;

  @Column({ type: 'date', nullable: true })
  checkOutDate: Date;

  @Column({ type: 'text', nullable: true })
  checkInNotes: string;

  @Column({ type: 'text', nullable: true })
  checkOutNotes: string;

  // Statut de la location
  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Property, property => property.rentals, { nullable: false })
  property: Property;

  @ManyToOne(() => Tenant, tenant => tenant.rentals, { nullable: false })
  tenant: Tenant;

  @OneToMany(() => PaymentSchedule, schedule => schedule.rental)
  paymentSchedules: PaymentSchedule[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 