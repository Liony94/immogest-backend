import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { RentalService } from '../services/rental.service';
import { CreateRentalDto } from '../dto/create-rental.dto';
import { UpdateRentalDto } from '../dto/update-rental.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CheckOwnership } from '../../../core/decorators/check-ownership.decorator';
import { PropertyOwnershipService } from '../services/property-ownership.service';

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Post()
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async create(
    @Body() createRentalDto: CreateRentalDto,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      idField: 'propertyId',
      fromBody: true,
      errorMessage: 'Vous n\'êtes pas autorisé à créer une location pour cette propriété'
    }) isOwner: boolean
  ) {
    return this.rentalService.create(createRentalDto);
  }

  @Get()
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findAll(@Req() req) {
    return this.rentalService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findOne(
    @Param('id') id: string,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à voir cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.findOne(+id);
  }

  @Get('property/:propertyId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      idField: 'propertyId',
      errorMessage: 'Vous n\'êtes pas autorisé à voir les locations de cette propriété'
    }) isOwner: boolean
  ) {
    return this.rentalService.findByProperty(+propertyId);
  }

  @Get('tenant/:tenantId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async findByTenant(
    @Param('tenantId') tenantId: string,
    @Req() req
  ) {
    return this.rentalService.findByTenant(+tenantId, req.user.id);
  }

  @Put(':id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async update(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalDto,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à modifier cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.update(+id, updateRentalDto);
  }

  @Delete(':id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async remove(
    @Param('id') id: string,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à supprimer cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.remove(+id);
  }

  @Put(':id/activate')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async activate(
    @Param('id') id: string,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à activer cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.activate(+id);
  }

  @Put(':id/deactivate')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async deactivate(
    @Param('id') id: string,
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à désactiver cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.deactivate(+id);
  }

  @Post(':id/furniture')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async addFurniture(
    @Param('id') id: string,
    @Body() body: { furniture: string[] },
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à modifier les meubles de cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.addFurniture(+id, body.furniture);
  }

  @Delete(':id/furniture')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async removeFurniture(
    @Param('id') id: string,
    @Body() body: { furniture: string[] },
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à modifier les meubles de cette location'
    }) isOwner: boolean
  ) {
    return this.rentalService.removeFurniture(+id, body.furniture);
  }

  @Post(':id/check-in')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async checkIn(
    @Param('id') id: string,
    @Body() body: { notes: string },
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à effectuer l\'état des lieux d\'entrée'
    }) isOwner: boolean
  ) {
    return this.rentalService.updateCheckIn(+id, body.notes);
  }

  @Post(':id/check-out')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async checkOut(
    @Param('id') id: string,
    @Body() body: { notes: string },
    @CheckOwnership({
      serviceClass: PropertyOwnershipService,
      verifyMethod: 'verifyPropertyOwner',
      errorMessage: 'Vous n\'êtes pas autorisé à effectuer l\'état des lieux de sortie'
    }) isOwner: boolean
  ) {
    return this.rentalService.updateCheckOut(+id, body.notes);
  }
} 