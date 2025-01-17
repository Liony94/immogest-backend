import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
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

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @OneToMany(() => Tenant, (tenant) => tenant.property)
  tenants: Tenant[];
}
