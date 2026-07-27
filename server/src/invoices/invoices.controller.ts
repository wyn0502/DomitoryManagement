import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) { }

  private mapInvoice(invoice: any) {
    if (!invoice) return null;
    const roomPrice = Number(invoice.room_fee || 0);
    const electricityAmount = Number(invoice.electricity_fee || 0);
    const waterAmount = Number(invoice.water_fee || 0);
    const totalAmount = Number(invoice.total_amount || 0);
    const { electricPrice, waterPrice } = this.invoicesService.getUtilityPrices();

    return {
      id: invoice.id,
      room_id: invoice.room_id,
      user_id: invoice.user_id,
      month: invoice.month,
      year: invoice.year,
      service_type: invoice.service_type || 'Điện nước',
      service_name: invoice.service_name || (invoice.service_type === 'Phòng' ? `Tiền phòng tháng ${invoice.month}/${invoice.year}` : `Tiền điện nước tháng ${invoice.month}/${invoice.year}`),
      content: invoice.content || '',
      room_price: roomPrice,
      electricity_amount: electricityAmount,
      water_amount: waterAmount,
      total_amount: totalAmount,
      status: invoice.status,
      due_date: invoice.due_date,
      paid_at: invoice.paid_at,
      created_at: invoice.created_at,
      room: invoice.room ? {
        id: invoice.room.id,
        room_name: invoice.room.room_name,
        type: invoice.room.type || 'Thường',
        capacity: invoice.room.capacity || 4,
        fixed_rent: Number(invoice.room.fixed_rent || 1500000),
      } : undefined,
      user: invoice.user ? {
        id: invoice.user.id,
        full_name: invoice.user.full_name || invoice.user.username,
        mssv: invoice.user.mssv || '—',
        cccd: invoice.user.cccd || '—',
        gender: invoice.user.gender || 'Nam',
        email: invoice.user.email,
        phone: invoice.user.phone || '—',
      } : undefined,
      utilityMeter: invoice.utilityMeter ? {
        id: invoice.utilityMeter.id,
        room_id: invoice.utilityMeter.room_id,
        month: invoice.utilityMeter.month,
        year: invoice.utilityMeter.year,
        electricity_new_index: invoice.utilityMeter.electricity_index,
        electricity_old_index: invoice.utilityMeter.electricity_index - (electricityAmount > 0 && electricPrice > 0 ? (electricityAmount / electricPrice) : 0),
        water_new_index: invoice.utilityMeter.water_index,
        water_old_index: invoice.utilityMeter.water_index - (waterAmount > 0 && waterPrice > 0 ? (waterAmount / waterPrice) : 0),
      } : undefined
    };
  }

  // 1. Static GET routes (phải đặt trước :id)
  @Get('utility-prices')
  getUtilityPrices() {
    return this.invoicesService.getUtilityPrices();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put('utility-prices')
  updateUtilityPrices(@Body() dto: { electricPrice?: number; waterPrice?: number }) {
    return this.invoicesService.updateUtilityPrices(dto);
  }

  // 2. Static POST routes
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('record-index')
  async recordUsage(@Body() dto: {
    room_id: number;
    month: number;
    year: number;
    electricity_index: number;
    water_index: number;
  }) {
    const invoices = await this.invoicesService.recordUsageAndCreateInvoice(dto);
    return invoices.map((inv) => this.mapInvoice(inv));
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post('create-room-fee')
  async createRoomFee(@Body() dto: { room_id?: number; month: number; year: number }) {
    const invoices = await this.invoicesService.createRoomFeeInvoices(dto);
    return invoices.map((inv) => this.mapInvoice(inv));
  }

  @Post('payos-webhook')
  async payosWebhook(@Body() body: any) {
    return this.invoicesService.handlePayosWebhook(body);
  }

  // 3. READ: Xem danh sách toàn bộ hóa đơn
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const { role, sub, room_id } = req.user;
    const list = await this.invoicesService.findAll(role, sub, room_id);
    return list.map(item => this.mapInvoice(item));
  }

  // 4. Parameterized routes (:id)
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Mã hóa đơn phải là số nguyên hợp lệ');
    }
    const { role, sub, room_id } = req.user;
    const invoice = await this.invoicesService.findOne(numericId, role, sub, room_id);
    return this.mapInvoice(invoice);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Mã hóa đơn phải là số nguyên hợp lệ');
    }
    const invoice = await this.invoicesService.update(numericId, updateDto);
    return this.mapInvoice(invoice);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Mã hóa đơn phải là số nguyên hợp lệ');
    }
    const invoice = await this.invoicesService.confirmPayment(numericId);
    return this.mapInvoice(invoice);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Mã hóa đơn phải là số nguyên hợp lệ');
    }
    await this.invoicesService.remove(numericId);
    return { message: `Xóa hóa đơn ID ${numericId} thành công` };
  }

  @UseGuards(AuthGuard)
  @Post(':id/payment-url')
  async getPayosPaymentUrl(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Mã hóa đơn phải là số nguyên hợp lệ');
    }
    const paymentUrl = await this.invoicesService.createPayosPaymentUrl(numericId);
    return { paymentUrl };
  }
}
