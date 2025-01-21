import { ChildEntity, OneToMany, Column } from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@ChildEntity()
export class Owner extends User {
  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  siret?: string;

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];
} 