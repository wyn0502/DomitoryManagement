# Dormitory Management System API

A comprehensive RESTful API backend for managing dormitory operations including assets, maintenance tickets, announcements, and user authentication.

## Features

### 🏠 Asset Management (Assets)
- **CRUD Operations** for asset types (Air Conditioner, Fan, Refrigerator, etc.)
- **Asset Allocation** to specific rooms with status tracking (New/Old/Broken)
- **Room-based Queries** to view all equipment in a specific room

### 🔧 Ticket/Maintenance System
- **Create Tickets** with description, priority level, and optional image attachments
- **Image Upload** support (JPEG, PNG, GIF, WebP - max 10MB)
- **Status Management** - track ticket progress (Pending → In Progress → Completed)
- **Admin Controls** - only admins can update ticket status
- **Search & Filter** - find tickets by status, priority, or keywords
- **Statistics Dashboard** - view ticket metrics

### 📢 Announcements
- **Admin-Only Posts** - create, update, delete announcements
- **Student Access** - view all announcements with pagination
- **Search Feature** - find announcements by title or content
- **Latest Feed** - retrieve most recent announcements

### 👥 User & Authentication
- **User Registration** with role-based access (admin/student)
- **Secure Login** with bcrypt password hashing
- **Role Management** - admins can assign/change user roles
- **User Directory** - view all users filtered by role

---

## Technology Stack

- **Framework**: NestJS (Node.js + Express)
- **Database**: Prisma ORM with SQLite
- **Authentication**: JWT-ready, bcrypt password hashing
- **File Upload**: Multer for multipart/form-data
- **Validation**: NestJS built-in validation
- **API Style**: RESTful with proper HTTP methods

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd /workspaces/DomitoryManagement
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Create Upload Directory**
   ```bash
   mkdir -p uploads/tickets
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

   Server runs on: `http://localhost:3000`

---

## API Overview

### Authentication (`/auth`)
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login user
- `GET /auth/users/:id` - Get user profile
- `GET /auth/all-users` - List users (filter by role)
- `POST /auth/users/:userId/role` - Change user role (Admin)

### Assets (`/assets`)
- `POST /assets/types` - Create asset type
- `GET /assets/types` - List all asset types
- `GET /assets/room-assets` - List room assets (with optional filter)
- `POST /assets/room-assets` - Assign asset to room
- `GET /assets/rooms/:roomNumber` - View equipment in specific room
- `PUT /assets/room-assets/:id` - Update asset status
- `DELETE /assets/room-assets/:id` - Remove asset

### Tickets (`/tickets`)
- `POST /tickets` - Create new ticket with optional image
- `GET /tickets` - List all tickets (filter by status)
- `GET /tickets/:id` - Get ticket details
- `GET /tickets/student/:studentId` - List student's tickets
- `PUT /tickets/:id/status` - Update ticket status (Admin)
- `GET /tickets/stats/overview` - Get ticket statistics
- `GET /tickets/search/query?q=keyword` - Search tickets

### Announcements (`/announcements`)
- `POST /announcements` - Create announcement (Admin)
- `GET /announcements` - List all announcements
- `GET /announcements/paginated` - Paginated announcements
- `GET /announcements/:id` - Get announcement details
- `GET /announcements/latest` - Get latest announcements
- `PUT /announcements/:id` - Update announcement (Admin)
- `DELETE /announcements/:id` - Delete announcement (Admin)

---

## Authorization & Permissions

### Public Access
- View announcements
- View room assets
- Get user profiles

### Student Access
- Create own tickets
- View own ticket history

### Admin Only
- Update/delete asset types
- Manage room asset allocation
- Update ticket status
- Create/edit/delete announcements
- Change user roles

---

## File Upload

**Endpoint**: `POST /tickets`  
**Method**: multipart/form-data

**Supported Formats**:
- JPEG, PNG, GIF, WebP

**Size Limit**: 10MB

**Response**: Image URL `/uploads/tickets/[timestamp]-[filename]`

---

## Example Usage

### Register Admin
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin01",
    "password": "admin@123",
    "role": "admin"
  }'
```

### Create Asset Type
```bash
curl -X POST http://localhost:3000/assets/types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Conditioner",
    "description": "Split AC unit"
  }'
```

### Assign Asset to Room
```bash
curl -X POST http://localhost:3000/assets/room-assets \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "assetTypeId": "asset-id-here",
    "quantity": 1,
    "condition": "New"
  }'
```

### Create Ticket with Image
```bash
curl -X POST http://localhost:3000/tickets \
  -F "studentId=student-id" \
  -F "roomNumber=101" \
  -F "description=AC not cooling" \
  -F "priority=High" \
  -F "image=@/path/to/image.jpg"
```

### Post Announcement
```bash
curl -X POST http://localhost:3000/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance Alert",
    "content": "Water shutoff on Jan 5, 2024",
    "adminId": "admin-id-here"
  }'
```

---

## Project Structure

```
src/
├── auth/              # User authentication and management
├── assets/            # Asset inventory management
├── tickets/           # Support ticket system
├── announcements/     # Announcement management
├── app.module.ts      # Root module
├── app.controller.ts  # Root controller
└── main.ts            # Application entry point

prisma/
├── schema.prisma      # Database schema
└── migrations/        # Database migrations

uploads/
└── tickets/           # Uploaded ticket images
```

---

## Documentation

- **Detailed API Reference**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Setup Instructions**: See [SETUP.md](./SETUP.md)

---

## Development Commands

```bash
# Start development server with auto-reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
npm run test:watch
npm run test:cov
```

---

## Error Handling

All errors return structured JSON responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Server Error

---

## Future Enhancements

- [ ] JWT Token-based authentication
- [ ] Email notifications for ticket updates
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics and reporting
- [ ] Mobile app integration
- [ ] Payment integration for damages
- [ ] Room booking system
- [ ] Visitor management

---

## License

UNLICENSED - Proprietary

---

## Support

For detailed API documentation, please refer to [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For setup and troubleshooting, see [SETUP.md](./SETUP.md)
