import { Injectable } from '@nestjs/common';
import { Room, RoomStatus } from './room.entity';

/**
 * RoomStatusService - Xác định trạng thái phòng
 * 
 * Nhiệm vụ:
 * - Tính toán trạng thái phòng dựa trên occupancy
 * - Tính toán số chỗ trống còn lại
 * - Tính toán % lấp đầy phòng
 * 
 * Quy tắc:
 * - EMPTY: currentOccupancy = 0 (trống hoàn toàn)
 * - AVAILABLE: 0 < currentOccupancy < maxCapacity (còn chỗ)
 * - FULL: currentOccupancy = maxCapacity (đầy, không còn chỗ)
 */
@Injectable()
export class RoomStatusService {
  /**
   * Xác định trạng thái của một phòng
   * @param room Thông tin phòng
   * @returns Trạng thái phòng (full, available, empty)
   */
  getStatus(room: Room): RoomStatus {
    if (room.currentOccupancy === 0) {
      return RoomStatus.EMPTY;
    } else if (room.currentOccupancy >= room.maxCapacity) {
      return RoomStatus.FULL;
    } else {
      return RoomStatus.AVAILABLE;
    }
  }

  /**
   * Tính số chỗ trống còn lại trong phòng
   * @param room Thông tin phòng
   * @returns Số lượng chỗ trống
   */
  getAvailableSlots(room: Room): number {
    const available = room.maxCapacity - room.currentOccupancy;
    return available > 0 ? available : 0;
  }

  /**
   * Tính % lấp đầy của phòng
   * @param room Thông tin phòng
   * @returns Phần trăm lấp đầy (0-100)
   */
  getOccupancyPercentage(room: Room): number {
    if (room.maxCapacity === 0) return 0;
    return Math.round((room.currentOccupancy / room.maxCapacity) * 100);
  }

  /**
   * Kiểm tra phòng có đầy không
   * @param room Thông tin phòng
   * @returns true nếu phòng đầy, false nếu còn chỗ
   */
  isFull(room: Room): boolean {
    return this.getStatus(room) === RoomStatus.FULL;
  }

  /**
   * Kiểm tra phòng có trống không
   * @param room Thông tin phòng
   * @returns true nếu phòng trống hoàn toàn
   */
  isEmpty(room: Room): boolean {
    return this.getStatus(room) === RoomStatus.EMPTY;
  }

  /**
   * Kiểm tra phòng có còn chỗ không
   * @param room Thông tin phòng
   * @returns true nếu phòng còn chỗ trống
   */
  hasAvailableSlots(room: Room): boolean {
    return this.getAvailableSlots(room) > 0;
    // hoặc: return !this.isFull(room);
  }

  /**
   * Thêm một người vào phòng
   * @param room Thông tin phòng
   * @returns Room được cập nhật hoặc throw error nếu phòng đầy
   */
  addOccupant(room: Room, now: Date = new Date()): Room {
    if (this.isFull(room)) {
      throw new Error(`Cannot add occupant: Room ${room.roomNumber} is full`);
    }
    return { ...room, currentOccupancy: room.currentOccupancy + 1, updatedAt: now };
  }

  /**
   * Xóa một người khỏi phòng
   * @param room Thông tin phòng
   * @returns Room được cập nhật hoặc throw error nếu phòng đã trống
   */
  removeOccupant(room: Room, now: Date = new Date()): Room {
    if (this.isEmpty(room)) {
      throw new Error(`Cannot remove occupant: Room ${room.roomNumber} is already empty`);
    }
    return {
      ...room,
      currentOccupancy: room.currentOccupancy - 1,
      updatedAt: new Date(),
    };
  }
}
