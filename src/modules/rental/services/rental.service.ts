import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from '../../../entities/rental.entity';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { UpdateRentalDto } from '../dto/update-rental.dto';
import { IRentalService } from '../interfaces/rental.interface';

@Injectable()
export class RentalService implements IRentalService {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>
  ) {}

  private async generateIdentifier(propertyId: number): Promise<string> {
    const lastRental = await this.rentalRepository.findOne({
      where: { property: { id: propertyId } },
      order: { createdAt: 'DESC' }
    });

    let sequence = 1;
    if (lastRental) {
      const lastSequence = lastRental.identifier.split('-')[2];
      sequence = parseInt(lastSequence, 10) + 1;
    }

    return `LOC-${propertyId}-${sequence.toString().padStart(3, '0')}`;
  }

  async create(createRentalDto: CreateRentalDto): Promise<Rental> {
    const identifier = await this.generateIdentifier(createRentalDto.propertyId);
    
    const rental = this.rentalRepository.create({
      ...createRentalDto,
      identifier,
      property: { id: createRentalDto.propertyId },
      tenant: { id: createRentalDto.tenantId }
    });
    return this.rentalRepository.save(rental);
  }

  async findAll(): Promise<Rental[]> {
    return this.rentalRepository.find({
      relations: {
        property: {
          owner: true
        },
        tenant: true,
        paymentSchedules: true
      }
    });
  }

  async findOne(id: number): Promise<Rental> {
    const rental = await this.rentalRepository.findOne({
      where: { id },
      relations: {
        property: {
          owner: true
        },
        tenant: true,
        paymentSchedules: true
      }
    });

    if (!rental) {
      throw new NotFoundException(`Location #${id} non trouvée`);
    }

    return rental;
  }

  async findByProperty(propertyId: number): Promise<Rental[]> {
    return this.rentalRepository.find({
      where: { property: { id: propertyId } },
      relations: ['tenant', 'paymentSchedules']
    });
  }

  async findByTenant(tenantId: number): Promise<Rental[]> {
    return this.rentalRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ['property', 'paymentSchedules']
    });
  }

  async update(id: number, updateRentalDto: UpdateRentalDto): Promise<Rental> {
    await this.findOne(id);
    await this.rentalRepository.update(id, updateRentalDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const rental = await this.findOne(id);
    await this.rentalRepository.remove(rental);
  }

  async activate(id: number): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.isActive = true;
    return this.rentalRepository.save(rental);
  }

  async deactivate(id: number): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.isActive = false;
    return this.rentalRepository.save(rental);
  }

  async addFurniture(id: number, furniture: string[]): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.furniture = [...new Set([...rental.furniture, ...furniture])];
    return this.rentalRepository.save(rental);
  }

  async removeFurniture(id: number, furniture: string[]): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.furniture = rental.furniture.filter(item => !furniture.includes(item));
    return this.rentalRepository.save(rental);
  }

  async updateCheckIn(id: number, notes: string): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.checkInNotes = notes;
    rental.checkInDate = new Date();
    return this.rentalRepository.save(rental);
  }

  async updateCheckOut(id: number, notes: string): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.checkOutNotes = notes;
    rental.checkOutDate = new Date();
    return this.rentalRepository.save(rental);
  }
} 