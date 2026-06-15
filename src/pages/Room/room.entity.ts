/**
 * Room Entity - Định nghĩa cấu trúc dữ liệu của Room trong database
 * Chứa tất cả các thuộc tính và dữ liệu của một phòng ký túc xá
 */

export enum RoomType {
  FOUR_PERSON = '4 người',
  SIX_PERSON = '6 người',
  EIGHT_PERSON = '8 người',
}

export enum RoomStatus {
  FULL = 'full',           // Phòng đầy, không còn chỗ
  AVAILABLE = 'available', // Phòng còn chỗ trống
  EMPTY = 'empty',         // Phòng trống hoàn toàn
}

export interface Room {
  // Basic Info
  id: number;
  roomNumber: string;           // Số phòng (ví dụ: '101', '202')
  buildingId: number;           // ID của tòa nhà
  roomType: RoomType;           // Loại phòng (4 người, 6 người, 8 người)
  originalPrice: number;        // Giá gốc của phòng
  
  // Capacity Info
  maxCapacity: number;          // Sức chứa tối đa
  currentOccupancy: number;     // Số người hiện tại ở trong phòng
  
  // Timestamps
  createdAt: Date;              // Thời điểm tạo
  updatedAt: Date;              // Thời điểm cập nhật lần cuối
}
