import { ChildEntity, ManyToMany, OneToMany, Column } from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';
import { Rental } from './rental.entity';

@ChildEntity()
export class Tenant extends User {
  @Column({ nullable: true })
  guarantorName?: string;

  @Column({ nullable: true })
  guarantorPhone?: string;

  @ManyToMany(() => Property, (property) => property.tenants)
  rentedProperties: Property[];

  @OneToMany(() => Rental, rental => rental.tenant)
  rentals: Rental[];
} 