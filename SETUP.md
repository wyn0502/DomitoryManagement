# Dormitory Management System - Setup Guide

## Project Overview

Hệ thống quản lý ký túc xá (KTX) với các chức năng:

### Phần 1: Quản lý Trang thiết bị trong phòng (Assets)
- API CRUD danh mục tài sản KTX (Giường tầng, Điều hòa, Quạt, Tủ lạnh...)
- API phân bổ tài sản vào từng phòng
- Sinh viên xem phòng mình có những thiết bị gì và tình trạng (Mới/Cũ/Hỏng)

### Phần 2: Hệ thống Báo cáo sự cố / Sửa chữa (Ticket System)
- API cho Sinh viên gửi yêu cầu sửa chữa (mô tả, mức độ khẩn cấp, ảnh đính kèm)
- API cho Admin: xem danh sách sự cố theo trạng thái, chuyển trạng thái
- Cơ chế upload ảnh
- Phân quyền: chỉ Admin thay đổi trạng thái

### Phần 3: Bảng tin & Thông báo (Announcements)
- API cho Admin đăng thông báo (Tiêu đề, nội dung, ngày đăng)
- Hiển thị danh sách thông báo cho Sinh viên
- Phân quyền: chỉ Admin đăng thông báo

---

## Prerequisites

- Node.js (v18 hoặc cao hơn)
- npm hoặc yarn
- SQLite 3 (hoặc bất kỳ database nào mà bạn muốn dùng)

---

## Installation Steps

### 1. Clone hoặc Tải Project
```bash
cd /workspaces/DomitoryManagement
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình Database (Prisma)

#### 3.1 Setup Prisma
```bash
# Generate Prisma Client
npx prisma generate

# Tạo database và tables từ schema
npx prisma migrate dev --name init
```

#### 3.2 Kiểm tra Database (Optional)
```bash
# Xem/chỉnh sửa data bằng Prisma Studio
npx prisma studio
```

### 4. Tạo thư mục cho upload files
```bash
mkdir -p uploads/tickets
```

---

## Running the Application

### Development Mode
```bash
npm run start:dev
```

Server sẽ chạy trên: `http://localhost:3000`

### Production Build
```bash
npm run build
npm run start:prod
```

---

## Project Structure

```
src/
├── auth/                           # Authentication & User Management
│   ├── auth.controller.ts         # API endpoints
│   ├── auth.service.ts            # Business logic
│   └── auth.module.ts             # NestJS Module
│
├── assets/                         # Asset Management
│   ├── assets.controller.ts       # CRUD endpoints
│   ├── assets.service.ts          # Business logic
│   └── assets.module.ts           # NestJS Module
│
├── tickets/                        # Ticket/Support System
│   ├── tickets.controller.ts      # Ticket endpoints + file upload
│   ├── tickets.service.ts         # Business logic
│   └── tickets.module.ts          # NestJS Module
│
├── announcements/                  # Announcements
│   ├── announcements.controller.ts # Announcement endpoints
│   ├── announcements.service.ts   # Business logic
│   └── announcements.module.ts    # NestJS Module
│
├── app.controller.ts              # Main controller
├── app.service.ts                 # Main service
├── app.module.ts                  # Main module (imports all)
├── main.ts                        # Entry point
│
prisma/
├── schema.prisma                  # Database schema
└── migrations/                    # Database migration history

uploads/
└── tickets/                       # Uploaded ticket images
```

---

## Database Schema Overview

### Users
- `id` (UUID)
- `username` (unique)
- `password` (hashed with bcrypt)
- `email` (optional)
- `role` ("admin" | "student")
- `createdAt`, `updatedAt`

### AssetTypes
- `id` (UUID)
- `name` (unique)
- `description`
- `createdAt`, `updatedAt`

### RoomAssets
- `id` (UUID)
- `roomNumber`
- `assetTypeId` (FK)
- `quantity`
- `condition` ("New" | "Old" | "Broken")
- `createdAt`, `updatedAt`

### Tickets
- `id` (UUID)
- `studentId` (FK to User)
- `roomNumber`
- `description`
- `priority` ("Low" | "Medium" | "High" | "Urgent")
- `status` ("Pending" | "In Progress" | "Completed" | "Cancelled")
- `imageUrl` (optional)
- `createdAt`, `updatedAt`

