import { Controller, Post, Body, Param, Get, Put, UseGuards, Res, BadRequestException, InternalServerErrorException, NotFoundException, Query, UnauthorizedException, Request, Delete, ForbiddenException, Req } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentScheduleService } from '../services/payment-schedule.service';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { CreatePaymentScheduleDto } from '../dto/create-payment-schedule.dto';
import { ReceiptService } from '../services/receipt.service';
import { Logger } from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RoleGuard } from 'src/core/guards/role.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentScheduleService: PaymentScheduleService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Get('schedules/owner')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getOwnerSchedules(@Request() req) {
    try {
      const schedules = await this.paymentScheduleService.findAll();
      if (!schedules) {
        return [];
      }
      return schedules.filter(schedule => 
        schedule.rental?.property?.owner?.id === req.user.id
      );
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des échéanciers: ${error.message}`);
      throw new InternalServerErrorException('Erreur lors de la récupération des échéanciers');
    }
  }

  @Post('schedules')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async createSchedule(@Body() createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return this.paymentScheduleService.create(createPaymentScheduleDto);
  }

  @Get('schedules')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getAllSchedules(@Request() req) {
    const schedules = await this.paymentScheduleService.findAll();
    return schedules.filter(schedule => schedule.rental?.property.owner.id === req.user.id);
  }

  @Get('schedules/:id')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getSchedule(@Param('id') id: number, @Request() req) {
    const schedule = await this.paymentScheduleService.findOne(id);
    if (schedule.rental?.property.owner.id !== req.user.id) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cet échéancier');
    }
    return schedule;
  }

  @Get('schedules/property/:propertyId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getSchedulesByProperty(@Param('propertyId') propertyId: number, @Request() req) {
    const schedules = await this.paymentScheduleService.findByPropertyId(propertyId);
    return schedules.filter(schedule => schedule.rental?.property.owner.id === req.user.id);
  }

  @Get('schedules/tenant/:tenantId')
  async getSchedulesByTenant(@Param('tenantId') tenantId: number) {
    return this.paymentScheduleService.findByTenantId(tenantId);
  }

  @Post(':id/record')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async recordPayment(
    @Param('id') id: number,
    @Body() recordPaymentDto: RecordPaymentDto,
  ) {
    return this.paymentService.recordPayment(id, recordPaymentDto);
  }

  @Put(':id/cancel')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async cancelPayment(@Param('id') id: number) {
    return this.paymentService.cancelPayment(id);
  }

  @Get('late')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getLatePayments(@Request() req) {
    const latePayments = await this.paymentScheduleService.getLatePayments();
    return latePayments.filter(payment => payment.paymentSchedule.rental?.property.owner.id === req.user.id);
  }

  @Get('statistics/:scheduleId')
  async getPaymentStatistics(@Param('scheduleId') scheduleId: number) {
    return this.paymentService.getPaymentStatistics(scheduleId);
  }

  @Post('update-late-status')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async updateLateStatus() {
    return this.paymentService.updateLatePaymentsStatus();
  }

  @Put(':id/archive')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async archivePayment(@Param('id') id: number) {
    return this.paymentService.archivePayment(id);
  }

  @Put(':id/unarchive')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async unarchivePayment(@Param('id') id: number) {
    return this.paymentService.unarchivePayment(id);
  }

  @Post('archive-multiple')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async archiveMultiplePayments(@Body() body: { paymentIds: number[] }) {
    return this.paymentService.archiveMultiplePayments(body.paymentIds);
  }

  @Get('archived')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getArchivedPayments() {
    return this.paymentService.getArchivedPayments();
  }

  @Get(':id/receipt/preview')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async previewReceipt(
    @Param('id') id: number,
    @Res() res: Response
  ) {
    try {
      const payment = await this.paymentService.findOne(id);
      
      if (!payment.paidAt) {
        throw new BadRequestException('Impossible de générer une quittance pour un paiement non effectué');
      }

      const pdfBuffer = await this.receiptService.previewReceipt(payment);
      
      const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      const fileName = `quittance_${month.replace(' ', '_')}_preview.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la prévisualisation de la quittance');
    }
  }

  @Get(':id/receipt')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async generateReceipt(
    @Param('id') id: number,
    @Res() res: Response
  ) {
    try {
      const payment = await this.paymentService.findOne(id);
      
      if (!payment.paidAt) {
        throw new BadRequestException('Impossible de générer une quittance pour un paiement non effectué');
      }

      const pdfBuffer = await this.receiptService.generateAndSaveReceipt(payment);
      
      const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      const fileName = `quittance_${month.replace(' ', '_')}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la génération de la quittance');
    }
  }

  @Get(':id/receipt/owner')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptForOwner(
    @Param('id') id: number,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const payment = await this.paymentService.findOne(id);
      
      if (payment.paymentSchedule.rental?.property.owner.id !== req.user.id) {
        throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cette quittance');
      }

      if (!payment.paidAt) {
        throw new BadRequestException('Impossible de générer une quittance pour un paiement non effectué');
      }

      const pdfBuffer = await this.receiptService.generateAndSaveReceipt(payment);
      
      const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      const fileName = `quittance_${month.replace(' ', '_')}.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la génération de la quittance');
    }
  }

  @Get('receipts')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getAllReceipts(
    @Request() req,
    @Query('propertyId') propertyId?: number,
    @Query('tenantId') tenantId?: number,
  ) {
    return this.receiptService.getAllReceipts(propertyId, tenantId, req.user.id);
  }

  @Get('receipts/property/:propertyId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByProperty(@Param('propertyId') propertyId: number, @Request() req) {
    const receipts = await this.receiptService.getReceiptsByProperty(propertyId);
    return receipts.filter(receipt => receipt.owner.id === req.user.id);
  }

  @Get('receipts/tenant/:tenantId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByTenant(@Param('tenantId') tenantId: number, @Request() req) {
    const receipts = await this.receiptService.getReceiptsByTenant(tenantId);
    return receipts.filter(receipt => receipt.owner.id === req.user.id);
  }

  @Get('receipts/owner/:ownerId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByOwner(@Param('ownerId') ownerId: number) {
    return this.receiptService.getReceiptsByOwner(ownerId);
  }

  @Get(':id/receipts')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByPayment(@Param('id') paymentId: number, @Request() req) {
    const receipts = await this.receiptService.getReceiptsByPayment(paymentId);
    return receipts.filter(receipt => receipt.owner.id === req.user.id);
  }

  @Get(':id/receipt/owner/preview')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async previewReceiptForOwner(
    @Param('id') id: number,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const payment = await this.paymentService.findOne(id);
      
      if (payment.paymentSchedule.rental?.property.owner.id !== req.user.id) {
        throw new UnauthorizedException('Vous n\'êtes pas autorisé à accéder à cette quittance');
      }

      if (!payment.paidAt) {
        throw new BadRequestException('Impossible de générer une quittance pour un paiement non effectué');
      }

      const pdfBuffer = await this.receiptService.previewReceipt(payment);
      
      const month = new Date(payment.dueDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      const fileName = `quittance_${month.replace(' ', '_')}_preview.pdf`;

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur lors de la prévisualisation de la quittance');
    }
  }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto, @Req() req) {
    const schedule = await this.paymentScheduleService.findOne(createPaymentDto.paymentScheduleId);
    
    if (!schedule) {
      throw new ForbiddenException('Échéancier non trouvé');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (schedule.rental?.property.owner.id !== req.user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à créer des paiements pour cet échéancier');
    }

    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  async findAll(@Req() req) {
    const schedules = await this.paymentScheduleService.findAll();
    return schedules.filter(schedule => schedule.rental?.property.owner.id === req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const schedule = await this.paymentScheduleService.findOne(+id);
    
    if (!schedule) {
      throw new ForbiddenException('Échéancier non trouvé');
    }

    if (schedule.rental?.property.owner.id !== req.user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à voir cet échéancier');
    }

    return schedule;
  }

  @Get('tenant/:tenantId')
  async findByTenant(@Param('tenantId') tenantId: string, @Req() req) {
    const schedules = await this.paymentScheduleService.findByTenantId(+tenantId);
    return schedules.filter(schedule => schedule.rental?.property.owner.id === req.user.id);
  }

  @Get('property/:propertyId')
  async findByProperty(@Param('propertyId') propertyId: string, @Req() req) {
    return this.paymentScheduleService.findByPropertyId(+propertyId);
  }

  @Get('late/all')
  async findAllLatePayments(@Req() req) {
    const latePayments = await this.paymentService.findAllLatePayments();
    return latePayments.filter(payment => payment.paymentSchedule.rental?.property.owner.id === req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req) {
    const payment = await this.paymentService.findOne(+id);
    
    if (!payment) {
      throw new ForbiddenException('Paiement non trouvé');
    }

    if (payment.paymentSchedule.rental?.property.owner.id !== req.user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce paiement');
    }

    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const payment = await this.paymentService.findOne(+id);
    
    if (!payment) {
      throw new ForbiddenException('Paiement non trouvé');
    }

    if (payment.paymentSchedule.rental?.property.owner.id !== req.user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce paiement');
    }

    return this.paymentService.remove(+id);
  }
} 