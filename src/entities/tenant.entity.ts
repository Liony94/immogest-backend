import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @ManyToOne(() => Property, (property) => property.id)
  property: Property;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
