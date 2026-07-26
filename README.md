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
  - **CRUD Người dùng (Admin):** danh sách, sửa, xóa sinh viên (`GET/PUT/DELETE /api/users`) — trang "Sinh viên".
  - **Đăng ký phòng qua duyệt của Admin:** sinh viên gửi yêu cầu (chờ duyệt) → Admin duyệt/từ chối; kèm cam kết nội quy.
  - **CRUD Phòng ở (Admin):** thêm/sửa/xóa phòng (`POST/PUT/DELETE /api/rooms`) — trang "Phòng ở".
  - Giao diện hệ thống bố cục **Sidebar** (Admin & Sinh viên) theo mẫu cổng thông tin Phenikaa.
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

## 🔧 Tổng Hợp API CRUD (mỗi đối tượng đều có đầy đủ CRUD)

| Đối tượng | CREATE | READ | UPDATE | DELETE |
|---|---|---|---|---|
| **users** | `POST /api/auth/register` | `GET /api/users`, `GET /api/auth/profile` | `PUT /api/users/:id` | `DELETE /api/users/:id` |
| **rooms** | `POST /api/rooms` | `GET /api/rooms`, `GET /api/rooms/:id` | `PUT /api/rooms/:id` | `DELETE /api/rooms/:id` |
| **utility_meters** | `POST /api/invoices/record-index` | qua `GET /api/invoices` (kèm `utilityMeter`) | `PUT /api/invoices/:id` (sửa chỉ số) | xóa dây chuyền khi xóa hóa đơn |
| **invoices** | `POST /api/invoices/record-index` | `GET /api/invoices`, `GET /api/invoices/:id` | `PUT /api/invoices/:id` | `DELETE /api/invoices/:id` |

**Nghiệp vụ bổ sung (ngoài CRUD cơ bản):**
- Đăng ký phòng có **duyệt của Admin**: sinh viên gửi yêu cầu `POST /api/auth/register-room` (trạng thái `pending`) → Admin xem `GET /api/users/pending-rooms` → duyệt `POST /api/users/:id/approve-room` hoặc từ chối `POST /api/users/:id/reject-room`. Sinh viên **không** được xếp phòng ngay.
- Thanh toán PayOS: `POST /api/invoices/:id/payment-url`, Webhook `POST /api/invoices/payos-webhook`, xác nhận thủ công `POST /api/invoices/:id/confirm-payment`.
- Dashboard thống kê (SUM/COUNT/GROUP BY): `GET /api/dashboard/admin-stats`.
- Thành viên cùng phòng: `GET /api/rooms/my-members`.
- Bảng tin: `GET /api/announcements`, `POST /api/announcements` (Admin).

Tất cả route ghi/sửa/xóa của Admin đều được bảo vệ bằng `AuthGuard` (JWT) + `RolesGuard` (chặn sinh viên, trả `403`).

---

## ⚡ Hướng Dẫn Khởi Chạy Trên GitHub Codespaces (Local)

Do dự án sử dụng môi trường Docker hóa thông qua Devcontainer, bạn có thể dễ dàng mở dự án trên **GitHub Codespaces** và khởi chạy dự án song song.

### Bước 1: Chuẩn bị CSDL
Import file SQL [quan_ly_ktx.sql](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/database/quan_ly_ktx.sql) vào cơ sở dữ liệu MySQL của bạn (chạy trên local hoặc MySQL Cloud Aiven).

