import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PropertyTenantService } from '../services/property-tenant.service';
import { AddTenantsDto } from '../dto/add-tenants.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { PropertyBaseService } from '../services/property-base.service';
import { PropertyOwnershipService } from '../services/property-ownership.service';

@ApiTags('Locataires des propriétés')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyTenantController {
  constructor(private readonly propertyTenantService: PropertyTenantService, private readonly propertyOwnershipService: PropertyOwnershipService) {}


  @Post(':id/tenants')
  @ApiOperation({ summary: 'Ajouter des locataires à une propriété' })
  @ApiResponse({ status: 201, description: 'Locataires ajoutés avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addTenants(
    @Param('id', ParseIntPipe) id: number,
    @Body() addTenantsDto: AddTenantsDto,
    @Request() req,
  ) {
    await this.propertyOwnershipService.checkPropertyOwnership(id, req.user.id);
    return this.propertyTenantService.addTenants(id, addTenantsDto.tenantIds);
  }
} 