import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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

    return {
      id: invoice.id,
      room_id: invoice.room_id,
      month: invoice.month,
      year: invoice.year,
      room_price: roomPrice,
      electricity_amount: electricityAmount,
      water_amount: waterAmount,
      total_amount: totalAmount,
      status: invoice.status,
      room: invoice.room ? { room_name: invoice.room.room_name } : undefined,
      utilityMeter: invoice.utilityMeter ? {
        id: invoice.utilityMeter.id,
        room_id: invoice.utilityMeter.room_id,
        month: invoice.utilityMeter.month,
        year: invoice.utilityMeter.year,
        electricity_new_index: invoice.utilityMeter.electricity_index,
        electricity_old_index: invoice.utilityMeter.electricity_index - (electricityAmount / 3000),
        water_new_index: invoice.utilityMeter.water_index,
        water_old_index: invoice.utilityMeter.water_index - (waterAmount / 15000),
      } : undefined
    };
  }

  // 1. CREATE: Nhập chỉ số và tạo hóa đơn (Chỉ Admin)
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
    const invoice = await this.invoicesService.recordUsageAndCreateInvoice(dto);
    return this.mapInvoice(invoice);
  }

  // 2. READ: Xem danh sách hóa đơn (Admin xem hết, Student xem của phòng mình)
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const { role, room_id } = req.user;
    const list = await this.invoicesService.findAll(role, room_id);
    return list.map(item => this.mapInvoice(item));
  }

  // READ: Xem chi tiết hóa đơn cụ thể
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req: any) {
    const { role, room_id } = req.user;
    const invoice = await this.invoicesService.findOne(id, role, room_id);
    return this.mapInvoice(invoice);
  }

  // 3. UPDATE: Cập nhật hóa đơn (Chỉ Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: any) {
    const invoice = await this.invoicesService.update(id, updateDto);
    return this.mapInvoice(invoice);
  }

  // UPDATE: Xác nhận thanh toán thủ công (Chỉ Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: number) {
    const invoice = await this.invoicesService.confirmPayment(id);
    return this.mapInvoice(invoice);
  }

  // 4. DELETE: Xóa hóa đơn (Chỉ Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.invoicesService.remove(id);
    return { message: `Xóa hóa đơn ID ${id} thành công` };
  }

  // 5. CỔNG THANH TOÁN PAYOS (DÀNH CHO SINH VIÊN & WEBHOOK)

  // API sinh link thanh toán QR VietQR qua PayOS
  @UseGuards(AuthGuard)
  @Post(':id/payment-url')
  async getPayosPaymentUrl(@Param('id') id: number) {
    const paymentUrl = await this.invoicesService.createPayosPaymentUrl(id);
    return { paymentUrl };
  }

  // API Webhook nhận kết quả từ PayOS (Public - Tự động đối soát)
  @Post('payos-webhook')
  async payosWebhook(@Body() body: any) {
    return this.invoicesService.handlePayosWebhook(body);
  }
}
