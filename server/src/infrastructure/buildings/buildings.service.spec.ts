import { BuildingsService } from './buildings.service';

describe('BuildingsService', () => {
  let service: BuildingsService;

  beforeEach(() => {
    service = new BuildingsService();
  });

  it('should create, list, update, and delete buildings', () => {
    const created = service.create({
      name: 'Building A',
      address: '123 Nguyen Hue',
      description: 'Main dormitory block',
    });

    expect(created.id).toBeDefined();
    expect(service.findAll()).toHaveLength(1);

    const updated = service.update(created.id, {
      name: 'Building A Updated',
    });

    expect(updated.name).toBe('Building A Updated');

    expect(service.remove(created.id)).toBe(true);
    expect(service.findAll()).toHaveLength(0);
  });
});
