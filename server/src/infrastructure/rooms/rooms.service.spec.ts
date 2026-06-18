import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(() => {
    service = new RoomsService();
  });

  it('should manage room list for a building', () => {
    const room = service.create('building-1', {
      roomNumber: '101',
      capacity: 4,
      roomType: '4 người',
      price: 1200000,
    });

    expect(room.id).toBeDefined();
    expect(service.findByBuilding('building-1')).toHaveLength(1);

    const updated = service.update('building-1', room.id, {
      price: 1300000,
    });

    expect(updated.price).toBe(1300000);

    expect(service.remove('building-1', room.id)).toBe(true);
    expect(service.findByBuilding('building-1')).toHaveLength(0);
  });

  it('should reject assigning a resident when the room is full', () => {
    const room = service.create('building-1', {
      roomNumber: '102',
      capacity: 1,
      roomType: '4 người',
      price: 1000000,
    });

    service.assignResident('building-1', room.id);

    expect(() => service.assignResident('building-1', room.id)).toThrow(
      'Room is already full',
    );
  });
});
