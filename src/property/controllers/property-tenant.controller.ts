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
import { PropertyService } from '../property.service';
import { AddTenantsDto } from '../dto/add-tenants.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Locataires des propriétés')
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyTenantController {
  constructor(private readonly propertyService: PropertyService) {}

  private async checkPropertyOwnership(propertyId: number, userId: number): Promise<void> {
    const property = await this.propertyService.findOne(propertyId);
    if (property.owner.id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier cette propriété');
    }
  }

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
    await this.checkPropertyOwnership(id, req.user.id);
    return this.propertyService.addTenants(id, addTenantsDto.tenantIds);
  }
} 