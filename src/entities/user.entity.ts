import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Property } from './property.entity';
import { Tenant } from './tenant.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => Property, (property) => property.user)
  properties: Property[];

  @OneToMany(() => Tenant, (tenant) => tenant.user)
  tenants: Tenant[];
}
