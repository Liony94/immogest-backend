import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Crée une nouvelle propriété
   * @param createPropertyDto - Les données de la propriété à créer
   * @param ownerId - L'ID du propriétaire
   * @returns La propriété créée
   */
  async create(createPropertyDto: CreatePropertyDto, ownerId: number): Promise<Property> {
    try {
      const owner = await this.findOwnerById(ownerId);
      
      // Vérification des images
      if (!createPropertyDto.images || !Array.isArray(createPropertyDto.images)) {
        throw new BadRequestException('Le tableau d\'images est requis');
      }

      console.log('Images à sauvegarder:', createPropertyDto.images); // Pour le débogage
      
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        owner,
        images: createPropertyDto.images,
      });

      const savedProperty = await this.propertyRepository.save(property);
      console.log('Propriété sauvegardée:', savedProperty); // Pour le débogage
      
      return savedProperty;
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la création du bien: ${error.message}`);
    }
  }

  /**
   * Ajoute des locataires à une propriété
   * @param propertyId - L'ID de la propriété
   * @param tenantIds - Les IDs des locataires à ajouter
   * @returns La propriété mise à jour
   */
  async addTenants(propertyId: number, tenantIds: number[]): Promise<Property> {
    const property = await this.findPropertyById(propertyId);
    const tenants = await this.findTenantsByIds(tenantIds);
    
    property.tenants = tenants;
    return this.propertyRepository.save(property);
  }

  /**
   * Récupère toutes les propriétés
   * @returns Liste des propriétés
   */
  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      relations: ['tenants', 'owner'],
    });
  }

  /**
   * Récupère les propriétés d'un propriétaire
   * @param ownerId - L'ID du propriétaire
   * @returns Liste des propriétés du propriétaire
   */
  async findPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['tenants', 'owner'],
    });
  }

  /**
   * Récupère une propriété par son ID
   * @param id - L'ID de la propriété
   * @returns La propriété trouvée
   */
  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['tenants', 'user'],
    });

    if (!property) {
      throw new NotFoundException(`Propriété avec l'ID ${id} non trouvée`);
    }

    return property;
  }

  /**
   * Récupère les propriétés d'un locataire
   * @param tenantId - L'ID du locataire
   * @returns Liste des propriétés du locataire
   */
  async findPropertiesByTenant(tenantId: number): Promise<Property[]> {
    return this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.tenants', 'tenants')
      .leftJoinAndSelect('property.user', 'owner')
      .where('tenants.id = :tenantId', { tenantId })
      .getMany();
  }

  // Méthodes privées utilitaires
  private async findOwnerById(ownerId: number): Promise<Owner> {
    const owner = await this.ownerRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException(`Propriétaire avec l'ID ${ownerId} non trouvé`);
    }
    return owner;
  }

  private async findPropertyById(propertyId: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['tenants'],
    });
    if (!property) {
      throw new NotFoundException(`Propriété avec l'ID ${propertyId} non trouvée`);
    }
    return property;
  }

  private async findTenantsByIds(tenantIds: number[]): Promise<Tenant[]> {
    const tenants = await Promise.all(
      tenantIds.map(async (id) => {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
          throw new NotFoundException(`Locataire avec l'ID ${id} non trouvé`);
        }
        return tenant;
      })
    );
    return tenants;
  }
}
