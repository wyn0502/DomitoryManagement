# API Documentation - Dormitory Management System

## Base URL
```
http://localhost:3000
```

## Authentication Module (`/auth`)

### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "student01",
  "password": "password123",
  "email": "student01@example.com",
  "role": "student"  // optional: "admin" or "student" (default: "student")
}

Response: 
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.com",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. Login User
```
POST /auth/login
Content-Type: application/json

{
  "username": "student01",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.com",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. Get User by ID
```
GET /auth/users/:id

Response:
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.com",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4. Get User by Username
```
GET /auth/users?username=student01

Response:
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.com",
  "role": "student",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 5. Get All Users (with optional role filter)
```
GET /auth/all-users
GET /auth/all-users?role=admin

Response:
[
  {
    "id": "uuid",
    "username": "admin01",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### 6. Update User Role (Admin only)
```
POST /auth/users/:userId/role
Content-Type: application/json

{
  "newRole": "admin",
  "adminId": "admin_user_id"  // ID of the admin user making the change
}

Response:
{
  "id": "uuid",
  "username": "student01",
  "email": "student01@example.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 7. Verify User is Admin
```
GET /auth/verify-admin/:userId

Response:
{
  "userId": "uuid",
  "isAdmin": true
}
```

---

## Assets Module (`/assets`)

### Asset Types - CRUD Operations

#### 1. Create Asset Type (Admin)
```
POST /assets/types
Content-Type: application/json

{
  "name": "Air Conditioner",
  "description": "Wall-mounted air conditioning unit"
}

Response:
{
  "id": "uuid",
  "name": "Air Conditioner",
  "description": "Wall-mounted air conditioning unit",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### 2. Get All Asset Types
```
GET /assets/types

Response:
[
  {
    "id": "uuid",
    "name": "Air Conditioner",
    "description": "Wall-mounted air conditioning unit",
    "roomAssets": [...]
  },
  ...
]
```

#### 3. Get Asset Type by ID
```
GET /assets/types/:id

Response:
{
  "id": "uuid",
  "name": "Air Conditioner",
  "description": "Wall-mounted air conditioning unit",
  "roomAssets": [...]
}
```

#### 4. Update Asset Type
```
PUT /assets/types/:id
Content-Type: application/json

{
  "name": "Air Conditioner Updated",
  "description": "Updated description"
}

Response:
{
  "id": "uuid",
  "name": "Air Conditioner Updated",
  "description": "Updated description",
  "roomAssets": [...]
}
```

#### 5. Delete Asset Type
```
DELETE /assets/types/:id

Response:
{
  "id": "uuid",
  "name": "Air Conditioner",
  ...
}
```

### Room Assets - Allocation

#### 6. Assign Asset to Room
```
POST /assets/room-assets
Content-Type: application/json

{
  "roomNumber": "101",
  "assetTypeId": "uuid",
  "quantity": 1,
  "condition": "New"  // "New", "Old", or "Broken"
}

Response:
{
  "id": "uuid",
  "roomNumber": "101",
  "assetTypeId": "uuid",
  "quantity": 1,
  "condition": "New",
  "assetType": {
    "id": "uuid",
    "name": "Air Conditioner"
  }
}
```

#### 7. Get All Room Assets (with optional filter)
```
GET /assets/room-assets
GET /assets/room-assets?roomNumber=101

Response:
[
  {
    "id": "uuid",
    "roomNumber": "101",
    "assetTypeId": "uuid",
    "quantity": 1,
    "condition": "New",
    "assetType": {
      "id": "uuid",
      "name": "Air Conditioner"
    }
  },
  ...
]
```

#### 8. Get Room Asset by ID
```
GET /assets/room-assets/:id

Response:
{
  "id": "uuid",
  "roomNumber": "101",
  "assetTypeId": "uuid",
  "quantity": 1,
  "condition": "New",
  "assetType": {...}
}
```

#### 9. Update Room Asset
```
PUT /assets/room-assets/:id
Content-Type: application/json

{
  "quantity": 2,
  "condition": "Old"
}

Response:
{
  "id": "uuid",
  "roomNumber": "101",
  "assetTypeId": "uuid",
  "quantity": 2,
  "condition": "Old",
  "assetType": {...}
}
```

#### 10. Delete Room Asset
```
DELETE /assets/room-assets/:id

Response:
{
  "id": "uuid",
  "roomNumber": "101",
  ...
}
```

#### 11. Get All Assets in a Specific Room
```
GET /assets/rooms/:roomNumber

Response:
[
  {
    "id": "uuid",
    "roomNumber": "101",
    "assetTypeId": "uuid",
    "quantity": 1,
    "condition": "New",
    "assetType": {...}
  },
  ...
]
```

---

## Tickets Module (`/tickets`)

### 1. Create Ticket (with optional image upload)
```
POST /tickets
Content-Type: multipart/form-data

Fields:
- studentId: "uuid"
- roomNumber: "101"
- description: "Air conditioner is not working"
- priority: "High" (optional, default: "Medium")
  - Options: "Low", "Medium", "High", "Urgent"
- image: <file> (optional, max 10MB)

Response:
{
  "id": "uuid",
  "studentId": "uuid",
  "roomNumber": "101",
  "description": "Air conditioner is not working",
  "priority": "High",
  "status": "Pending",
  "imageUrl": "/uploads/tickets/1234567890-image.jpg",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "student": {
    "id": "uuid",
    "username": "student01",
    "email": "student01@example.com"
  }
}
```

### 2. Get All Tickets (with optional status filter)
```
GET /tickets
GET /tickets?status=Pending

Status options: "Pending", "In Progress", "Completed", "Cancelled"

Response:
[
  {
    "id": "uuid",
    "studentId": "uuid",
    "roomNumber": "101",
    "description": "Air conditioner is not working",
    "priority": "High",
    "status": "Pending",
    "imageUrl": "/uploads/tickets/1234567890-image.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "student": {...}
  },
  ...
]
```

### 3. Get Ticket by ID
```
GET /tickets/:id

Response:
{
  "id": "uuid",
  "studentId": "uuid",
  "roomNumber": "101",
  "description": "Air conditioner is not working",
  "priority": "High",
  "status": "Pending",
  "imageUrl": "/uploads/tickets/1234567890-image.jpg",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "student": {...}
}
```

### 4. Get Tickets for a Specific Student
```
GET /tickets/student/:studentId

Response:
[
  {
    "id": "uuid",
    ...
  },
  ...
]
```

### 5. Update Ticket Status (Admin only)
```
PUT /tickets/:id/status
Content-Type: application/json

{
  "status": "In Progress",
  "adminId": "admin_user_id"  // Required: ID of the admin user
}

Status options: "Pending", "In Progress", "Completed", "Cancelled"

Response:
{
  "id": "uuid",
  "status": "In Progress",
  "updatedAt": "2024-01-01T00:00:01Z",
  ...
}
```

### 6. Get Ticket Statistics
```
GET /tickets/stats/overview

Response:
{
  "total": 10,
  "pending": 3,
  "inProgress": 2,
  "completed": 4,
  "cancelled": 1
}
```

### 7. Search Tickets
```
GET /tickets/search/query?q=keyword

Response:
[
  {
    "id": "uuid",
    ...
  },
  ...
]
```

---

## Announcements Module (`/announcements`)

### 1. Create Announcement (Admin only)
```
POST /announcements
Content-Type: application/json

{
  "title": "Maintenance Notice",
  "content": "Water maintenance on 2024-01-05",
  "adminId": "admin_user_id"  // Required: ID of the admin user
}

Response:
{
  "id": "uuid",
  "title": "Maintenance Notice",
  "content": "Water maintenance on 2024-01-05",
  "adminId": "admin_user_id",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 2. Get All Announcements
```
GET /announcements

Response:
[
  {
    "id": "uuid",
    "title": "Maintenance Notice",
    "content": "Water maintenance on 2024-01-05",
    "adminId": "admin_user_id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### 3. Get Announcements with Pagination
```
GET /announcements/paginated?page=1&limit=10

Response:
{
  "announcements": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 4. Get Announcement by ID
```
GET /announcements/:id

Response:
{
  "id": "uuid",
  "title": "Maintenance Notice",
  "content": "Water maintenance on 2024-01-05",
  "adminId": "admin_user_id",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 5. Get Latest Announcements
```
GET /announcements/latest?limit=5

Response:
[
  {
    "id": "uuid",
    "title": "Maintenance Notice",
    ...
  },
  ...
]
```

### 6. Search Announcements
```
GET /announcements/search/query?q=keyword

Response:
[
  {
    "id": "uuid",
    ...
  },
  ...
]
```

### 7. Update Announcement (Admin only)
```
PUT /announcements/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "adminId": "admin_user_id"  // Required: ID of the admin user
}

Response:
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content",
  "updatedAt": "2024-01-01T00:00:01Z",
  ...
}
```

### 8. Delete Announcement (Admin only)
```
DELETE /announcements/:id?adminId=admin_user_id

Response:
{
  "id": "uuid",
  "title": "Maintenance Notice",
  ...
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authorization Requirements

### Admin-Only Operations:
1. Update ticket status
2. Create announcements
3. Update announcements
4. Delete announcements
5. Update user roles

### Student Operations:
1. Create tickets
2. View own tickets
3. View announcements (public)
4. View room assets

---

## File Upload

### Ticket Image Upload:
- Endpoint: `POST /tickets` with `multipart/form-data`
- Field name: `image`
- Allowed types: JPEG, PNG, GIF, WebP
- Max size: 10MB
- Uploaded files stored in: `/uploads/tickets/`
- URL returned: `/uploads/tickets/filename`

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Bcrypt (for password hashing)
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 3. Install Multer (for file uploads)
```bash
npm install @nestjs/platform-express multer
npm install --save-dev @types/multer
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development Server
```bash
npm run start:dev
```

Server will start on `http://localhost:3000`

---

## Testing with cURL

### Create a Student User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student01",
    "password": "password123",
    "email": "student01@example.com",
    "role": "student"
  }'
```

### Create an Admin User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin01",
    "password": "admin123",
    "email": "admin01@example.com",
    "role": "admin"
  }'
```

### Create Asset Type
```bash
curl -X POST http://localhost:3000/assets/types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Air Conditioner",
    "description": "Wall-mounted AC unit"
  }'
```

### Assign Asset to Room
```bash
curl -X POST http://localhost:3000/assets/room-assets \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "assetTypeId": "ASSET_TYPE_ID_HERE",
    "quantity": 1,
    "condition": "New"
  }'
```

### Create Ticket with Image
```bash
curl -X POST http://localhost:3000/tickets \
  -F "studentId=STUDENT_ID_HERE" \
  -F "roomNumber=101" \
  -F "description=Air conditioner not working" \
  -F "priority=High" \
  -F "image=@/path/to/image.jpg"
```

### Create Announcement
```bash
curl -X POST http://localhost:3000/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Maintenance Notice",
    "content": "Water maintenance on 2024-01-05",
    "adminId": "ADMIN_ID_HERE"
  }'
```
