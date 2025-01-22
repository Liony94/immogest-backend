import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Property } from './property.entity';
import { Owner } from './owner.entity';
import { Tenant } from './tenant.entity';

@Entity()
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bytea' })
  pdfContent: Buffer;

  @Column()
  fileName: string;

  @Column()
  month: string;

  @Column()
  year: number;

  @ManyToOne(() => Payment, { nullable: false })
  payment: Payment;

  @ManyToOne(() => Property, { nullable: false })
  property: Property;

  @ManyToOne(() => Owner, { nullable: false })
  owner: Owner;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @Column()
  amount: number;

  @Column()
  paymentDate: Date;

  @CreateDateColumn()
  generatedAt: Date;
} 