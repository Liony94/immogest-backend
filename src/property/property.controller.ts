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
  NotFoundException,
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
import { extname } from 'path';
import { diskStorage } from 'multer';
import { AddTenantsDto } from './dto/add-tenants.dto';

const UPLOAD_CONFIG = {
  images: {
    destination: './uploads/properties/images',
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: /(jpg|jpeg|png|gif)$/,
  },
  documents: {
    destination: './uploads/properties/documents',
    maxFileSize: 15 * 1024 * 1024, // 15MB
    allowedExtensions: /(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif)$/,
  }
};

const imageStorage = diskStorage({
  destination: UPLOAD_CONFIG.images.destination,
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const documentStorage = diskStorage({
  destination: UPLOAD_CONFIG.documents.destination,
  filename: (req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const imageFileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
  if (!file.originalname.toLowerCase().match(UPLOAD_CONFIG.images.allowedExtensions)) {
    return callback(new BadRequestException('Seuls les fichiers image sont autorisés!'), false);
  }
  callback(null, true);
};

const documentFileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
  if (!file.originalname.toLowerCase().match(UPLOAD_CONFIG.documents.allowedExtensions)) {
    return callback(new BadRequestException('Format de fichier non autorisé!'), false);
  }
  callback(null, true);
};

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FilesInterceptor('images', UPLOAD_CONFIG.images.maxFiles, {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: UPLOAD_CONFIG.images.maxFileSize,
      },
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    if (files && files.length > 0) {
      const imagePaths = files.map(file => `/uploads/properties/images/${file.filename}`);
      createPropertyDto.images = imagePaths;
    }

    return this.propertyService.create(createPropertyDto, req.user.id);
  }

  // Endpoints pour les accès
  @Post(':id/access')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() createAccessDto: CreatePropertyAccessDto,
    @Request() req,
  ) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
    return this.propertyService.addAccess(id, createAccessDto);
  }

  // Endpoints pour les documents
  @Post(':id/document')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: documentStorage,
      fileFilter: documentFileFilter,
      limits: {
        fileSize: UPLOAD_CONFIG.documents.maxFileSize,
      },
    }),
  )
  async addDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() createDocumentDto: CreatePropertyDocumentDto,
    @Request() req,
  ) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }

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

  @Post(':id/tenants')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addTenants(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTenantsDto: AddTenantsDto,
    @Request() req,
  ) {
    const property = await this.propertyService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
    return this.propertyService.addTenants(id, addTenantsDto.tenantIds);
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

  // Endpoints pour les accès
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

  // Endpoints pour les documents
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: documentStorage,
      fileFilter: documentFileFilter,
      limits: {
        fileSize: UPLOAD_CONFIG.documents.maxFileSize,
      },
    }),
  )
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
}
