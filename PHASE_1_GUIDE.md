# PHASE 1 - BACKEND SETUP GUIDE

## ✅ Công việc đã hoàn thành

### 1. **Tạo Entity Files**
- ✅ `src/pages/Room/room.entity.ts` - Định nghĩa cấu trúc Room + RoomStatus enum
- ✅ `src/pages/Buildings/building.entity.ts` - Định nghĩa cấu trúc Building

### 2. **Tạo Service cho Status**
- ✅ `src/pages/Room/room-status.service.ts` - Logic xác định trạng thái phòng
  - `getStatus(room)` → 'full' | 'available' | 'empty'
  - `getAvailableSlots(room)` → số chỗ trống còn lại
  - `getOccupancyPercentage(room)` → % lấp đầy (0-100)
  - `isFull(room)` → kiểm tra phòng có đầy không
  - `isEmpty(room)` → kiểm tra phòng trống không
  - `hasAvailableSlots(room)` → kiểm tra có còn chỗ không

### 3. **Cập nhật Services**
- ✅ `room.service.ts` - Inject RoomStatusService
- ✅ `building.service.ts` - Cải tiến (thêm entity, error handling, timestamps)

### 4. **Cập nhật Controllers**
- ✅ `room.controller.ts`
  - Thêm method `enrichRoomWithStatus()` để thêm status vào response
  - Tất cả các GET endpoint trả về: room data + status + availableSlots + occupancyPercentage
  
- ✅ `building.controller.ts`
  - Thêm import Building entity

### 5. **Cập nhật Modules**
- ✅ `room.module.ts` - Thêm RoomStatusService vào providers

---

## 🧪 Cách Test Phase 1

### Cách 1: Dùng Script Tự động (Khuyến nghị)

```bash
# 1. Khởi động server
npm run start:dev

# 2. Ở terminal khác, chạy script test
bash test-api.sh
```

### Cách 2: Dùng Postman/Insomnia

**Tạo collection với các request sau:**

#### 1️⃣ Tạo Tòa Nhà
```
POST http://localhost:3000/buildings
Content-Type: application/json

{
  "name": "Tòa A",
  "description": "Tòa nhà A - Khu ký túc xá phía Bắc"
}
```

**Kỳ vọng Response:**
```json
{
  "id": 1,
  "name": "Tòa A",
  "description": "Tòa nhà A - Khu ký túc xá phía Bắc",
  "createdAt": "2025-06-15T10:30:00.000Z",
  "updatedAt": "2025-06-15T10:30:00.000Z"
}
```

#### 2️⃣ Lấy Danh Sách Tòa Nhà
```
GET http://localhost:3000/buildings
```

#### 3️⃣ Tạo Phòng ĐẦY (4/4)
```
POST http://localhost:3000/rooms
Content-Type: application/json

{
  "roomNumber": "101",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 4
}
```

**Kỳ vọng Response:**
```json
{
  "id": 1,
  "roomNumber": "101",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 4,
  "createdAt": "2025-06-15T10:31:00.000Z",
  "updatedAt": "2025-06-15T10:31:00.000Z",
  "status": "full",              // ← QUAN TRỌNG
  "availableSlots": 0,           // ← QUAN TRỌNG
  "occupancyPercentage": 100     // ← QUAN TRỌNG
}
```

#### 4️⃣ Tạo Phòng CÒN CHỖ (2/4)
```
POST http://localhost:3000/rooms
Content-Type: application/json

{
  "roomNumber": "102",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 2
}
```

**Kỳ vọng Response:**
```json
{
  "id": 2,
  "roomNumber": "102",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 2,
  "createdAt": "2025-06-15T10:32:00.000Z",
  "updatedAt": "2025-06-15T10:32:00.000Z",
  "status": "available",         // ← QUAN TRỌNG
  "availableSlots": 2,           // ← QUAN TRỌNG
  "occupancyPercentage": 50      // ← QUAN TRỌNG
}
```

#### 5️⃣ Tạo Phòng TRỐNG (0/4)
```
POST http://localhost:3000/rooms
Content-Type: application/json

{
  "roomNumber": "103",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 0
}
```

**Kỳ vọng Response:**
```json
{
  "id": 3,
  "roomNumber": "103",
  "buildingId": 1,
  "roomType": "4 người",
  "originalPrice": 1000000,
  "maxCapacity": 4,
  "currentOccupancy": 0,
  "createdAt": "2025-06-15T10:33:00.000Z",
  "updatedAt": "2025-06-15T10:33:00.000Z",
  "status": "empty",             // ← QUAN TRỌNG
  "availableSlots": 4,           // ← QUAN TRỌNG
  "occupancyPercentage": 0       // ← QUAN TRỌNG
}
```

#### 6️⃣ Lấy Danh Sách Phòng Tòa Nhà (KỲ VỌNG - YÊU CẦU CỤ THỂ)
```
GET http://localhost:3000/rooms/building/1
```

**Kỳ vọng Response:**
```json
[
  {
    "id": 1,
    "roomNumber": "101",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 4,
    "createdAt": "2025-06-15T10:31:00.000Z",
    "updatedAt": "2025-06-15T10:31:00.000Z",
    "status": "full",
    "availableSlots": 0,
    "occupancyPercentage": 100
  },
  {
    "id": 2,
    "roomNumber": "102",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 2,
    "createdAt": "2025-06-15T10:32:00.000Z",
    "updatedAt": "2025-06-15T10:32:00.000Z",
    "status": "available",
    "availableSlots": 2,
    "occupancyPercentage": 50
  },
  {
    "id": 3,
    "roomNumber": "103",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 0,
    "createdAt": "2025-06-15T10:33:00.000Z",
    "updatedAt": "2025-06-15T10:33:00.000Z",
    "status": "empty",
    "availableSlots": 4,
    "occupancyPercentage": 0
  }
]
```

---

## ✨ Những Điểm Cần Verify

### ✅ Verify Points:

1. **Status Field:**
   - Phòng đầy (currentOccupancy === maxCapacity) → `status: "full"` ✅
   - Phòng còn chỗ (0 < currentOccupancy < maxCapacity) → `status: "available"` ✅
   - Phòng trống (currentOccupancy === 0) → `status: "empty"` ✅

2. **Available Slots Field:**
   - Tính toán chính xác: `availableSlots = maxCapacity - currentOccupancy` ✅

3. **Occupancy Percentage Field:**
   - Tính toán chính xác: `occupancyPercentage = (currentOccupancy / maxCapacity) * 100` ✅

4. **Timestamps:**
   - Mỗi room/building có `createdAt` và `updatedAt` ✅

5. **API Response:**
   - Tất cả endpoint GET trả về status info ✅
   - Endpoint POST/PUT cũng trả về status info ✅

---

## 🚀 Tiếp Theo: Phase 2

Sau khi verify xong Phase 1, ta sẽ:
1. Tạo Frontend (React component)
2. Gọi API từ Frontend
3. Hiển thị sơ đồ tòa nhà
4. Click → hiển thị danh sách phòng với màu sắc

