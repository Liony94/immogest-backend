import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { AccessType } from './enums/access-type.enum';

@Entity()
export class PropertyAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.KEY
  })
  type: AccessType;

  @Column()
  label: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 1 })
  quantity: number;

  @ManyToOne(() => Property, property => property.accesses, {
    onDelete: 'CASCADE'
  })
  property: Property;
} 