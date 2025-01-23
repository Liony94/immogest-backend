import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
  UploadedFile,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreatePropertyAccessDto } from './dto/create-property-access.dto';
import { CreatePropertyDocumentDto } from './dto/create-property-document.dto';
import { UpdatePropertyAccessDto } from './dto/update-property-access.dto';
import { UpdatePropertyDocumentDto } from './dto/update-property-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { AddTenantsDto } from './dto/add-tenants.dto';
import { UPLOAD_CONFIG } from '../config/upload.config';
import { 
  imageInterceptorOptions, 
  documentInterceptorOptions 
} from '../interceptors/file.interceptor';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  // Vérification des autorisations
  private async checkPropertyOwnership(propertyId: number, userId: number): Promise<void> {
    const property = await this.propertyService.findOne(propertyId);
    if (property.owner.id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
  }

  // Endpoints de gestion des propriétés
  @Post()
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FilesInterceptor('images', UPLOAD_CONFIG.images.maxFiles, imageInterceptorOptions),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    if (files?.length > 0) {
      createPropertyDto.images = files.map(file => `/uploads/properties/images/${file.filename}`);
    }
    return this.propertyService.create(createPropertyDto, req.user.id);
  }

  @Get('owner')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findAll(@Request() req) {
    return this.propertyService.findPropertiesByOwner(req.user.id);
  }

  @Get(':id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cette propriété');
    }
    return property;
  }

  @Get('tenant/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findPropertiesByTenant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    const properties = await this.propertyService.findPropertiesByTenant(id);
    return properties.filter(property => property.owner.id === req.user.id);
  }

  // Endpoints de gestion des accès
  @Post(':id/access')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() createAccessDto: CreatePropertyAccessDto,
    @Request() req,
  ) {
    await this.checkPropertyOwnership(id, req.user.id);
    return this.propertyService.addAccess(id, createAccessDto);
  }

  @Put('access/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async updateAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccessDto: UpdatePropertyAccessDto,
    @Request() req,
  ) {
    const access = await this.propertyService.findAccessWithRelations(id);
    if (access.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cet accès');
    }
    return this.propertyService.updateAccess(id, updateAccessDto);
  }

  @Delete('access/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async deleteAccess(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const access = await this.propertyService.findAccessWithRelations(id);
    if (access.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer cet accès');
    }
    await this.propertyService.deleteAccess(id);
    return { message: 'Accès supprimé avec succès' };
  }

  // Endpoints de gestion des documents
  @Post(':id/document')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('file', documentInterceptorOptions))
  async addDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreatePropertyDocumentDto,
    @Request() req,
  ) {
    await this.checkPropertyOwnership(id, req.user.id);

    if (!file) {
      throw new BadRequestException('Le fichier est requis');
    }

    const documentData = {
      ...createDocumentDto,
      fileName: file.filename,
      fileUrl: `/uploads/properties/documents/${file.filename}`,
    };

    return this.propertyService.addDocument(id, documentData);
  }

  @Put('document/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async updateDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdatePropertyDocumentDto,
    @Request() req,
  ) {
    const document = await this.propertyService.findDocumentWithRelations(id);
    if (document.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier ce document');
    }
    return this.propertyService.updateDocument(id, updateDocumentDto);
  }

  @Put('document/:id/file')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(FileInterceptor('file', documentInterceptorOptions))
  async updateDocumentFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const document = await this.propertyService.findDocumentWithRelations(id);
    if (document.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier ce document');
    }
    if (!file) {
      throw new BadRequestException('Le fichier est requis');
    }
    return this.propertyService.updateDocumentFile(
      id,
      file.filename,
      `/uploads/properties/documents/${file.filename}`
    );
  }

  @Delete('document/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const document = await this.propertyService.findDocumentWithRelations(id);
    if (document.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer ce document');
    }
    await this.propertyService.deleteDocument(id);
    return { message: 'Document supprimé avec succès' };
  }

  // Endpoints de gestion des locataires
  @Post(':id/tenants')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addTenants(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTenantsDto: AddTenantsDto,
    @Request() req,
  ) {
    await this.checkPropertyOwnership(id, req.user.id);
    return this.propertyService.addTenants(id, addTenantsDto.tenantIds);
  }
}
