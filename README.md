# 🏢 Dự Án Nhóm: Hệ Thống Quản Lý Ký Túc Xá (NestJS + React + PayOS)

Hệ thống quản lý Ký túc xá tích hợp phân quyền bảo mật, tự động xuất hóa đơn tài chính và cổng thanh toán trực tuyến PayOS (VietQR) tự động đối soát giao dịch.

Dự án được cấu trúc chạy song song:
- **Backend (NestJS API Server):** Trong thư mục `server/` (Cổng 3000)
- **Frontend (React Client):** Trong thư mục `client/` (Cổng 5173)

---

## 👥 Phân Công Nhiệm Vụ Thành Viên Nhóm

### 1) SV1 — Quỳnh (Trưởng nhóm) — Core Auth, Phân quyền & Quản lý Tài chính – Hóa đơn
- **Phần 1: Nền tảng (Auth & Users)**
  - Thiết kế CSDL tổng quan (bảng `users`, `rooms`, `utility_meters`, `invoices`).
  - Cấu hình môi trường `.devcontainer` cho toàn nhóm phát triển trên GitHub Codespaces.
  - Kết nối cơ sở dữ liệu MySQL (hỗ trợ Aiven Cloud / Local).
  - Lập trình API Đăng ký / Đăng nhập (bcrypt băm mật khẩu, trả JWT Token).
  - Viết `RolesGuard` phân quyền và chặn sinh viên truy cập chức năng Admin.
  - Viết giao diện React Đăng nhập chung (`Login.tsx` có responsive, validation, xử lý thông báo lỗi).
- **Phần 2: Tài chính & Hóa đơn (Billing - Tích hợp PayOS)**
  - Viết API/Giao diện nhập số điện, nước tiêu thụ từng phòng theo tháng (Admin).
  - Lập trình logic tính tiền hóa đơn: `Tổng tiền = Phòng cố định + (Số điện * 3.000đ) + (Số nước * 15.000đ)`. Tự động tạo hóa đơn `unpaid`.
  - Tích hợp cổng thanh toán **PayOS Sandbox** (`POST /api/invoices/:id/payment-url`) để sinh mã VietQR thanh toán động.
  - Lập trình API Webhook (`POST /api/invoices/payos-webhook`) lắng nghe PayOS gọi về để tự động cập nhật trạng thái hóa đơn sang `paid` khi sinh viên quét mã QR thanh toán thành công.
  - Viết API/Giao diện Sinh viên xem danh sách hóa đơn và lịch sử thanh toán phòng mình.
  - Chức năng nâng cao (Điểm A): Dashboard Admin dùng câu lệnh SQL `SUM`, `COUNT` vẽ biểu đồ doanh thu theo tháng bằng Chart.js.
  - Viết Unit Tests cho dịch vụ Auth và thuật toán tính tiền hóa đơn.

### 2) SV2 — Đông — Quản lý Cơ sở dữ liệu Phòng ở & Hợp đồng Cư dân
- **Phần 1: Quản lý Tòa nhà & Phòng (Infrastructure)**
  - API CRUD danh sách Tòa nhà (`buildings`) và Phòng ở (`rooms` thuộc tòa, cấu hình giá, loại phòng, số chỗ tối đa).
  - UI xem sơ đồ phòng: Đầy chỗ hiện màu đỏ, còn chỗ hiện màu xanh.
- **Phần 2: Quản lý Sinh viên & Hợp đồng (Cư dân)**
  - API CRUD danh sách Sinh viên nội trú.
  - Logic xếp phòng: xếp Sinh viên vào phòng, kiểm tra giới hạn sức chứa, chặn xếp nếu phòng đầy.
  - Hợp đồng cư trú: tra cứu Ngày bắt đầu, Ngày hết hạn và trạng thái hợp đồng.

### 3) SV3 — Long — Quản lý Cơ sở vật chất, Báo cáo sự cố & Bảng tin thông báo
- **Phần 1: Quản lý Trang thiết bị trong phòng (Assets)**
  - API CRUD danh mục tài sản (`assets` như giường tầng, điều hòa, quạt...).
  - Phân bổ tài sản vào phòng (`room_assets`). UI Sinh viên xem thiết bị phòng mình.
