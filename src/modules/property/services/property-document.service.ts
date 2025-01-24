import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyDocument } from '../../../entities/property-document.entity';
import { CreatePropertyDocumentDto } from '../dto/create-property-document.dto';
import { UpdatePropertyDocumentDto } from '../dto/update-property-document.dto';
import { PropertyBaseService } from './property-base.service';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class PropertyDocumentService {
  constructor(
    @InjectRepository(PropertyDocument)
    private readonly propertyDocumentRepository: Repository<PropertyDocument>,
    private readonly propertyBaseService: PropertyBaseService,
  ) {}

  async findAll(): Promise<PropertyDocument[]> {
    return this.propertyDocumentRepository.find({
      relations: ['property']
    });
  }

  async findOne(id: number): Promise<PropertyDocument> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id },
      relations: ['property']
    });
    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} non trouvé`);
    }
    return document;
  }

  async addDocument(propertyId: number, documentData: CreatePropertyDocumentDto & { fileName: string; fileUrl: string }): Promise<PropertyDocument> {
    const property = await this.propertyBaseService.findOne(propertyId);
    const document = this.propertyDocumentRepository.create({
      ...documentData,
      property
    });
    return this.propertyDocumentRepository.save(document);
  }

  async updateDocument(documentId: number, updateDocumentDto: UpdatePropertyDocumentDto): Promise<PropertyDocument> {
    const document = await this.findDocumentWithRelations(documentId);
    Object.assign(document, updateDocumentDto);
    return this.propertyDocumentRepository.save(document);
  }

  async deleteDocument(documentId: number): Promise<void> {
    const document = await this.findDocumentWithRelations(documentId);

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
    const document = await this.findDocumentWithRelations(documentId);

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

  async findDocumentWithRelations(documentId: number): Promise<PropertyDocument> {
    const document = await this.propertyDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['property']
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${documentId} non trouvé`);
    }

    return document;
  }
} 