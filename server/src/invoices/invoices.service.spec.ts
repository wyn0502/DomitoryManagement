import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { ConfigService } from '@nestjs/config';

describe('InvoicesService Billing Calculation', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: 'INVOICE_REPOSITORY',
          useValue: {},
        },
        {
          provide: 'UTILITY_METER_REPOSITORY',
          useValue: {},
        },
        {
          provide: 'ROOM_REPOSITORY',
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ELECTRICITY_PRICE') return '3000';
              if (key === 'WATER_PRICE') return '15000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBilling', () => {
    it('should calculate billing correctly with valid readings', () => {
      const fixedRent = 1500000;
      const elecIndexNew = 150;
      const elecIndexOld = 50; // Tiêu thụ 100 kWh -> 100 * 3000 = 300,000
      const waterIndexNew = 30;
      const waterIndexOld = 20; // Tiêu thụ 10 m3 -> 10 * 15000 = 150,000

      // Tổng cộng: 1,500,000 + 300,000 + 150,000 = 1,950,000
      const result = service.calculateBilling(
        fixedRent,
        elecIndexNew,
        elecIndexOld,
        waterIndexNew,
        waterIndexOld,
      );

      expect(result.roomFee).toBe(fixedRent);
      expect(result.elecFee).toBe(300000);
      expect(result.waterFee).toBe(150000);
      expect(result.total).toBe(1950000);
    });

    it('should throw an error if electricity new index is smaller than old index', () => {
      expect(() => {
        service.calculateBilling(1500000, 100, 120, 20, 20);
      }).toThrow('Chỉ số mới không được nhỏ hơn chỉ số cũ');
    });

    it('should throw an error if water new index is smaller than old index', () => {
      expect(() => {
        service.calculateBilling(1500000, 100, 100, 20, 25);
      }).toThrow('Chỉ số mới không được nhỏ hơn chỉ số cũ');
    });
  });
});
