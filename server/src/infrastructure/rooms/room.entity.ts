export interface Room {
  id: string;
  buildingId: string;
  roomNumber: string;
  capacity: number;
  roomType: string;
  price: number;
  occupied: number;
  createdAt: string;
  updatedAt: string;
}
