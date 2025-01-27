import { CreateRentalDto } from '../dto/create-rental.dto';
import { UpdateRentalDto } from '../dto/update-rental.dto';
import { Rental } from '../../../entities/rental.entity';

export interface IRentalService {
  create(createRentalDto: CreateRentalDto): Promise<Rental>;
  findAll(userId: number): Promise<Rental[]>;
  findOne(id: number): Promise<Rental>;
  findByProperty(propertyId: number): Promise<Rental[]>;
  findByTenant(tenantId: number, userId: number): Promise<Rental[]>;
  update(id: number, updateRentalDto: UpdateRentalDto): Promise<Rental>;
  remove(id: number): Promise<void>;
  activate(id: number): Promise<Rental>;
  deactivate(id: number): Promise<Rental>;
  addFurniture(id: number, furniture: string[]): Promise<Rental>;
  removeFurniture(id: number, furniture: string[]): Promise<Rental>;
  updateCheckIn(id: number, notes: string): Promise<Rental>;
  updateCheckOut(id: number, notes: string): Promise<Rental>;
} 