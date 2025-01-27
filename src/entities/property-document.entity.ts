import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Property } from './property.entity';
import { DocumentType } from './enums/properties/document-type.enum';

@Entity()
export class PropertyDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  type: DocumentType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date', nullable: true })
  establishmentDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ type: 'boolean', default: false })
  isExistingDocument: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Property, property => property.documents, {
    onDelete: 'CASCADE'
  })
  property: Property;
} 