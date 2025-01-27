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
  updateCheckIn(id: number, notes: string): Promise<Rental>;
  updateCheckOut(id: number, notes: string): Promise<Rental>;
  updateRentRevision(id: number, enabled: boolean, index: string, period: number): Promise<Rental>;
  updateRentControl(
    id: number,
    enabled: boolean,
    referenceRent: number,
    maxRent: number,
    supplement: number,
    justification: string
  ): Promise<Rental>;
  updateNotifications(
    id: number,
    notifyOwner: boolean,
    notifyTenant: boolean,
    notifyContractEnd: boolean
  ): Promise<Rental>;
  updateWorks(
    id: number,
    ownerWorkAmount: number,
    ownerWorkDescription: string,
    tenantWorkAmount: number,
    tenantWorkDescription: string
  ): Promise<Rental>;
  updateBilling(
    id: number,
    billingDay: number,
    separateBillingAddress: boolean,
    billingAddress: string,
    documentTitle: string,
    automaticNumbering: boolean,
    includeNoticeSecondPage: boolean,
    receiptText: string,
    noticeText: string
  ): Promise<Rental>;
} 