### Announcements
- `id` (UUID)
- `title`
- `content`
- `adminId` (FK to User)
- `createdAt`, `updatedAt`

---

## Quick Start - Testing the API

### 1. Create Admin User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin01",
    "password": "admin123",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

**Save the returned `id` as `ADMIN_ID`**

### 2. Create Student User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student01",
    "password": "student123",
    "email": "student@example.com",
    "role": "student"
  }'
```

**Save the returned `id` as `STUDENT_ID`**

### 3. Create Asset Type (Admin)
```bash
curl -X POST http://localhost:3000/assets/types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Conditioner",
    "description": "Wall-mounted AC unit"
  }'
```

**Save the returned `id` as `ASSET_TYPE_ID`**

### 4. Assign Asset to Room
```bash
curl -X POST http://localhost:3000/assets/room-assets \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "assetTypeId": "ASSET_TYPE_ID",
    "quantity": 1,
    "condition": "New"
  }'
```

### 5. View Room Assets
```bash
curl http://localhost:3000/assets/rooms/101
```

### 6. Create Ticket (Student)
```bash
curl -X POST http://localhost:3000/tickets \
  -F "studentId=STUDENT_ID" \
  -F "roomNumber=101" \
  -F "description=Air conditioner not working" \
  -F "priority=High" \
  -F "image=@/path/to/image.jpg"
```

**Save the returned `id` as `TICKET_ID`**

### 7. Get All Tickets (Pending)
```bash
curl http://localhost:3000/tickets?status=Pending
```

### 8. Update Ticket Status (Admin only)
```bash
curl -X PUT http://localhost:3000/tickets/TICKET_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "adminId": "ADMIN_ID"
  }'
```

### 9. Create Announcement (Admin)
```bash
curl -X POST http://localhost:3000/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance Notice",
    "content": "Water maintenance on 2024-01-05 from 9 AM to 5 PM",
    "adminId": "ADMIN_ID"
  }'
```

### 10. Get All Announcements
```bash
curl http://localhost:3000/announcements
```

---

## API Documentation

Chi tiết đầy đủ tất cả endpoints xem tại: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## Permission & Authorization

### Student Permissions:
✅ Create ticket
✅ View own tickets
✅ View announcements
✅ View room assets

### Admin Permissions:
✅ Create/Update/Delete asset types
✅ Create/Update/Delete room assets
✅ Update ticket status
✅ View all tickets
✅ Create/Update/Delete announcements
✅ Manage users

---

## File Upload

### Supported Formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Size Limit:
- Maximum: 10MB

### Storage:
- Files stored in: `/uploads/tickets/`
- URL format: `/uploads/tickets/[filename]`

---

## Scripts

```bash
# Development
npm run start:dev      # Start in watch mode

# Production
npm run build          # Build TypeScript
npm run start:prod     # Run production build

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Generate coverage report
npm run test:e2e      # Run E2E tests
```

---

## Environment Variables (Optional)

Create `.env` file:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
PORT=3000
```

---

## Troubleshooting

### 1. Database Connection Error
```bash
# Clear and reset database
rm prisma/dev.db
npx prisma migrate dev --name init
```

### 2. Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port (edit main.ts)
app.listen(3001);
```

### 3. Permission Denied Error
```bash
# Create uploads directory with proper permissions
mkdir -p uploads/tickets
chmod -R 755 uploads
```

### 4. Bcrypt Installation Issues
```bash
npm rebuild bcrypt --build-from-source
```

---

## Common Issues & Solutions

### Issue: Multer file size error
**Solution:** Check that file is under 10MB and send as `multipart/form-data`

### Issue: Admin permissions not working
**Solution:** Ensure `role` is exactly "admin" (case-sensitive) and pass correct `adminId`

### Issue: Image upload returns 500 error
**Solution:** Verify `/uploads/tickets` directory exists and is writable

---

## Next Steps

1. **Add Authentication Middleware**: Implement JWT tokens for better security
2. **Add Email Notifications**: Send emails when tickets are updated
3. **Add File Storage**: Use S3 or similar for better file management
4. **Add Caching**: Implement Redis for caching announcements
5. **Add Logging**: Add Winston or similar for better logging
6. **Add API Documentation UI**: Add Swagger/OpenAPI documentation

---

## Support

For issues or questions, refer to:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## License

UNLICENSED
