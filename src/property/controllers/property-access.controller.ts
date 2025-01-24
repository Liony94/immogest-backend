import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PropertyBaseService } from '../services/property-base.service';
import { CreatePropertyAccessDto } from '../dto/create-property-access.dto';
import { UpdatePropertyAccessDto } from '../dto/update-property-access.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PropertyAccessService } from '../services/property-access.service';
import { PropertyOwnershipService } from '../services/property-ownership.service';

@ApiTags('Accès aux propriétés')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyAccessController {
  constructor(private readonly propertyBaseService: PropertyBaseService, private readonly propertyAccessService: PropertyAccessService, private readonly propertyOwnershipService: PropertyOwnershipService) {}

  @Post(':id/access')
  @ApiOperation({ summary: 'Ajouter un accès à une propriété' })
  @ApiResponse({ status: 201, description: 'Accès ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() createAccessDto: CreatePropertyAccessDto,
    @Request() req,
  ) {
    await this.propertyOwnershipService.checkPropertyOwnership(id, req.user.id);
    return this.propertyAccessService.addAccess(id, createAccessDto);
  }

  @Put('access/:id')
  @ApiOperation({ summary: 'Mettre à jour un accès' })
  @ApiResponse({ status: 200, description: 'Accès mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Accès non trouvé' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async updateAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccessDto: UpdatePropertyAccessDto,
    @Request() req,
  ) {
    const access = await this.propertyAccessService.findAccessWithRelations(id);
    if (access.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cet accès');
    }
    return this.propertyAccessService.updateAccess(id, updateAccessDto);
  }

  @Delete('access/:id')
  @ApiOperation({ summary: 'Supprimer un accès' })
  @ApiResponse({ status: 200, description: 'Accès supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Accès non trouvé' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async deleteAccess(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const access = await this.propertyAccessService.findAccessWithRelations(id);
    if (access.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à supprimer cet accès');
    }
    await this.propertyAccessService.deleteAccess(id);
    return { message: 'Accès supprimé avec succès' };
  }
} 