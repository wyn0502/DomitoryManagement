<h1 align="center">🏢 Hệ Thống Quản Lý Ký Túc Xá (Dormitory Management System)</h1>

<p align="center">
  📚 <strong>Web Development Project</strong> – Nhóm: <code>Web_N05_T3_2025_GROUP_Truong_Tai_Quynh</code><br>
  🎓 Môn học: Xây Dựng Và Phát Triển Web Nâng Cao<br>
  🏫 Trường: Đại Học Phenikaa – Khoa Công Nghệ Thông Tin<br>
  👩‍🏫 Giảng viên hướng dẫn: TS. Nguyễn Lệ Thu<br>
  📅 Học kỳ III Năm học 2024-2025
</p>

---

👉 [`TRẢI NGHIỆM DỰ ÁN DEMO`](https://wyn0502.id.vn/login)

---

## 📑 Mục lục
1. 📖 Giới thiệu dự án
2. 🎯 Mục tiêu và phạm vi
3. ⚙️ Yêu cầu chức năng (User Stories)
4. 🏗️ Phân tích và thiết kế kiến trúc phần mềm
   - 4.1. 📦 Các thực thể chính (Entities & Models)
   - 4.2. 🔗 Mối quan hệ giữa các thực thể
5. 💡 Công nghệ & Kỹ thuật Web nâng cao áp dụng
6. 📊 Sơ đồ Thiết kế Hệ thống
   - 6.1. 📐 Class Diagram (UML)
   - 6.2. 🔁 Activity Diagrams (05 Sơ đồ nghiệp vụ Tiếng Việt)
7. 🗂️ Cấu trúc thư mục & Mô tả file quan trọng
8. ▶️ Hướng dẫn chạy chương trình (Backend NestJS + Frontend React)
9. 🧪 Test & Kiểm thử tự động (Unit Testing)
10. 💳 Cổng thanh toán trực tuyến VietQR (PayOS) & Chế độ Demo Sandbox
11. 🚀 Ghi chú bảo mật & Hướng phát triển tiếp theo
12. 👨‍💻 Thành viên nhóm & Phân công đóng góp
13. 📚 Link repository & Tài liệu tham khảo

---

## 1. 📌 Giới thiệu dự án

🎯 **Hệ thống Quản lý Ký túc xá (Dormitory Management System)** là một ứng dụng Web Full-stack toàn diện được thiết kế nhằm tự động hóa và nâng cao hiệu quả quản lý cư trú sinh viên tại Ký túc xá trường Đại học.

Người dùng có thể thực hiện đầy đủ các hoạt động nghiệp vụ thực tế:
- 🏢 **Quản lý Tòa nhà & Phòng ở**: cấu hình sức chứa (`capacity`), số lượng hiện tại (`current_occupancy`), loại phòng VIP/Thường và giá thuê cố định.
- 🎓 **Quản lý Hồ sơ Sinh viên & Hợp đồng cư trú**: hỗ trợ đăng ký phòng trực tuyến có sự duyệt/từ chối từ Admin.
- ⚡ **Ghi nhận Chỉ số Điện Nước & Tự động xuất hóa đơn**: thuật toán tự động tính toán điện nước tiêu thụ và chia đều chi phí phòng cho các sinh viên đang ở thực tế.
- 💳 **Thanh toán trực tuyến VietQR (PayOS)**: sinh mã QR thanh toán động tự động đối soát qua Webhook IPN bằng chữ ký số HMAC-SHA256.
- 🎫 **Báo cáo sự cố (Ticket System)**: sinh viên báo hỏng hóc thiết bị, Admin cập nhật trạng thái sửa chữa.
- 📢 **Bảng tin thông báo hành chính**: hiển thị thông báo tin tức ký túc xá thời gian thực.

🔧 Dự án được phát triển với mô hình **Full-stack Client-Server độc lập (Decoupled Architecture)**:
- **Backend (API Server):** NestJS Framework (Node.js/TypeScript) chuẩn 3 tầng Controller - Service - Repository.
- **Frontend (Client SPA):** React TypeScript + Bootstrap 5 + Responsive Web Design.
- **Database:** MySQL Cloud (Aiven) mã hóa SSL/TLS + TypeORM.

---

## 2. 🎯 Mục tiêu và phạm vi
- 🏢 **Mô tả, lưu trữ và thao tác thông tin Tòa nhà & Phòng ở**.
- 🎓 **Quản lý sinh viên nội trú & hợp đồng cư trú**.
- ⚡ **Ghi nhận chỉ số điện nước & phát hành hóa đơn tài chính**.
- 💳 **Tự động hóa thanh toán chuyển khoản qua mã VietQR Napas247 (PayOS)**.
- 🛠️ **Tiếp nhận & xử lý ticket báo cáo hỏng hóc cơ sở vật chất**.
- 📢 **Truyền thông tin qua Bảng tin thông báo KTX**.

---

## 3. ⚙️ Yêu cầu chức năng (User Stories)

### 👑 Dành cho Quản trị viên (Admin):
- ➕➖ **Quản lý Tòa nhà & Phòng ở**: thêm, sửa, xóa phòng, cấu hình sức chứa tối đa và giá thuê cố định.
- ✅ **Duyệt đăng ký phòng**: xem danh sách yêu cầu đăng ký của sinh viên, bấm Duyệt (Approve) hoặc Từ chối (Reject).
- ⚡ **Chốt số điện nước & tạo hóa đơn**: nhập chỉ số mới cuối tháng, hệ thống tự đối soát số cũ và chia đều tiền phòng cho từng sinh viên.
- 🎫 **Xử lý Báo cáo sự cố**: chuyển trạng thái ticket (Chờ xử lý ➔ Đang sửa ➔ Đã xong) kèm ghi chú phản hồi.

### 🎓 Dành cho Sinh viên nội trú (Student):
- 📝 **Đăng ký phòng trực tuyến**: điền đầy đủ MSSV, CCCD, Họ tên, SĐT, Quê quán, Lớp học và chọn phòng ở còn chỗ.
- 💳 **Thanh toán VietQR**: bấm "Quét mã VietQR" trên hóa đơn để tự tạo mã thanh toán chuyển khoản ngân hàng.
- 🛠️ **Gửi Ticket sự cố**: báo hỏng hóc thiết bị trong phòng kèm mức độ khẩn cấp (Low/Medium/High).
- 📢 **Xem Bảng tin thông báo**: theo dõi tin tức KTX mới nhất với bộ lọc tìm kiếm văn bản và khoảng ngày đăng.

---

## 4. 🏗️ Phân tích và thiết kế kiến trúc phần mềm

### 4.1. 🧱 Các thực thể chính (Entities & Models)

| 📦 Thực thể (Entity) | 📝 Mô tả chức năng & Thuộc tính cốt lõi |
|----------------------|-----------------------------------------|
| `Building`           | Quản lý Tòa nhà KTX: mã tòa, tên tòa, mô tả. |
| `Room`               | Quản lý Phòng ở: tòa nhà, tên phòng, sức chứa (`capacity`), số lượng hiện tại (`current_occupancy`), giá thuê. |
| `User`               | Quản lý Người dùng / Sinh viên: username, password (bcrypt), email, role (admin/student), mssv, cccd, sđt, phòng ở. |
| `Contract`           | Hợp đồng cư trú KTX: ngày bắt đầu, ngày kết thúc, trạng thái active/expired. |
| `UtilityMeter`       | Ghi nhận chỉ số điện nước tháng: chỉ số điện mới, chỉ số nước mới, tháng, năm. |
| `Invoice`            | Hóa đơn tài chính: tiền phòng, tiền điện, tiền nước, tổng tiền, trạng thái (`unpaid`/`paid`), mã PayOS `orderCode`. |
| `Asset` / `RoomAsset` | Tài sản KTX (điều hòa, giường, quạt) và phân bổ thiết bị vào từng phòng ở. |
| `Ticket`             | Báo cáo sự cố kỹ thuật: tiêu đề, mô tả, mức độ khẩn cấp, trạng thái xử lý, ghi chú của Admin. |

### 4.2. 🔗 Mối quan hệ giữa các thực thể
- `Building` 1 ➔ N `Room` (1 Tòa nhà chứa nhiều phòng ở).
- `Room` 1 ➔ N `User` (1 Phòng chứa tối đa N sinh viên theo `capacity`).
- `User` 1 ➔ N `Contract` (1 Sinh viên có nhiều hợp đồng qua các năm học).
- `Room` 1 ➔ N `UtilityMeter` & `Invoice` (1 Phòng có nhiều chỉ số & hóa đơn hàng tháng).
- `UtilityMeter` 1 ➔ 1 `Invoice` (Chỉ số tháng tương ứng trực tiếp với hóa đơn).

---

## 5. 💡 Công nghệ & Kỹ thuật Web nâng cao áp dụng

- 🔒 **Xác thực vô trạng thái JWT (JSON Web Token)**: Cấp phát token 24h, bảo mật bằng signature secret.
- 🛡️ **Phân quyền vai trò RBAC (`RolesGuard`)**: Chặn triệt để sinh viên cố tình truy cập các API Admin (trả mã lỗi 403 Forbidden).
- 🔑 **Mã hóa mật khẩu Bcrypt**: Mã hóa mật khẩu người dùng với Salt Round = 10.
- 🌐 **Mã hóa kênh truyền SSL/TLS CSDL**: Kết nối cơ sở dữ liệu Cloud MySQL (Aiven) qua giao thức SSL bảo mật.
- 💳 **Xác thực chữ ký số HMAC-SHA256 Webhook**: Kiểm tra tính toàn vẹn gói tin IPN gửi từ cổng PayOS chống giả mạo giao dịch.
- ⚡ **Chế độ Chạy thử Demo Sandbox Fallback**: Tự động chuyển hướng thanh toán thành công mượt mà trong môi trường Bài tập lớn.

---

## 6. 📊 Sơ đồ Thiết kế Hệ thống

### 6.1. 📐 Class Diagram (UML Class Diagram)
![Sơ đồ Cấu trúc Lớp UML](./diagrams/class_diagram_vi.png)

### 6.2. 🔁 Activity Diagrams (05 Sơ đồ Hoạt động Tiếng Việt)

#### 1. Quy trình Đăng ký Sinh viên & Kiểm tra Sức chứa Phòng
![Sơ đồ Đăng ký Phòng](./diagrams/activitydiagrams/activity_1_dang_ky_phong.png)

#### 2. Quy trình Xác thực JWT & Phân quyền bảo mật RolesGuard
![Sơ đồ Xác thực JWT](./diagrams/activitydiagrams/activity_2_xac_thuc_jwt.png)

#### 3. Quy trình Admin Ghi chỉ số Điện Nước & Tự động Chia đều Hóa đơn
![Sơ đồ Ghi Điện Nước](./diagrams/activitydiagrams/activity_3_ghi_so_dien_nuoc.png)

#### 4. Quy trình Thanh toán trực tuyến VietQR PayOS & Webhook IPN
![Sơ đồ Thanh toán PayOS](./diagrams/activitydiagrams/activity_4_thanh_toan_payos.png)

#### 5. Quy trình Báo cáo Sự cố Ticket & Ban Quản lý Xử lý Kỹ thuật
![Sơ đồ Báo cáo Sự cố Ticket](./diagrams/activitydiagrams/activity_5_bao_cao_su_co.png)

---

## 7. 🗂️ Cấu trúc thư mục dự án

```text
DomitoryManagement/
├── client/                        # Frontend Single Page Application (React TypeScript)
│   ├── src/
│   │   ├── components/            # Các trang giao diện (AdminDashboard, StudentBilling, Login...)
│   │   ├── App.tsx                # Routing và điều hướng trang
│   │   └── index.css              # Custom Styling & Bootstrap integration
│   ├── package.json
│   └── tsconfig.json
│
├── server/                        # Backend RESTful API Server (NestJS TypeScript)
│   ├── src/
│   │   ├── auth/                  # AuthModule (Login, Register, JwtStrategy, RolesGuard)
│   │   ├── rooms/                 # RoomsModule (CRUD Phòng ở & Tòa nhà)
│   │   ├── invoices/              # InvoicesModule (Ghi điện nước, PayOS Payment & Webhook)
│   │   ├── users/                 # UsersModule (CRUD Sinh viên & Duyệt phòng)
│   │   ├── assets/                # AssetsModule (Quản lý thiết bị & phân bổ)
│   │   ├── tickets/               # TicketsModule (Xử lý sự cố kỹ thuật)
│   │   ├── announcements/         # AnnouncementsModule (Bảng tin KTX)
│   │   ├── database/              # Provider kết nối MySQL SSL
│   │   └── main.ts                # Entry point khởi chạy NestJS API Server
│   ├── package.json
│   └── .env.example
│
├── database/                      # File khởi tạo CSDL MySQL
│   └── quan_ly_ktx.sql
│
└── diagrams/                      # Thư mục hình ảnh sơ đồ hệ thống
    ├── class_diagram_vi.png
    └── activitydiagrams/          # 05 hình ảnh Sơ đồ Activity Diagram Tiếng Việt
```

---

## 8. ▶️ Hướng dẫn chạy chương trình

### 8.1. Chuẩn bị Cơ sở Dữ liệu
Import file SQL `database/quan_ly_ktx.sql` vào cơ sở dữ liệu MySQL (chạy trên Local hoặc MySQL Cloud Aiven).

### 8.2. Chạy Backend (NestJS Server - Cổng 3000)
```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ Backend ở chế độ phát triển
npm run start:dev
```
➔ Máy chủ API chạy tại: `http://localhost:3000`

### 8.3. Chạy Frontend (React Client - Cổng 5173)
Mở một cửa sổ Terminal mới:
```bash
# Di chuyển vào thư mục client
cd client

# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy máy chủ giao diện React
npm start
```
➔ Giao diện Web tự động mở tại: `http://localhost:5173`

---

## 9. 🧪 Test & Kiểm thử tự động (Unit Testing)

Tất cả các kiểm thử đơn vị được thực hiện tại thư mục `server/` bằng Jest:
```bash
cd server
npm run test
```
Các kịch bản kiểm thử chính:
- **`auth.service.spec.ts`**: Kiểm thử luồng Đăng ký, Đăng nhập, băm mật khẩu `bcrypt` và cấp phát JWT Token.
- **`invoices.service.spec.ts`**: Kiểm thử thuật toán tính toán chênh lệch điện nước tiêu thụ và chia đều tổng chi phí hóa đơn.

---

## 10. 💳 Cổng thanh toán trực tuyến VietQR (PayOS) & Chế độ Demo Sandbox

1. **Thanh toán VietQR thật**:
   - Cập nhật 3 mã khóa `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` từ [my.payos.vn](https://my.payos.vn) vào file `server/.env`.
   - Sinh viên bấm **"Quét mã VietQR"** ➔ Tự động tạo link quét mã chuyển tiền qua App Ngân hàng ➔ Webhook IPN nhận kết quả tự động cập nhật hóa đơn sang **"Đã thanh toán"**.
2. **Chế độ Demo Sandbox Fallback**:
   - Trường hợp chạy thử bài tập lớn không cấu hình key thật, hệ thống tự động nhận diện và chuyển hướng thanh toán thành công mượt mà mà không gây ra lỗi!

---

## 11. 🚀 Ghi chú bảo mật & Hướng phát triển tiếp theo

- 🛡️ **Bảo mật**:
  - Không lưu trữ mật khẩu chưa mã hóa (BCrypt Salt=10).
  - Sử dụng Parametric Queries chống lỗ hổng SQL Injection.
  - Phân quyền RBAC bằng `@Roles('admin')` và `RolesGuard` chặn các truy cập trái phép.
- 🚀 **Hướng phát triển tiếp theo**:
  - Tích hợp Progressive Web App (PWA) phục vụ thiết bị di động.
  - Tích hợp điểm danh sinh viên bằng nhận diện khuôn mặt AI.
  - Mở rộng hệ thống thông báo gửi tự động qua Zalo OA / Telegram Bot.

---

## 👨‍💻 Thành viên nhóm & Phân công đóng góp

| Tên thành viên | Mã SV | Vai trò | Công việc phụ trách | % Đóng góp |
|---|---|---|---|:---:|
| 👩‍💻 **Trần Thị Quỳnh** | `24104502` | Trưởng nhóm | Core Auth, Phân quyền RolesGuard, MySQL Cloud SSL, Tích hợp cổng thanh toán VietQR PayOS, Webhook HMAC-SHA256, UI Login & Billing, Unit Testing. | **35%** |
| 👨‍💻 **Lê Văn Đông** | `24107720` | Thành viên | API CRUD Tòa nhà & Phòng ở, Sơ đồ phòng ở, Quản lý xếp chỗ sinh viên & Hợp đồng cư trú KTX. | **33%** |
| 👨‍💻 **Nguyễn Văn Long** | `24107665` | Thành viên | API CRUD Tài sản & Phân bổ thiết bị phòng ở, Hệ thống tiếp nhận xử lý sự cố Ticket System, Bảng tin thông báo hành chính. | **32%** |

---

## 📚 Link repository & Tài liệu tham khảo

📂 **Source Code Repository:**  
👉 [`https://github.com/wyn0502/DomitoryManagement`](https://github.com/wyn0502/DomitoryManagement)

🌐 **Link Website Demo:**  
👉 [`https://wyn0502.id.vn`](https://wyn0502.id.vn)

🎬 **Video Demo Youtube:**  
👉 [`Xem Video Demo Dự Án (7 phút 45 giây)`](https://youtu.be/example-demo-dorm)

---

💡 *Nếu bạn thấy dự án hữu ích, hãy nhấn 🌟 Star để ủng hộ nhóm nhé!*
