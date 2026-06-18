import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

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
    return this.invoicesService.recordUsageAndCreateInvoice(dto);
  }

  // 2. READ: Xem danh sách hóa đơn (Admin xem hết, Student xem của phòng mình)
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const { role, room_id } = req.user;
    return this.invoicesService.findAll(role, room_id);
  }

  // READ: Xem chi tiết hóa đơn cụ thể
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req: any) {
    const { role, room_id } = req.user;
    return this.invoicesService.findOne(id, role, room_id);
  }

  // 3. UPDATE: Cập nhật hóa đơn (Chỉ Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: number, @Body() updateDto: any) {
    return this.invoicesService.update(id, updateDto);
  }

  // UPDATE: Xác nhận thanh toán thủ công (Chỉ Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: number) {
    return this.invoicesService.confirmPayment(id);
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
