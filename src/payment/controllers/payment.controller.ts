import { Controller, Post, Body, Param, Get, Put, UseGuards, Res, BadRequestException, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentScheduleService } from '../services/payment-schedule.service';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { CreatePaymentScheduleDto } from '../dto/create-payment-schedule.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReceiptService } from '../services/receipt.service';


@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentScheduleService: PaymentScheduleService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Post('schedules')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async createSchedule(@Body() createPaymentScheduleDto: CreatePaymentScheduleDto) {
    return this.paymentScheduleService.create(createPaymentScheduleDto);
  }

  @Get('schedules')
  async getAllSchedules() {
    return this.paymentScheduleService.findAll();
  }

  @Get('schedules/:id')
  async getSchedule(@Param('id') id: number) {
    return this.paymentScheduleService.findOne(id);
  }

  @Get('schedules/property/:propertyId')
  async getSchedulesByProperty(@Param('propertyId') propertyId: number) {
    return this.paymentScheduleService.findByProperty(propertyId);
  }

  @Get('schedules/tenant/:tenantId')
  async getSchedulesByTenant(@Param('tenantId') tenantId: number) {
    return this.paymentScheduleService.findByTenant(tenantId);
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
  async getLatePayments() {
    return this.paymentScheduleService.getLatePayments();
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

      const pdfBuffer = await this.receiptService.generateReceipt(payment);
      
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

  @Get('receipts')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getAllReceipts(
    @Query('propertyId') propertyId?: number,
    @Query('tenantId') tenantId?: number,
    @Query('ownerId') ownerId?: number
  ) {
    return this.receiptService.getAllReceipts(propertyId, tenantId, ownerId);
  }

  @Get('receipts/property/:propertyId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByProperty(@Param('propertyId') propertyId: number) {
    return this.receiptService.getReceiptsByProperty(propertyId);
  }

  @Get('receipts/tenant/:tenantId')
  @Roles('OWNER')
  @UseGuards(RoleGuard)
  async getReceiptsByTenant(@Param('tenantId') tenantId: number) {
    return this.receiptService.getReceiptsByTenant(tenantId);
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
  async getReceiptsByPayment(@Param('id') paymentId: number) {
    return this.receiptService.getReceiptsByPayment(paymentId);
  }
} 