### Bước 2: Cấu hình biến môi trường
1. Tạo file `.env` trong thư mục `server/` dựa trên mẫu `server/.env.example`.
2. Điền thông tin tài khoản Database (Local hoặc Aiven — nếu dùng Aiven đặt `DB_SSL=true`).
3. **PayOS:** điền `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` **của chính bạn** lấy từ kênh thanh toán Sandbox tại [business.payos.vn](https://business.payos.vn). Nếu để trống, API tạo mã QR sẽ báo lỗi rõ ràng.
4. Tạo file `.env` trong thư mục `client/` với `PORT=5173` (đã có sẵn) để React chạy đúng cổng, tránh trùng cổng 3000 của backend.

### Bước 3: Cài đặt và khởi chạy dự án

> Frontend dùng **Create React App (react-scripts)**, khởi chạy bằng `npm start`.

#### Chạy Backend (NestJS):
Mở terminal thứ nhất và chạy:
```bash
cd server
npm install
npm run start
```
Backend chạy tại: `http://localhost:3000`

#### Chạy Frontend (React - CRA):
Mở terminal thứ hai và chạy:
```bash
cd client
npm install
npm start
```
Frontend chạy tại: `http://localhost:5173`

Mở trình duyệt truy cập `http://localhost:5173` để sử dụng giao diện.

---

## 💳 Hướng Dẫn Kiểm Thử Thanh Toán VietQR PayOS
> ⚠️ Cần điền **key PayOS Sandbox của bạn** vào `server/.env` trước (xem Bước 2). Key demo cũ đã hết hiệu lực, nếu dùng sẽ báo *"Cổng thanh toán không tồn tại hoặc đã tạm dừng"*.

1. Đăng nhập tài khoản Sinh viên đã được xếp phòng (có hóa đơn).
2. Vào tab **Hóa đơn & Thanh toán**, tìm hóa đơn chưa đóng và bấm **Quét mã VietQR**.
3. Hệ thống gọi `POST /api/invoices/:id/payment-url` sinh link checkout PayOS chứa mã QR VietQR động đúng số tiền.
4. Sau khi thanh toán trên Sandbox, PayOS gọi Webhook `POST /api/invoices/payos-webhook` (kiểm tra chữ ký) để tự động cập nhật hóa đơn sang **Đã thanh toán**, rồi redirect sinh viên về trang có banner thành công.

> Ngoài ra Admin có thể **xác nhận thanh toán thủ công** (`POST /api/invoices/:id/confirm-payment`) tại trang "Quản lý hóa đơn" để demo trạng thái `paid` mà không cần PayOS.

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

## ⚖️ Luật, Đạo đức & Bảo mật (Legal, Ethics & Security)

Dự án này được xây dựng dựa trên sự tuân thủ nghiêm túc các tiêu chuẩn pháp lý và đạo đức nghề nghiệp:

1. **Tuân thủ Pháp luật:** 
   - Tuân thủ Luật Sở hữu trí tuệ: Toàn bộ thư viện sử dụng đều tuân thủ giấy phép nguồn mở.
   - Tuân thủ Luật An ninh mạng & Nghị định 13/2023/NĐ-CP: Mọi thông tin người dùng (nếu có) đều được mã hóa bằng [Tên thuật toán, ví dụ: SHA-256/bcrypt] và bảo mật đường truyền.

2. **Đạo đức Xã hội:**
   - Hệ thống hướng tới sự minh bạch, không chứa mã độc hoặc các tính năng gây tổn hại đến lợi ích chung của cộng đồng.

3. **Đạo đức Nghề nghiệp & Phối hợp Nhóm:**
   - Cam kết không đạo văn, ghi rõ đóng góp của từng thành viên trong lịch sử Commit.
   - Áp dụng nguyên tắc bảo mật thông tin nội bộ: Không push các thông tin nhạy cảm (Private Key, API Credentials) lên mã nguồn công khai.

## 📊 Sơ Đồ Hoạt Động (CRUD Hóa đơn & PayOS)
Chi tiết sơ đồ trình tự Sequence Diagram và sơ đồ hoạt động (Activity Diagram) của SV1 Quỳnh đã được lưu trữ và vẽ bằng công cụ Mermaid tại file [activity_diagram.md](file:///C:/Users/SV/.gemini/antigravity-ide/scratch/DomitoryManagement/activity_diagram.md).
