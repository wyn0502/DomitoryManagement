import { ResidentsService } from './residents.service';

describe('ResidentsService', () => {
  let service: ResidentsService;

  beforeEach(() => {
    service = new ResidentsService();
  });

  it('should create, list, update, and delete residents', () => {
    const created = service.create({
      fullName: 'Nguyen Van A',
      studentId: 'SV001',
      hometown: 'Ha Noi',
      phoneNumber: '0123456789',
      className: 'CNTT01',
    });

    expect(created.id).toBeDefined();
    expect(service.findAll()).toHaveLength(1);

    const updated = service.update(created.id, {
      phoneNumber: '0999888777',
    });

    expect(updated.phoneNumber).toBe('0999888777');

    expect(service.remove(created.id)).toBe(true);
    expect(service.findAll()).toHaveLength(0);
  });

  it('should report contract status correctly', () => {
    const created = service.create({
      fullName: 'Nguyen Thi B',
      studentId: 'SV002',
      hometown: 'Da Nang',
      phoneNumber: '0111222333',
      className: 'QTKD01',
      contractStartDate: '2026-01-01',
      contractEndDate: '2026-06-30',
    });

    const status = service.getContractStatus(created.id);

    expect(status.status).toBe('active');
  });
});
