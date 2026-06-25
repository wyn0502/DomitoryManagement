import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { UtilityMeter } from './entities/utility-meter.entity';
import { Room } from '../rooms/entities/room.entity';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';

@Injectable()
export class InvoicesService {
  constructor(
    @Inject('INVOICE_REPOSITORY')
    private invoiceRepository: Repository<Invoice>,
    @Inject('UTILITY_METER_REPOSITORY')
    private meterRepository: Repository<UtilityMeter>,
    @Inject('ROOM_REPOSITORY')
    private roomRepository: Repository<Room>,
    private configService: ConfigService,
  ) {}

  private getPayOSInstance(): PayOS {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID') || '8e2023a1-77a8-444a-8d18-7b98d24599a0';
    const apiKey = this.configService.get<string>('PAYOS_API_KEY') || '298fb492-2591-4475-8ea5-618d36006f1d';
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY') || 'fb97ea6b2dbf37803328e3b392ee958bf666bc0bd0f3f227b2b0a3c22b9c3f3a';
    return new PayOS(clientId, apiKey, checksumKey);
  }

  // 1. CREATE: Nhập chỉ số điện nước & tự động tạo hóa đơn
  async recordUsageAndCreateInvoice(dto: {
    room_id: number;
    month: number;
    year: number;
    electricity_index: number;
    water_index: number;
  }): Promise<Invoice> {
    const { room_id, month, year, electricity_index, water_index } = dto;

    const room = await this.roomRepository.findOne({ where: { id: room_id } });
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID ${room_id}`);
    }

    const existingMeter = await this.meterRepository.findOne({
      where: { room_id, month, year },
    });
    if (existingMeter) {
      throw new ConflictException(`Tháng ${month}/${year} của phòng này đã được ghi nhận chỉ số điện nước.`);
    }

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousMeter = await this.meterRepository.findOne({
      where: { room_id, month: prevMonth, year: prevYear },
    });

    let consumedElectricity = electricity_index;
    let consumedWater = water_index;

    if (previousMeter) {
      if (electricity_index < previousMeter.electricity_index || water_index < previousMeter.water_index) {
        throw new BadRequestException(
          `Chỉ số mới không được nhỏ hơn chỉ số tháng trước (Điện trước: ${previousMeter.electricity_index}, Nước trước: ${previousMeter.water_index})`,
        );
      }
      consumedElectricity = electricity_index - previousMeter.electricity_index;
      consumedWater = water_index - previousMeter.water_index;
    }

    const electricPrice = parseInt(this.configService.get('ELECTRICITY_PRICE') || '3000', 10);
    const waterPrice = parseInt(this.configService.get('WATER_PRICE') || '15000', 10);

    const electricity_fee = consumedElectricity * electricPrice;
    const water_fee = consumedWater * waterPrice;
    const room_fee = Number(room.fixed_rent);
    const total_amount = room_fee + electricity_fee + water_fee;

    const meter = this.meterRepository.create({
      room_id,
      month,
      year,
      electricity_index,
      water_index,
    });
    const savedMeter = await this.meterRepository.save(meter);

    // Sinh mã đơn hàng ngẫu nhiên duy nhất cho PayOS
    const payosOrderCode = Math.floor(100000 + Math.random() * 900000) + savedMeter.id;

    const invoice = this.invoiceRepository.create({
      room_id,
      utility_meter_id: savedMeter.id,
      month,
      year,
      room_fee,
      electricity_fee,
      water_fee,
      total_amount,
      status: 'unpaid',
      payos_order_code: payosOrderCode,
    });

    return this.invoiceRepository.save(invoice);
  }

  // 2. READ: Xem danh sách hóa đơn (Admin hoặc Student)
  async findAll(role: string, roomId?: number): Promise<Invoice[]> {
    if (role === 'admin') {
      return this.invoiceRepository.find({
        relations: ['room', 'utilityMeter'],
        order: { year: 'DESC', month: 'DESC' },
      });
    } else {
      if (!roomId) {
        return [];
      }
      return this.invoiceRepository.find({
        where: { room_id: roomId },
        relations: ['room', 'utilityMeter'],
        order: { year: 'DESC', month: 'DESC' },
      });
    }
  }

  async findOne(id: number, role: string, userRoomId?: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['room', 'utilityMeter'],
    });

    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn có ID ${id}`);
    }

    if (role !== 'admin' && invoice.room_id !== userRoomId) {
      throw new BadRequestException('Bạn không có quyền xem hóa đơn của phòng khác');
    }

    return invoice;
  }

  // 3. UPDATE: Cập nhật hóa đơn
  async update(id: number, updateDto: any): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id }, relations: ['utilityMeter', 'room'] });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn ID ${id}`);
    }

    if (updateDto.status) {
      invoice.status = updateDto.status;
    }

    if (updateDto.electricity_index !== undefined || updateDto.water_index !== undefined) {
      if (!invoice.utilityMeter) {
        throw new BadRequestException('Hóa đơn này không gắn liền với chỉ số điện nước nào.');
      }
      const meter = invoice.utilityMeter;
      if (updateDto.electricity_index !== undefined) {
        meter.electricity_index = updateDto.electricity_index;
      }
      if (updateDto.water_index !== undefined) {
        meter.water_index = updateDto.water_index;
      }
      await this.meterRepository.save(meter);

      const prevMonth = invoice.month === 1 ? 12 : invoice.month - 1;
      const prevYear = invoice.month === 1 ? invoice.year - 1 : invoice.year;
      const previousMeter = await this.meterRepository.findOne({
        where: { room_id: invoice.room_id, month: prevMonth, year: prevYear },
      });

      let consumedElectricity = meter.electricity_index;
      let consumedWater = meter.water_index;

      if (previousMeter) {
        consumedElectricity = meter.electricity_index - previousMeter.electricity_index;
        consumedWater = meter.water_index - previousMeter.water_index;
      }

      const electricPrice = parseInt(this.configService.get('ELECTRICITY_PRICE') || '3000', 10);
      const waterPrice = parseInt(this.configService.get('WATER_PRICE') || '15000', 10);

      invoice.electricity_fee = consumedElectricity * electricPrice;
      invoice.water_fee = consumedWater * waterPrice;
      invoice.total_amount = Number(invoice.room_fee) + invoice.electricity_fee + invoice.water_fee;
    }

    return this.invoiceRepository.save(invoice);
  }

  async confirmPayment(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn ID ${id}`);
    }
    invoice.status = 'paid';
    return this.invoiceRepository.save(invoice);
  }

  // 4. DELETE: Xóa hóa đơn
  async remove(id: number): Promise<void> {
    const invoice = await this.invoiceRepository.remove(
      await this.invoiceRepository.findOneOrFail({ where: { id }, relations: ['utilityMeter'] })
    );
    if (invoice.utilityMeter) {
      await this.meterRepository.remove(invoice.utilityMeter);
    }
  }

  // 5. CỔNG THANH TOÁN PAYOS INTEGRATION
  async createPayosPaymentUrl(invoiceId: number): Promise<string> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn ID ${invoiceId}`);
    }
    if (invoice.status === 'paid') {
      throw new BadRequestException('Hóa đơn này đã được thanh toán');
    }

    const payOS = this.getPayOSInstance();
    
    if (!invoice.payos_order_code) {
      invoice.payos_order_code = Math.floor(100000 + Math.random() * 900000) + invoice.id;
      await this.invoiceRepository.save(invoice);
    }

    const cancelUrl = this.configService.get('PAYOS_CANCEL_URL') || `http://localhost:5173/student-billing?status=cancel`;
    const returnUrl = this.configService.get('PAYOS_RETURN_URL') || `http://localhost:5173/student-billing?status=success`;
    
    const description = `Thanh toan KTX HD ${invoice.id}`.substring(0, 25);

    const paymentBody = {
      orderCode: Number(invoice.payos_order_code),
      amount: Math.round(Number(invoice.total_amount)),
      description: description,
      cancelUrl: cancelUrl,
      returnUrl: returnUrl,
    };

    try {
      const paymentLink = await payOS.createPaymentLink(paymentBody);
      return paymentLink.checkoutUrl;
    } catch (error) {
      throw new BadRequestException('Lỗi tạo cổng thanh toán PayOS: ' + (error.message || error));
    }
  }

  // Xử lý dữ liệu Webhook từ PayOS gửi về
  async handlePayosWebhook(body: any): Promise<any> {
    const payOS = this.getPayOSInstance();
    try {
      const verifiedData = payOS.verifyPaymentWebhookData(body);
      const orderCode = verifiedData.orderCode;
      
      const invoice = await this.invoiceRepository.findOne({ where: { payos_order_code: orderCode } });
      if (invoice && invoice.status !== 'paid') {
        invoice.status = 'paid';
        await this.invoiceRepository.save(invoice);
      }
      return { success: true, verifiedData };
    } catch (error) {
      throw new BadRequestException('Chữ ký webhook PayOS không hợp lệ: ' + error.message);
    }
  }

  // Phục vụ Unit Test tính tiền
  calculateBilling(fixedRent: number, elecIndexNew: number, elecIndexOld: number, waterIndexNew: number, waterIndexOld: number, elecUnitPrice = 3000, waterUnitPrice = 15000) {
    if (elecIndexNew < elecIndexOld || waterIndexNew < waterIndexOld) {
      throw new Error('Chỉ số mới không được nhỏ hơn chỉ số cũ');
    }
    const elecUsage = elecIndexNew - elecIndexOld;
    const waterUsage = waterIndexNew - waterIndexOld;
    const elecFee = elecUsage * elecUnitPrice;
    const waterFee = waterUsage * waterUnitPrice;
    return {
      roomFee: fixedRent,
      elecFee,
      waterFee,
      total: fixedRent + elecFee + waterFee,
    };
  }
}
