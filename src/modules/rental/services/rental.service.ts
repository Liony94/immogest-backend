import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from '../../../entities/rental.entity';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { UpdateRentalDto } from '../dto/update-rental.dto';
import { IRentalService } from '../interfaces/rental.interface';
import { RentalType } from '../../../entities/enums/rentals/rental-type.enum';
import { PaymentFrequency } from '../../../entities/enums/rentals/payment-frequency.enum';
import { PaymentType } from '../../../entities/enums/rentals/payment-type.enum';
import { ChargeType } from '../../../entities/enums/rentals/charge-type.enum';

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

  async findAll(userId: number): Promise<Rental[]> {
    return this.rentalRepository.find({
      relations: {
        property: {
          owner: true
        },
        tenant: true,
        paymentSchedules: true
      },
      where: {
        property: {
          owner: {
            id: userId
          }
        }
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

  async findByTenant(tenantId: number, userId: number): Promise<Rental[]> {
    return this.rentalRepository.find({
      where: { 
        tenant: { id: tenantId },
        property: {
          owner: {
            id: userId
          }
        }
      },
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

  // Nouvelles méthodes pour la gestion des révisions de loyer
  async updateRentRevision(id: number, enabled: boolean, index: string, period: number): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.rentRevisionEnabled = enabled;
    rental.rentRevisionIndex = index;
    rental.rentRevisionPeriod = period;
    return this.rentalRepository.save(rental);
  }

  // Méthode pour la gestion de l'encadrement des loyers
  async updateRentControl(
    id: number, 
    enabled: boolean, 
    referenceRent: number, 
    maxRent: number, 
    supplement: number, 
    justification: string
  ): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.rentControlEnabled = enabled;
    rental.referenceRent = referenceRent;
    rental.maxRent = maxRent;
    rental.rentSupplement = supplement;
    rental.rentSupplementJustification = justification;
    return this.rentalRepository.save(rental);
  }

  // Méthode pour la gestion des notifications
  async updateNotifications(
    id: number,
    notifyOwner: boolean,
    notifyTenant: boolean,
    notifyContractEnd: boolean
  ): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.notifyOwner = notifyOwner;
    rental.notifyTenant = notifyTenant;
    rental.notifyContractEnd = notifyContractEnd;
    return this.rentalRepository.save(rental);
  }

  // Méthode pour la gestion des travaux
  async updateWorks(
    id: number,
    ownerWorkAmount: number,
    ownerWorkDescription: string,
    tenantWorkAmount: number,
    tenantWorkDescription: string
  ): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.ownerWorkAmount = ownerWorkAmount;
    rental.ownerWorkDescription = ownerWorkDescription;
    rental.tenantWorkAmount = tenantWorkAmount;
    rental.tenantWorkDescription = tenantWorkDescription;
    return this.rentalRepository.save(rental);
  }

  // Méthode pour la gestion de la facturation
  async updateBilling(
    id: number,
    billingDay: number,
    separateBillingAddress: boolean,
    billingAddress: string,
    documentTitle: string,
    automaticNumbering: boolean,
    includeNoticeSecondPage: boolean,
    receiptText: string,
    noticeText: string
  ): Promise<Rental> {
    const rental = await this.findOne(id);
    rental.billingDay = billingDay;
    rental.separateBillingAddress = separateBillingAddress;
    rental.billingAddress = billingAddress;
    rental.documentTitle = documentTitle;
    rental.automaticNumbering = automaticNumbering;
    rental.includeNoticeSecondPage = includeNoticeSecondPage;
    rental.receiptText = receiptText;
    rental.noticeText = noticeText;
    return this.rentalRepository.save(rental);
  }
} 