import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

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

  @ManyToOne(() => User, user => user.properties)
  user: User;

  @ManyToMany(() => User, user => user.rentedProperties)
  @JoinTable()
  tenants: User[]; 
}
