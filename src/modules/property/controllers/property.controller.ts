import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
  Param,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PropertyBaseService } from '../services/property-base.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UPLOAD_CONFIG } from '../../../config/upload.config';
import { imageInterceptorOptions } from '../../../core/interceptors/file.interceptor';
import { PropertyOwnershipService } from '../services/property-ownership.service';
import { PropertyTenantService } from '../services/property-tenant.service';

@ApiTags('Propriétés')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyBaseService: PropertyBaseService, private readonly propertyTenantService: PropertyTenantService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle propriété' })
  @ApiResponse({ status: 201, description: 'Propriété créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
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
    return this.propertyBaseService.create(createPropertyDto, req.user.id);
  }

  @Get('owner')
  @ApiOperation({ summary: 'Récupérer toutes les propriétés d\'un propriétaire' })
  @ApiResponse({ status: 200, description: 'Liste des propriétés récupérée avec succès' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findAll(@Request() req) {
    return this.propertyBaseService.findPropertiesByOwner(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une propriété par son ID' })
  @ApiResponse({ status: 200, description: 'Propriété récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const property = await this.propertyBaseService.findOne(id);
    if (property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cette propriété');
    }
    return property;
  }

  @Get('tenant/:id')
  @ApiOperation({ summary: 'Récupérer les propriétés d\'un locataire' })
  @ApiResponse({ status: 200, description: 'Liste des propriétés récupérée avec succès' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findPropertiesByTenant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    const properties = await this.propertyTenantService.findPropertiesByTenant(id);
    return properties.filter(property => property.owner.id === req.user.id);
  }
} 