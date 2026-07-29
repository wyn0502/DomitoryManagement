<h1 align="center">🏢 Hệ Thống Quản Lý Ký Túc Xá (Dormitory Management System)</h1>

  📚 <strong>Web Development Project</strong> – Lớp: <code>N01.TH2</code><br>
  🎓 Học phần: <strong>Thiết kế web nâng cao (CSE702051)</strong><br>
  🏫 Trường: <strong>Đại học Phenikaa</strong> – Khoa Công Nghệ Thông Tin<br>
  👩‍🏫 Giảng viên hướng dẫn: <strong>TS. Nguyễn Lệ Thu</strong><br>
  📅 Học kỳ III Năm học 2025-2026
</p>

---



## 📑 Mục lục
1. 📖 [Giới thiệu dự án](#1-gioi-thieu-du-an)
2. 🎯 [Mục tiêu và phạm vi](#2-muc-tieu-va-pham-vi)
3. ⚙️ [Yêu cầu chức năng (User Stories)](#3-yeu-cau-chuc-nang)
4. 🏗️ [Phân tích & Thiết kế kiến trúc phần mềm](#4-phan-tich-va-thiet-ke)
   - 4.1. 📦 Các thực thể chính (Entities & Models)
   - 4.2. 🔗 Mối quan hệ giữa các thực thể
5. 💡 [Công nghệ & Kỹ thuật Web nâng cao](#5-cong-nghe-va-ky-thuat)
6. 📊 [Sơ đồ Thiết kế Hệ thống (UML Diagrams)](#6-so-do-thiet-ke-he-thong)
   - 6.1. 📐 Class Diagram (Sơ đồ lớp)
   - 6.2. 🔁 Activity Diagrams (05 Sơ đồ hoạt động)
   - 6.3. 🔀 Sequence Diagrams (05 Sơ đồ tuần tự)
7. 🖼️ [Hình ảnh Giao diện Frontend (12 Màn hình)](#7-hinh-anh-giao-dien-frontend)
8. 🗂️ [Cấu trúc thư mục dự án](#8-cau-truc-thu-muc)
9. ▶️ [Hướng dẫn chạy chương trình](#9-huong-dan-chay-chuong-trinh)
10. 🧪 [Test & Kiểm thử tự động (Unit Testing)](#10-kiem-thu-tu-dong)
11. 💳 [Cổng thanh toán VietQR (PayOS) & Webhook đối soát](#11-payos-payment-gateway)
12. 🚀 [Bảo mật & Hướng phát triển](#12-bao-mat-va-phat-trien)
13. 👨‍💻 [Thành viên nhóm & Tỷ lệ đóng góp](#13-thanh-vien-nhom)

---

<a id="1-gioi-thieu-du-an"></a>
## 1. 📌 Giới thiệu dự án

🎯 **Hệ thống Quản lý Ký túc xá (Dormitory Management System)** là giải pháp chuyển đổi số Web Full-stack toàn diện giúp tự động hóa quá trình quản lý cư trú sinh viên tại Ký túc xá đại học:
- 🏢 **Quản lý Tòa nhà & Phòng ở**: cấu hình sức chứa (`capacity`), số người ở hiện tại (`current_occupancy`), phân loại phòng và giá thuê cố định.
- 🎓 **Quản lý Sinh viên & Hợp đồng cư trú**: hỗ trợ sinh viên đăng ký phòng trực tuyến và ban quản lý phê duyệt cư trú.
- ⚡ **Ghi chỉ số Điện Nước & Tự động tạo Hóa đơn**: chốt số điện nước hàng tháng, tự động tính tiền tiêu thụ và chia đều cho cư dân thực tế trong phòng.
- 💳 **Thanh toán chuyển khoản VietQR (PayOS)**: sinh mã QR động tự động đối soát qua Webhook IPN bằng chữ ký số HMAC-SHA256.
- 🛠️ **Tiếp nhận & Xử lý Báo cáo sự cố (Ticket System)**: tiếp nhận yêu cầu sửa chữa hỏng hóc cơ sở vật chất từ sinh viên.
- 📢 **Bảng tin thông báo hành chính**: phát hành tin tức KTX theo thời gian thực.

---

<a id="2-muc-tieu-va-pham-vi"></a>
## 2. 🎯 Mục tiêu và phạm vi
- 🏢 **Lưu trữ & Thao tác quản lý Tòa nhà & Phòng ở KTX**.
- 🎓 **Quản lý sinh viên nội trú & hợp đồng cư trú**.
- ⚡ **Ghi nhận chỉ số điện nước & phát hành hóa đơn tài chính tự động**.
- 💳 **Tự động hóa thanh toán chuyển khoản qua mã VietQR Napas247 (PayOS)**.
- 🛠️ **Quản lý & xử lý ticket báo cáo hỏng hóc thiết bị**.
- 📢 **Truyền thông tin qua Bảng tin thông báo KTX**.

---

<a id="3-yeu-cau-chuc-nang"></a>
## 3. ⚙️ Yêu cầu chức năng (User Stories)

### 👑 Dành cho Quản trị viên (Admin):
- ➕➖ **Quản lý Tòa nhà & Phòng ở**: thêm, sửa, xóa phòng, cấu hình sức chứa tối đa và giá thuê cố định.
- ✅ **Duyệt đăng ký phòng**: xem danh sách yêu cầu đăng ký của sinh viên, duyệt (Approve) hoặc từ chối (Reject).
- ⚡ **Chốt số điện nước & phát hành hóa đơn**: nhập chỉ số mới cuối tháng, hệ thống kiểm tra số cũ và chia đều tiền cho từng sinh viên.
- 🛠️ **Xử lý Báo cáo sự cố**: chuyển trạng thái ticket (Chờ xử lý ➔ Đang sửa ➔ Đã hoàn tất) kèm ghi chú phản hồi.
- 📢 **Đăng Bảng tin thông báo**: phát hành tin tức hành chính phân loại theo phòng ban.

### 🎓 Dành cho Sinh viên nội trú (Student):
- 📝 **Đăng ký phòng trực tuyến**: điền đầy đủ MSSV, CCCD, Họ tên, SĐT, Quê quán, Lớp học và chọn phòng ở còn trống.
- 💳 **Thanh toán VietQR**: bấm "Quét mã VietQR" trên hóa đơn để tạo link thanh toán VietQR động.
- 🛠️ **Gửi Ticket sự cố**: báo hỏng hóc thiết bị trong phòng kèm mức độ khẩn cấp (Low / Medium / High).
- 📢 **Xem Bảng tin thông báo**: tìm kiếm thông báo KTX theo từ khóa và lọc khoảng thời gian.

---

<a id="4-phan-tich-va-thiet-ke"></a>
## 4. 🏗️ Phân tích & Thiết kế kiến trúc phần mềm

### 4.1. 🧱 Các thực thể chính (Entities & Models)

| 📦 Thực thể (Entity) | 📝 Mô tả chức năng & Thuộc tính cốt lõi |
|----------------------|-----------------------------------------|
| `Building` | Quản lý Tòa nhà KTX: mã tòa (`id`), tên tòa (`name`), mô tả (`description`). |
| `Room` | Quản lý Phòng ở: `building_id`, tên phòng, sức chứa (`capacity`), người ở hiện tại (`current_occupancy`), loại phòng, giá thuê cố định. |
| `User` | Tài khoản Sinh viên / Admin: username, password (bcrypt), email, role, mssv, cccd, sđt, phòng ở. |
| `Contract` | Hợp đồng cư trú KTX: ngày bắt đầu, ngày kết thúc, trạng thái hợp đồng. |
| `UtilityMeter` | Ghi nhận chỉ số điện nước chốt hàng tháng: `electricity_index`, `water_index`, tháng, năm. |
| `Invoice` | Hóa đơn tài chính: tiền phòng, tiền điện, tiền nước, tổng tiền chia đều, trạng thái (`unpaid`/`paid`), mã PayOS `payos_order_code`. |
| `Ticket` | Báo cáo sự cố kỹ thuật: tiêu đề, mô tả, mức độ khẩn cấp, trạng thái xử lý, phản hồi của Admin. |
| `Announcement` | Bảng tin thông báo hành chính: tiêu đề, nội dung, phòng ban phát hành. |
| `Asset` / `RoomAsset` | Danh mục trang thiết bị KTX và thông tin phân bổ tài sản vào từng phòng. |

---

<a id="5-cong-nghe-va-ky-thuat"></a>
## 5. 💡 Công nghệ & Kỹ thuật Web nâng cao

- ⚙️ **Backend**: NestJS 11 (Node.js/TypeScript) mô hình chuẩn Controller - Service - Repository.
- 🎨 **Frontend**: React 19 (TypeScript) Single Page Application, Bootstrap 5 UI & Custom CSS Responsive.
- 🗄️ **Database & ORM**: MySQL Cloud (Aiven) mã hóa kết nối SSL/TLS + TypeORM framework.
- 🔒 **Bảo mật**: JWT Access Token (hạn 24h), bcrypt password hashing (Salt Round = 10), RolesGuard RBAC `@Roles('admin')`.
- 💳 **Cổng thanh toán**: `@payos/node` chính thức sinh mã VietQR Napas247 & xác thực chữ ký số HMAC-SHA256 Webhook IPN.

---

<a id="6-so-do-thiet-ke-he-thong"></a>
## 6. 📊 Sơ đồ Thiết kế Hệ thống (UML Diagrams)

### 6.1. 📐 Class Diagram (Sơ đồ lớp tổng thể)
![Class Diagram tổng thể hệ thống](./diagrams/class_diagram.png)

### 6.2. 🔁 Activity Diagrams (05 Sơ đồ hoạt động)
1. **Activity 1: Quy trình Đăng ký Sinh viên & Kiểm tra Sức chứa Phòng**
   ![Activity 1](./diagrams/activitydiagrams/activity_1_dang_ky_phong.png)
2. **Activity 2: Quy trình Xác thực JWT & Phân quyền bảo mật RolesGuard**
   ![Activity 2](./diagrams/activitydiagrams/activity_2_xac_thuc_jwt.png)
3. **Activity 3: Quy trình Ghi chỉ số Điện Nước & Tự động Chia đều Hóa đơn**
   ![Activity 3](./diagrams/activitydiagrams/activity_3_ghi_so_dien_nuoc.png)
4. **Activity 4: Quy trình Thanh toán VietQR PayOS & Webhook IPN**
   ![Activity 4](./diagrams/activitydiagrams/activity_4_thanh_toan_payos.png)
5. **Activity 5: Quy trình Báo cáo Sự cố Ticket & Ban Quản lý Xử lý Kỹ thuật**
   ![Activity 5](./diagrams/activitydiagrams/activity_5_bao_cao_su_co.png)

### 6.3. 🔀 Sequence Diagrams (05 Sơ đồ tuần tự)
1. **Sequence 1: Quy trình Đăng ký tài khoản (Register Flow)**
   ![Sequence 1](./diagrams/sequence/sequence_1_register.png)
2. **Sequence 2: Quy trình Đăng ký phòng & Kiểm tra sức chứa**
   ![Sequence 2](./diagrams/sequence/register_room_sequence.png)
3. **Sequence 3: Admin Ghi chỉ số Điện Nước & Tự động xuất Hóa đơn**
   ![Sequence 3](./diagrams/sequence/invoice_creation_sequence.png)
4. **Sequence 4: Thanh toán chuyển khoản VietQR PayOS & Webhook đối soát**
   ![Sequence 4](./diagrams/sequence/sequence_2_payos_payment.png)
5. **Sequence 5: Quy trình Tiếp nhận & Xử lý Báo cáo Sự cố (Ticket System)**
   ![Sequence 5](./diagrams/sequence/ticket_system_sequence.png)

---

<a id="7-hinh-anh-giao-dien-frontend"></a>
## 7. 🖼️ Hình ảnh Giao diện Frontend (12 Màn hình)

### 🔑 Giao diện Xác thực
- **Màn hình Đăng nhập hệ thống:**  
  ![Login](./diagrams/giaodien/login.png)
- **Màn hình Đăng ký sinh viên mới & Chọn phòng ở:**  
  ![Register](./diagrams/giaodien/register.png)

### 🎓 Phân hệ Giao diện Sinh viên (Student Portal)
- **Trang chủ & Bảng tin thông báo KTX:**  
  ![Student Home](./diagrams/giaodien/trangchu-students.png)
- **Thông tin cá nhân & Hồ sơ cư trú Sinh viên:**  
  ![Student Profile](./diagrams/giaodien/infomation-students.png)
- **Quản lý Hóa đơn phòng & Quét mã VietQR PayOS:**  
  ![Student Invoice](./diagrams/giaodien/invoice-students.png)

### 👑 Phân hệ Giao diện Quản trị viên (Admin Dashboard)
- **Dashboard Tổng quan Quản trị KTX:**  
  ![Admin Dashboard](./diagrams/giaodien/trangchu-admin.png)
- **Quản lý Tòa nhà & Sơ đồ Phòng ở KTX:**  
  ![Admin Rooms](./diagrams/giaodien/room-admin.png)
- **Quản lý & Duyệt danh sách cư trú Sinh viên:**  
  ![Admin Students](./diagrams/giaodien/quanlysinhvien-admin.png)
- **Admin Ghi chỉ số Điện Nước & Phát hành Hóa đơn:**  
  ![Admin Billing](./diagrams/giaodien/invoice-admin.png)
- **Quản lý Trang thiết bị & Tài sản phân bổ:**  
  ![Admin Assets](./diagrams/giaodien/cosovatchat-admin.png)
- **Tiếp nhận & Xử lý Báo cáo Sự cố Ticket:**  
  ![Admin Tickets](./diagrams/giaodien/tickets-admin.png)
- **Quản lý & Đăng bài Bảng tin thông báo KTX:**  
  ![Admin Announcements](./diagrams/giaodien/announcements-admin.png)

---

<a id="8-cau-truc-thu-muc"></a>
## 8. 🗂️ Cấu trúc thư mục dự án

```text
DomitoryManagement/
├── client/                        # Single Page Application Frontend (React 19 + TypeScript)
│   ├── src/
│   │   ├── components/            # Giao diện Admin, Student, Login, Billing, Tickets...
│   │   ├── App.tsx                # Client Routing và phân quyền Router
│   │   └── index.css              # Custom Styling & Bootstrap 5
│   └── package.json
│
├── server/                        # RESTful API Backend Server (NestJS 11 + TypeORM)
│   ├── src/
│   │   ├── auth/                  # AuthModule (Login, Register, JwtStrategy, RolesGuard)
│   │   ├── rooms/                 # RoomsModule (CRUD Phòng ở & Tòa nhà)
│   │   ├── invoices/              # InvoicesModule (Ghi điện nước, PayOS Payment & Webhook)
│   │   ├── users/                 # UsersModule (CRUD Sinh viên & Duyệt phòng)
│   │   ├── assets/                # AssetsModule (Quản lý thiết bị & phân bổ)
│   │   ├── tickets/               # TicketsModule (Xử lý sự cố kỹ thuật)
│   │   ├── announcements/         # AnnouncementsModule (Bảng tin KTX)
│   │   └── database/              # Provider kết nối MySQL Cloud SSL
│   └── package.json
│
├── database/                      # File SQL khởi tạo CSDL
│   └── quan_ly_ktx.sql
│
├── diagrams/                      # Thư mục chứa hình ảnh sơ đồ & giao diện
│   ├── class_diagram.png          # Sơ đồ Class Diagram tổng thể
│   ├── activitydiagrams/          # 05 Sơ đồ Activity Diagram
│   ├── sequence/                  # 05 Sơ đồ Sequence Diagram
│   └── giaodien/                  # 12 Hình ảnh màn hình giao diện
```

---

<a id="9-huong-dan-chay-chuong-trinh"></a>
## 9. ▶️ Hướng dẫn chạy chương trình

### 9.1. Chuẩn bị Cơ sở Dữ liệu
Import tập tin SQL `database/quan_ly_ktx.sql` vào MySQL (chạy trên Local hoặc MySQL Cloud Aiven).

### 9.2. Chạy Backend API (NestJS Server - Cổng 3000)
```bash
cd server
npm install
npm run start:dev
```
➔ API Server chạy tại: `http://localhost:3000`

### 9.3. Chạy Frontend UI (React Client - Cổng 5173 / 3001)
```bash
cd client
npm install
npm start
```
➔ Giao diện Web chạy tại: `http://localhost:5173`

---

<a id="10-kiem-thu-tu-dong"></a>
## 10. 🧪 Test & Kiểm thử tự động (Unit Testing)

Tất cả kiểm thử đơn vị được thực hiện tại thư mục `server/` bằng Jest:
```bash
cd server
npm run test
```
- **`auth.service.spec.ts`**: Kiểm thử luồng Đăng ký, Đăng nhập, băm mật khẩu `bcrypt` và cấp phát JWT Token.
- **`invoices.service.spec.ts`**: Kiểm thử thuật toán chốt số điện nước, tính tiêu thụ và chia đều hóa đơn cho cư dân.

---

<a id="11-payos-payment-gateway"></a>
## 11. 💳 Cổng thanh toán VietQR (PayOS) & Webhook đối soát

1. **Cấu hình chìa khóa thanh toán**:
   Cập nhật 3 mã khóa `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` từ [my.payos.vn](https://my.payos.vn) vào `server/.env`.
2. **Luồng xử lý tự động**:
   Sinh viên bấm **"Quét mã VietQR"** ➔ Hệ thống gọi PayOS API tạo Checkout URL ➔ Sinh viên quét mã trên App Ngân hàng ➔ Webhook IPN tự động xác thực chữ ký HMAC-SHA256 và gạch nợ hóa đơn sang **"paid"**.

---

<a id="12-bao-mat-va-phat-trien"></a>
## 12. 🚀 Bảo mật & Hướng phát triển

- 🛡️ **Bảo mật**:
  - Mã hóa băm mật khẩu Bcrypt (Salt Round = 10).
  - Kết nối MySQL Cloud Aiven mã hóa SSL/TLS.
  - Kiểm tra chữ ký số HMAC-SHA256 Webhook IPN triệt tiêu Webhook Spoofing.
  - Phân quyền RBAC bằng `@Roles('admin')` và `RolesGuard`.
- 🚀 **Hướng phát triển**:
  - Phát triển phiên bản Progressive Web App (PWA) cho di động.
  - Tích hợp thông báo tự động qua Bot Telegram / Zalo OA.

---

<a id="13-thanh-vien-nhom"></a>
## 👨‍💻 Thành viên nhóm & Tỷ lệ đóng góp

| Tên thành viên | Mã SV | Vai trò | Công việc phụ trách | % Đóng góp |
|---|---|---|---|:---:|
| 👩‍💻 **Lò Tuấn Quỳnh** | `24104502` | Trưởng nhóm | Core Auth, Phân quyền RolesGuard, MySQL Cloud SSL, Tích hợp cổng thanh toán VietQR PayOS, Webhook HMAC-SHA256, UI Login & Billing, Unit Testing. | **40%** |
| 👨‍💻 **Đặng Chấn Đông** | `24107720` | Thành viên | API CRUD Tòa nhà & Phòng ở, Sơ đồ phòng ở, Quản lý xếp chỗ sinh viên & Hợp đồng cư trú KTX. | **30%** |
| 👨‍💻 **Nguyễn Quang Long** | `24107665` | Thành viên | API CRUD Tài sản & Phân bổ thiết bị phòng ở, Hệ thống tiếp nhận xử lý sự cố Ticket System, Bảng tin thông báo hành chính. | **30%** |


---

💡 *Dự án được xây dựng và hoàn thiện cho học phần Thiết kế web nâng cao (CSE702051) – Trường Đại học Phenikaa.*
