#!/bin/bash

# API Test Script for DomitoryManagement
# Chạy: bash test-api.sh

BASE_URL="http://localhost:3000"

echo "======================================"
echo "PHASE 1 - API TEST SCRIPT"
echo "======================================"
echo ""

# === TEST 1: Tạo Tòa Nhà ===
echo "1️⃣ TEST: Tạo tòa nhà"
echo "---"
curl -X POST "$BASE_URL/buildings" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tòa A",
    "description": "Tòa nhà A - Khu ký túc xá phía Bắc"
  }' | jq .
echo ""

# === TEST 2: Lấy danh sách tòa nhà ===
echo "2️⃣ TEST: Lấy danh sách tất cả tòa nhà"
echo "---"
curl -X GET "$BASE_URL/buildings" | jq .
echo ""

# === TEST 3: Tạo phòng (phòng đầy) ===
echo "3️⃣ TEST: Tạo phòng đầy (4/4)"
echo "---"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 4
  }' | jq .
echo ""

# === TEST 4: Tạo phòng (phòng còn chỗ) ===
echo "4️⃣ TEST: Tạo phòng còn chỗ (2/4)"
echo "---"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "102",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 2
  }' | jq .
echo ""

# === TEST 5: Tạo phòng trống ===
echo "5️⃣ TEST: Tạo phòng trống (0/4)"
echo "---"
curl -X POST "$BASE_URL/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "103",
    "buildingId": 1,
    "roomType": "4 người",
    "originalPrice": 1000000,
    "maxCapacity": 4,
    "currentOccupancy": 0
  }' | jq .
echo ""

# === TEST 6: Lấy danh sách phòng theo tòa nhà (với status) ===
echo "6️⃣ TEST: Lấy danh sách phòng tòa A (kèm status)"
echo "---"
echo "✅ Kỳ vọng kết quả:"
echo "  - Phòng 101: status='full' (đỏ), availableSlots=0, occupancyPercentage=100"
echo "  - Phòng 102: status='available' (xanh), availableSlots=2, occupancyPercentage=50"
echo "  - Phòng 103: status='empty' (vàng), availableSlots=4, occupancyPercentage=0"
echo ""
curl -X GET "$BASE_URL/rooms/building/1" | jq .
echo ""

# === TEST 7: Lấy chi tiết một phòng ===
echo "7️⃣ TEST: Lấy chi tiết phòng ID 1"
echo "---"
curl -X GET "$BASE_URL/rooms/1" | jq .
echo ""

# === TEST 8: Cập nhật occupancy phòng ===
echo "8️⃣ TEST: Cập nhật occupancy phòng 102 (từ 2 → 3)"
echo "---"
curl -X PUT "$BASE_URL/rooms/2" \
  -H "Content-Type: application/json" \
  -d '{
    "currentOccupancy": 3
  }' | jq .
echo ""

# === TEST 9: Lấy danh sách phòng lại để xem thay đổi ===
echo "9️⃣ TEST: Xem danh sách phòng sau khi cập nhật"
echo "---"
curl -X GET "$BASE_URL/rooms/building/1" | jq .
echo ""

echo "======================================"
echo "✅ Kiểm tra các điểm:"
echo "======================================"
echo "1. ✅ Phòng đầy (101): status='full', availableSlots=0, occupancyPercentage=100%"
echo "2. ✅ Phòng còn chỗ (102): status='available', availableSlots=1, occupancyPercentage=75%"
echo "3. ✅ Phòng trống (103): status='empty', availableSlots=4, occupancyPercentage=0%"
echo ""
