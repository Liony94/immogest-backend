import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Owner } from './owner.entity';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';
import { PropertyType } from './enums/property-type.enum';
import { PropertyTaxRegime } from './enums/property-tax-regime.enum';
import { BuildingType, BuildingLegalStatus } from './enums/building-type.enum';
import { PropertyAccess } from './property-access.entity';
import { PropertyDocument } from './property-document.entity';
import { VisibilityStatus } from './enums/visibility-status.enum';
import { Rental } from './rental.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  identifier: string;

  @Column({ nullable: true })
  color: string;

  // Informations générales
  @Column({
    type: 'enum',
    enum: PropertyType,
    default: PropertyType.APARTMENT
  })
  type: PropertyType;

  // Adresse
  @Column()
  address: string;

  @Column({ nullable: true })
  address2: string;

  @Column({ nullable: true })
  building: string;

  @Column({ nullable: true })
  staircase: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  number: string;

  @Column()
  city: string;

  @Column()
  zipCode: string;

  @Column({ nullable: true })
  region: string;

  @Column()
  country: string;

  // Informations locatives
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rentExcludingCharges: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  charges: number;

  @Column({ nullable: true })
  paymentFrequency: string;

  // Description physique
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  surface: number;

  @Column({ nullable: true })
  numberOfRooms: number;

  @Column({ nullable: true })
  numberOfBedrooms: number;

  @Column({ nullable: true })
  numberOfBathrooms: number;

  @Column({ type: 'date', nullable: true })
  constructionDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  privateNote: string;

  // Informations complémentaires
  @Column({
    type: 'enum',
    enum: BuildingType,
    nullable: true
  })
  buildingType: BuildingType;

  @Column({
    type: 'enum',
    enum: BuildingLegalStatus,
    nullable: true
  })
  buildingLegalStatus: BuildingLegalStatus;

  @Column({ default: false })
  isFurnished: boolean;

  @Column({ default: false })
  smokersAllowed: boolean;

  @Column({ default: false })
  petsAllowed: boolean;

  // Équipements (stockés comme tableaux de strings)
  @Column('simple-array', { nullable: true })
  equipment: string[];

  @Column('simple-array', { nullable: true })
  outdoorSpaces: string[];

  @Column('simple-array', { nullable: true })
  buildingAmenities: string[];

  @Column('simple-array', { nullable: true })
  securityFeatures: string[];

  @Column('simple-array', { nullable: true })
  sportsFacilities: string[];

  // Informations cadastrales
  @Column({ nullable: true })
  lotNumber: string;

  @Column({ nullable: true })
  coownershipUnits: string;

  @Column({ nullable: true })
  cadastralReference: string;

  // Informations financières
  @Column({ type: 'date', nullable: true })
  acquisitionDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  acquisitionPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  acquisitionFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  agencyFees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentValue: number;

  // Informations fiscales
  @Column({
    type: 'enum',
    enum: PropertyTaxRegime,
    nullable: true
  })
  taxRegime: PropertyTaxRegime;

  @Column({ nullable: true })
  siret: string;

  @Column({ type: 'date', nullable: true })
  activityStartDate: Date;

  @Column({ nullable: true })
  taxNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  housingTax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  propertyTax: number;

  // Centre des impôts
  @Column({ nullable: true })
  taxCenterName: string;

  @Column({ nullable: true })
  taxCenterAddress: string;

  @Column({ nullable: true })
  taxCenterAddress2: string;

  @Column({ nullable: true })
  taxCenterZipCode: string;

  @Column({ nullable: true })
  taxCenterCity: string;

  @Column({ type: 'text', nullable: true })
  taxNotes: string;

  // Images
  @Column('simple-array', { nullable: true })
  images: string[];

  // Flyer numérique
  @Column({ type: 'text', nullable: true })
  publicDescription: string;

  @Column({ type: 'text', nullable: true })
  internalRules: string;

  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PRIVATE
  })
  propertyVisibility: VisibilityStatus;

  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PRIVATE
  })
  addressVisibility: VisibilityStatus;

  @Column({
    type: 'enum',
    enum: VisibilityStatus,
    default: VisibilityStatus.PRIVATE
  })
  phoneVisibility: VisibilityStatus;

  @Column({ default: false })
  isAvailableForRent: boolean;

  // Relations
  @ManyToMany(() => Tenant, tenant => tenant.rentedProperties)
  @JoinTable()
  tenants: Tenant[];

  @ManyToOne(() => Owner, (owner) => owner.properties)
  owner: Owner;

  @OneToMany(() => PropertyAccess, access => access.property, {
    cascade: true
  })
  accesses: PropertyAccess[];

  @OneToMany(() => PropertyDocument, document => document.property, {
    cascade: true
  })
  documents: PropertyDocument[];

  @OneToMany(() => Rental, rental => rental.property, {
    cascade: true
  })
  rentals: Rental[];
}