- **Phần 2: Ticket System (Sự cố)**
  - Sinh viên gửi yêu cầu sửa chữa (mức khẩn cấp, đính kèm ảnh).
  - Admin quản lý trạng thái ticket (Chờ xử lý -> Đang sửa chữa -> Đã xong).
- **Phần 3: Bảng tin thông báo (Announcements)**
  - Admin đăng thông báo, hiển thị trên trang chủ của Sinh viên khi đăng nhập.

---

## 🗄️ Thiết Kế Cơ Sở Dữ Liệu
CSDL hoàn chỉnh của nhóm đã được tạo lập trong file [database/quan_ly_ktx.sql](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/database/quan_ly_ktx.sql). 

Bao gồm các bảng chính:
- `buildings`, `rooms` (SV2)
- `users`, `contracts` (SV1 & SV2)
- `utility_meters`, `invoices` (SV1)
- `assets`, `room_assets`, `tickets`, `announcements` (SV3)

---

## ⚡ Hướng Dẫn Khởi Chạy Trên GitHub Codespaces (Local)

Do dự án sử dụng môi trường Docker hóa thông qua Devcontainer, bạn có thể dễ dàng mở dự án trên **GitHub Codespaces** và khởi chạy dự án song song.

### Bước 1: Chuẩn bị CSDL
Import file SQL [quan_ly_ktx.sql](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/database/quan_ly_ktx.sql) vào cơ sở dữ liệu MySQL của bạn (chạy trên local hoặc MySQL Cloud Aiven).

### Bước 2: Cấu hình biến môi trường
1. Tạo file `.env` trong thư mục `server/` dựa trên mẫu [server/.env.example](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/server/.env.example).
2. Điền thông tin tài khoản Database của bạn và cấu hình PayOS (Dự án đã điền sẵn key PayOS Sandbox kiểm thử công khai).

### Bước 3: Cài đặt và khởi chạy dự án

#### Chạy Backend (NestJS):
Mở terminal thứ nhất tại thư mục dự án và chạy:
```bash
cd server
npm install
npm run start:dev
```
Backend sẽ khởi chạy tại cổng mạng: `http://localhost:3000`

#### Chạy Frontend (React Vite):
Mở terminal thứ hai tại thư mục dự án và chạy:
```bash
cd client
npm install
npm run dev
```
Frontend sẽ khởi chạy tại cổng mạng: `http://localhost:5173`

Mở trình duyệt truy cập `http://localhost:5173` để sử dụng giao diện.

---

## 💳 Hướng Dẫn Kiểm Thử Thanh Toán VietQR PayOS
1. Đăng nhập tài khoản Sinh viên: `student1` / mật khẩu: `student123`.
2. Truy cập tab **Hóa đơn phòng tôi**, tìm hóa đơn chưa đóng và bấm **Thanh toán PayOS**.
3. Hệ thống sẽ mở cổng checkout hiển thị mã QR VietQR. Bạn chỉ cần bấm chọn nút **Thanh toán thành công** (giả lập trên PayOS Sandbox).
4. Hệ thống sẽ kích hoạt webhook IPN để cập nhật trạng thái hóa đơn sang **Đã thanh toán** và tự động redirect bạn về trang sinh viên với banner thông báo thành công.

---

## 🧪 Chạy Kiểm Thử (Unit Tests)
Tại thư mục `server/`, chạy lệnh sau để kiểm thử logic Auth và thuật toán hóa đơn:
```bash
npm run test
```
Các file test chính:
- `server/src/auth/auth.service.spec.ts` (Test nghiệp vụ đăng nhập, đăng ký, mã hóa mật khẩu)
- `server/src/invoices/invoices.service.spec.ts` (Test chỉ số điện nước và thuật toán tính tiền hóa đơn)

---

## 📊 Sơ Đồ Hoạt Động (CRUD Hóa đơn & PayOS)
Chi tiết sơ đồ trình tự Sequence Diagram và sơ đồ hoạt động (Activity Diagram) của SV1 Quỳnh đã được lưu trữ và vẽ bằng công cụ Mermaid tại file [activity_diagram.md](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/activity_diagram.md).
