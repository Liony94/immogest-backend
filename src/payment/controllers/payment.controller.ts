import { Controller, Post, Body, Param, Get, Put, UseGuards } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { PaymentScheduleService } from '../services/payment-schedule.service';
import { RecordPaymentDto } from '../dto/record-payment.dto';
import { CreatePaymentScheduleDto } from '../dto/create-payment-schedule.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { Roles } from '../../auth/decorators/roles.decorator';


@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentScheduleService: PaymentScheduleService,
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
} 