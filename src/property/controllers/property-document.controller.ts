import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
  UnauthorizedException,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { PropertyService } from '../property.service';
import { CreatePropertyDocumentDto } from '../dto/create-property-document.dto';
import { UpdatePropertyDocumentDto } from '../dto/update-property-document.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { documentInterceptorOptions } from '../../interceptors/file.interceptor';

@ApiTags('Documents des propriétés')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyDocumentController {
  constructor(private readonly propertyService: PropertyService) {}

  private async checkPropertyOwnership(propertyId: number, userId: number): Promise<void> {
    const property = await this.propertyService.findOne(propertyId);
    if (property.owner.id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
  }

  @Post(':id/document')
  @ApiOperation({ summary: 'Ajouter un document à une propriété' })
  @ApiResponse({ status: 201, description: 'Document ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou manquant' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Mettre à jour les informations d\'un document' })
  @ApiResponse({ status: 200, description: 'Document mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
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
  @ApiOperation({ summary: 'Mettre à jour le fichier d\'un document' })
  @ApiResponse({ status: 200, description: 'Fichier mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou manquant' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiResponse({ status: 200, description: 'Document supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
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