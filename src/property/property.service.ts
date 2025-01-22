import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Owner } from '../entities/owner.entity';
import { Tenant } from '../entities/tenant.entity';
import { PropertyAccess } from '../entities/property-access.entity';
import { PropertyDocument } from '../entities/property-document.entity';
import { UpdatePropertyAccessDto } from './dto/update-property-access.dto';
import { UpdatePropertyDocumentDto } from './dto/update-property-document.dto';
import { CreatePropertyAccessDto } from './dto/create-property-access.dto';
import { CreatePropertyDocumentDto } from './dto/create-property-document.dto';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(PropertyAccess)
    private readonly propertyAccessRepository: Repository<PropertyAccess>,
    @InjectRepository(PropertyDocument)
    private readonly propertyDocumentRepository: Repository<PropertyDocument>,
  ) {}

  /**
   * Crée une nouvelle propriété
   * @param createPropertyDto - Les données de la propriété à créer
   * @param ownerId - L'ID du propriétaire
   * @returns La propriété créée
   */
  async create(createPropertyDto: CreatePropertyDto, ownerId: number): Promise<Property> {
    try {
      const owner = await this.ownerRepository.findOne({
        where: { id: ownerId }
      });

      if (!owner) {
        throw new NotFoundException(`Propriétaire avec l'ID ${ownerId} non trouvé`);
      }

      // Vérification de l'identifiant unique
      const existingProperty = await this.propertyRepository.findOne({
        where: { identifier: createPropertyDto.identifier }
      });

      if (existingProperty) {
        throw new BadRequestException(`Une propriété avec l'identifiant ${createPropertyDto.identifier} existe déjà`);
      }
      
      const property = this.propertyRepository.create({
        ...createPropertyDto,
        owner,
      });

      const savedProperty = await this.propertyRepository.save(property);
      return this.findOne(savedProperty.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
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
      relations: [
        'tenants',
        'owner',
        'accesses',
        'documents'
      ]
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
      relations: [
        'tenants',
        'owner',
        'accesses',
        'documents'
      ],
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
      relations: [
        'tenants',
        'owner',
        'accesses',
        'documents'
      ]
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
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.accesses', 'accesses')
      .leftJoinAndSelect('property.documents', 'documents')
      .where('tenants.id = :tenantId', { tenantId })
      .getMany();
  }

  // Méthodes pour les accès
  async addAccess(propertyId: number, accessData: CreatePropertyAccessDto): Promise<PropertyAccess> {
    const property = await this.findOne(propertyId);
    const access = this.propertyAccessRepository.create({
      ...accessData,
      property
    });
    return this.propertyAccessRepository.save(access);
  }

  async updateAccess(accessId: number, updateAccessDto: UpdatePropertyAccessDto): Promise<PropertyAccess> {
    const access = await this.propertyAccessRepository.findOne({
      where: { id: accessId },
      relations: ['property']
    });

    if (!access) {
      throw new NotFoundException(`Accès avec l'ID ${accessId} non trouvé`);
    }

    Object.assign(access, updateAccessDto);
    return this.propertyAccessRepository.save(access);
  }

  async deleteAccess(accessId: number): Promise<void> {
    const access = await this.propertyAccessRepository.findOne({
      where: { id: accessId }
    });

    if (!access) {
      throw new NotFoundException(`Accès avec l'ID ${accessId} non trouvé`);
    }

    await this.propertyAccessRepository.remove(access);
  }

  // Méthodes pour les documents
  async addDocument(propertyId: number, documentData: CreatePropertyDocumentDto & { fileName: string; fileUrl: string }): Promise<PropertyDocument> {
    const property = await this.findOne(propertyId);
    const document = this.propertyDocumentRepository.create({
      ...documentData,
      property
    });
    return this.propertyDocumentRepository.save(document);
  }

  async updateDocument(documentId: number, updateDocumentDto: UpdatePropertyDocumentDto): Promise<PropertyDocument> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['property']
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${documentId} non trouvé`);
    }

    Object.assign(document, updateDocumentDto);
    return this.propertyDocumentRepository.save(document);
  }

  async deleteDocument(documentId: number): Promise<void> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id: documentId }
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${documentId} non trouvé`);
    }

    // Supprimer le fichier physique
    try {
      const filePath = `.${document.fileUrl}`;
      await unlinkAsync(filePath);
    } catch (error) {
      console.error(`Erreur lors de la suppression du fichier: ${error.message}`);
    }

    await this.propertyDocumentRepository.remove(document);
  }

  async updateDocumentFile(documentId: number, fileName: string, fileUrl: string): Promise<PropertyDocument> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id: documentId }
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${documentId} non trouvé`);
    }

    // Supprimer l'ancien fichier
    try {
      const oldFilePath = `.${document.fileUrl}`;
      await unlinkAsync(oldFilePath);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ancien fichier: ${error.message}`);
    }

    // Mettre à jour avec le nouveau fichier
    document.fileName = fileName;
    document.fileUrl = fileUrl;
    return this.propertyDocumentRepository.save(document);
  }

  async findAccessWithRelations(accessId: number): Promise<PropertyAccess> {
    const access = await this.propertyAccessRepository.findOne({
      where: { id: accessId },
      relations: ['property', 'property.owner']
    });
    if (!access) {
      throw new NotFoundException(`Accès avec l'ID ${accessId} non trouvé`);
    }
    return access;
  }

  async findDocumentWithRelations(documentId: number): Promise<PropertyDocument> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['property', 'property.owner']
    });
    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${documentId} non trouvé`);
    }
    return document;
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
      relations: ['tenants', 'owner', 'accesses', 'documents']
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
