import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Owner } from './owner.entity';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  zipCode: string;
  
  @Column()
  type: string;

  @Column()
  surface: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @ManyToMany(() => Tenant, tenant => tenant.rentedProperties)
  @JoinTable()
  tenants: Tenant[];

  @ManyToOne(() => Owner, (owner) => owner.properties)
  owner: Owner;
}
