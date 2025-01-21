import { ChildEntity, ManyToMany, Column } from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@ChildEntity()
export class Tenant extends User {
  @Column({ nullable: true })
  guarantorName?: string;

  @Column({ nullable: true })
  guarantorPhone?: string;

  @ManyToMany(() => Property, (property) => property.tenants)
  rentedProperties: Property[];
} 