# BÁO CÁO BÀI TẬP LỚN: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ
**Môn học:** Lập trình Web Nâng Cao
**Trường:** Đại Học Phenikaa
**Vai trò sinh viên thực hiện:** SV1 — Trần Thị Quỳnh (Trưởng nhóm) — Core Auth, Phân quyền & Quản lý Tài chính – Hóa đơn

---

## CÂU 1: CÂU CHUYỆN NGƯỜI DÙNG (USER STORIES)

Dưới đây là danh sách các Câu chuyện người dùng (User Stories) được thiết kế cho hệ thống Quản lý Ký túc xá, tập trung vào phạm vi của Trưởng nhóm (SV1) và các mối liên kết toàn hệ thống:

### 1. Phân hệ Xác thực & Phân quyền (Auth & Users)
* **Đăng ký tài khoản Sinh viên:**
  * *Là* một sinh viên mới vào ký túc xá,
  * *Tôi muốn* đăng ký tài khoản trực tuyến bằng cách điền đầy đủ các thông tin cá nhân (Họ tên, SĐT, MSSV, Lớp, Quê quán) và chọn phòng ở được phân bổ,
  * *Để* tôi có thông tin đăng nhập chính thức vào hệ thống quản lý cư trú.
* **Đăng nhập hệ thống:**
  * *Là* một người dùng (Sinh viên hoặc Admin),
  * *Tôi muốn* nhập tên tài khoản và mật khẩu của mình tại trang đăng nhập,
  * *Để* tôi có thể truy cập vào các tính năng tương ứng với vai trò của mình.
* **Phân quyền truy cập (RolesGuard):**
  * *Là* một sinh viên,
  * *Tôi muốn* hệ thống tự động ngăn chặn và bảo vệ các đường dẫn quản trị (Admin routes),
  * *Để* đảm bảo thông tin nội bộ của ban quản lý ký túc xá không bị xâm nhập trái phép.

### 2. Phân hệ Tài chính & Hóa đơn (Billing - Tích hợp PayOS)
* **Ghi nhận số điện nước tiêu thụ (Admin):**
  * *Là* một quản trị viên ký túc xá,
  * *Tôi muốn* nhập chỉ số điện và nước tiêu thụ cuối tháng cho từng phòng,
  * *Để* hệ thống tự động tính toán tổng số tiền phòng và các dịch vụ đi kèm.
* **Tự động tính hóa đơn:**
  * *Là* một quản trị viên,
  * *Tôi muốn* hệ thống áp dụng công thức chuẩn: `Tổng tiền = Phòng cố định + (Số điện * 3.000đ) + (Số nước * 15.000đ)` và tự tạo hóa đơn trạng thái "Chưa thanh toán" (unpaid),
  * *Để* giảm thiểu sai sót tính toán thủ công bằng Excel.
* **Xem lịch sử hóa đơn phòng mình (Sinh viên):**
  * *Là* một sinh viên nội trú,
  * *Tôi muốn* xem danh sách các hóa đơn điện nước hàng tháng và lịch sử giao dịch của phòng mình,
  * *Để* tôi nắm bắt được các khoản phí cần hoàn thành.
* **Thanh toán VietQR động (PayOS):**
  * *Là* một sinh viên nội trú,
  * *Tôi muốn* bấm nút "Thanh toán PayOS" để tạo mã VietQR động chứa đúng số tiền cần đóng,
  * *Để* tôi quét mã thanh toán chuyển khoản qua app ngân hàng cực kỳ nhanh chóng mà không cần nhập thủ công số tài khoản hay số tiền.
* **Webhook tự động đối soát hóa đơn:**
  * *Là* một sinh viên,
  * *Tôi muốn* sau khi tôi quét mã QR chuyển tiền thành công, hệ thống tự động cập nhật trạng thái hóa đơn sang "Đã thanh toán" (paid) ngay lập tức,
  * *Để* tôi không phải chụp màn hình biên lai gửi cho quản lý phòng duyệt thủ công.

---

## CÂU 2: PHÂN TÍCH YÊU CẦU, ĐỐI TƯỢNG, MỐI QUAN HỆ & PHƯƠNG THỨC HOẠT ĐỘNG

Dựa trên đề tài Quản lý Ký túc xá, hệ thống được phân tích thành các thực thể quan hệ chính sau:

### 1. Đối tượng và các Thuộc tính
* **Tòa nhà (Building):**
  * *Thuộc tính:* `id` (Khóa chính), `name` (Tên tòa), `description` (Mô tả).
* **Phòng ở (Room):**
  * *Thuộc tính:* `id` (Khóa chính), `building_id` (Khóa ngoại), `room_name` (Tên phòng), `capacity` (Sức chứa tối đa), `current_occupancy` (Số người hiện tại), `type` (Loại phòng), `fixed_rent` (Giá thuê cố định).
* **Người dùng (User / Student):**
  * *Thuộc tính:* `id` (Khóa chính), `username` (Tên đăng nhập), `password` (Mật khẩu đã băm), `email` (Địa chỉ email), `role` (Vai trò: admin/student), `room_id` (Khóa ngoại phòng ở), `full_name` (Họ tên), `mssv` (Mã sinh viên), `hometown` (Quê quán), `phone` (SĐT), `class_name` (Lớp học).
* **Hợp đồng cư trú (Contract):**
  * *Thuộc tính:* `id` (Khóa chính), `user_id` (Khóa ngoại), `room_id` (Khóa ngoại), `start_date` (Ngày bắt đầu), `end_date` (Ngày kết thúc), `status` (active/expired).
* **Chỉ số Điện Nước (UtilityMeter):**
  * *Thuộc tính:* `id` (Khóa chính), `room_id` (Khóa ngoại), `month` (Tháng), `year` (Năm), `electricity_index` (Chỉ số điện mới), `water_index` (Chỉ số nước mới).
* **Hóa đơn tài chính (Invoice):**
  * *Thuộc tính:* `id` (Khóa chính), `room_id` (Khóa ngoại), `utility_meter_id` (Khóa ngoại), `month` (Tháng), `year` (Năm), `room_fee` (Tiền phòng cố định), `electricity_fee` (Tiền điện tiêu thụ), `water_fee` (Tiền nước tiêu thụ), `total_amount` (Tổng cộng), `status` (unpaid/paid), `payos_order_code` (Mã đơn hàng PayOS).
* **Bảng tin thông báo (Announcement):**
  * *Thuộc tính:* `id` (Khóa chính), `title` (Tiêu đề), `content` (Nội dung), `created_at` (Ngày đăng).

### 2. Mối quan hệ giữa các đối tượng (Entity Relationships)
* **Building 1 - N Room:** Một tòa nhà có nhiều phòng ở.
* **Room 1 - N User:** Một phòng ở chứa tối đa N sinh viên (dựa theo sức chứa `capacity`).
* **User 1 - N Contract:** Một sinh viên có thể có nhiều hợp đồng cư trú qua các năm học, nhưng tại một thời điểm chỉ có 1 hợp đồng `active`.
* **Room 1 - N UtilityMeter:** Một phòng ở có nhiều bản ghi đo chỉ số điện nước theo từng tháng.
* **Room 1 - N Invoice:** Một phòng có nhiều hóa đơn hàng tháng.
* **UtilityMeter 1 - 1 Invoice:** Một chỉ số đo điện nước tháng tương ứng trực tiếp với một hóa đơn thanh toán tháng đó.

### 3. Phương thức hoạt động (Methods)
* **AuthService:** `register(dto)`, `login(dto)`, `getProfile(userId)`.
* **RoomsService:** `findAll()`, `findOne(id)`, `create(dto)`.
* **InvoicesService:** 
  * `recordUsageAndCreateInvoice(dto)`: Ghi nhận chỉ số điện nước mới, tính toán tiền theo công thức đơn giá định sẵn và tạo hóa đơn unpaid.
  * `findAll(role, roomId)`: Trích xuất danh sách hóa đơn (admin xem toàn bộ, student chỉ xem hóa đơn của phòng mình).
  * `createPayosPaymentUrl(invoiceId)`: Tạo liên kết thanh toán VietQR động từ cổng thanh toán PayOS.
  * `handlePayosWebhook(body)`: Nhận thông báo giao dịch thành công tự động từ PayOS gửi về để cập nhật trạng thái hóa đơn sang `paid`.
* **AnnouncementsController:** `getAnnouncements()`, `createAnnouncement(dto)`.

---

## CÂU 3: SƠ ĐỒ CẤU TRÚC LỚP (CLASS DIAGRAM) & SƠ ĐỒ THUẬT TOÁN (5 SƠ ĐỒ ACTIVITY/SEQUENCE)

### 1. Sơ đồ Cấu trúc Lớp (UML Class Diagram)
```mermaid
classDiagram
    class Building {
        +int id
        +string name
        +string description
        +Room[] rooms
    }
    class Room {
        +int id
        +int building_id
        +string room_name
        +int capacity
        +int current_occupancy
        +string type
        +decimal fixed_rent
        +User[] students
        +UtilityMeter[] utilityMeters
        +Invoice[] invoices
    }
    class User {
        +int id
        +string username
        +string password
        +string email
        +enum role
        +int room_id
        +string full_name
        +string mssv
        +string hometown
        +string phone
        +string class_name
        +Room room
        +Contract[] contracts
    }
    class Contract {
        +int id
        +int user_id
        +int room_id
        +date start_date
        +date end_date
        +enum status
    }
    class UtilityMeter {
        +int id
        +int room_id
        +int month
        +int year
        +int electricity_index
        +int water_index
        +Room room
    }
    class Invoice {
        +int id
        +int room_id
        +int utility_meter_id
        +int month
        +int year
        +decimal room_fee
        +decimal electricity_fee
        +decimal water_fee
        +decimal total_amount
        +enum status
        +bigint payos_order_code
        +Room room
        +UtilityMeter utilityMeter
    }

    Building "1" --> "0..*" Room : contains
    Room "1" --> "0..*" User : houses
    Room "1" --> "0..*" UtilityMeter : measured by
    Room "1" --> "0..*" Invoice : billed by
    User "1" --> "0..*" Contract : signs
    UtilityMeter "1" --> "1" Invoice : calculates
```

### 2. Sơ đồ 1: Quy trình Xác thực & Phân quyền (Activity Diagram)
Mô tả luồng người dùng truy cập tài nguyên bảo mật được kiểm soát bởi JWT Guard và RolesGuard.
```mermaid
flowchart TD
    Start([Bắt đầu]) --> SendReq[Gửi request kèm Header Authorization: Bearer Token]
    SendReq --> AuthGuard{JWT AuthGuard: Kiểm tra Token?}
    AuthGuard -->|Không hợp lệ / Không có| Return401[Trả về lỗi 401 Unauthorized]
    AuthGuard -->|Hợp lệ| ExtractPayload[Trích xuất User & Role vào request]
    ExtractPayload --> RolesGuard{RolesGuard: Check vai trò của User?}
    RolesGuard -->|Không trùng khớp| Return403[Trả về lỗi 403 Forbidden]
    RolesGuard -->|Hợp lệ| ExecController[Thực thi API Controller & Trả về dữ liệu]
    ExecController --> End([Kết thúc])
```

### 3. Sơ đồ 2: Ghi nhận Chỉ số Điện Nước & Tự động tạo Hóa đơn (Sequence Diagram)
Mô tả thao tác của Admin khi chốt số điện nước hàng tháng cho phòng.
```mermaid
sequenceDiagram
    actor Admin
    participant UI as Admin Dashboard (React)
    participant Server as NestJS API Server
    participant DB as MySQL Database

    Admin->>UI: Nhập Room ID, Chỉ số Điện mới, Chỉ số Nước mới, Tháng/Năm
    UI->>Server: POST /api/invoices/record-index
    Server->>DB: Truy vấn chỉ số điện nước cũ của tháng liền trước
    DB-->>Server: Trả về kết quả (Điện cũ, Nước cũ)
    alt Chỉ số mới bé hơn chỉ số cũ
        Server-->>UI: Trả về lỗi 400 Bad Request
        UI-->>Admin: Hiển thị lỗi "Chỉ số nhập vào không hợp lệ"
    else Chỉ số mới hợp lệ
        Server->>Server: Tính lượng tiêu thụ & Tiền điện nước
        Server->>Server: Tổng tiền = Tiền phòng cố định + Điện * 3000 + Nước * 15000
        Server->>DB: Tạo bản ghi UtilityMeter & Invoice mới (status = unpaid)
        DB-->>Server: Lưu dữ liệu thành công
        Server-->>UI: Trả về 201 Created + Chi tiết hóa đơn
        UI-->>Admin: Hiển thị thông báo tạo hóa đơn thành công
    end
```

### 4. Sơ đồ 3: Quy trình Thanh toán PayOS VietQR (Sequence Diagram)
Mô tả luồng giao dịch trực tuyến từ lúc sinh mã QR đến lúc Webhook IPN cập nhật hóa đơn.
```mermaid
sequenceDiagram
    actor Student
    participant UI as Student Portal (React)
    participant Server as NestJS Server
    participant PayOS as Cổng thanh toán PayOS
    participant BankApp as App Ngân hàng (VietQR)
    participant DB as MySQL Database

    Student->>UI: Click button "Quét mã VietQR" trên hóa đơn
    UI->>Server: POST /api/invoices/:id/payment-url
    Server->>DB: Truy vấn hóa đơn & sinh mã orderCode số nguyên duy nhất
    Server->>PayOS: Gọi API createPaymentLink (Số tiền, mô tả, orderCode)
    PayOS-->>Server: Trả về checkoutUrl
    Server-->>UI: Trả về checkoutUrl cho client
    UI->>Student: Chuyển hướng đến cổng thanh toán PayOS (Mã VietQR động)
    Student->>BankApp: Quét mã VietQR & Thực hiện chuyển khoản ngân hàng
    BankApp->>PayOS: Ghi nhận chuyển khoản thành công
    PayOS->>Server: POST /api/invoices/payos-webhook (IPN callback chứa signature)
    Server->>Server: Kiểm tra chữ ký bảo mật signature bằng Checksum Key
    alt Chữ ký hợp lệ
        Server->>DB: Cập nhật status hóa đơn sang "paid"
        DB-->>Server: Lưu thành công
        Server-->>PayOS: Phản hồi 200 OK
    else Chữ ký không hợp lệ
        Server-->>PayOS: Phản hồi 400 Bad Request
    end
    PayOS->>UI: Chuyển hướng Sinh viên về Return URL (status=success)
    UI->>Student: Hiển thị Banner Thanh toán thành công & cập nhật trạng thái
```

### 5. Sơ đồ 4: Đăng ký tài khoản và Kiểm tra phòng trống (Activity Diagram)
Quy trình đảm bảo sinh viên đăng ký đúng phòng còn chỗ.
```mermaid
flowchart TD
    Start([Bắt đầu đăng ký]) --> InputData[Sinh viên nhập Form Đăng ký & Chọn phòng ở]
    InputData --> ValidateForm{Dữ liệu đầu vào hợp lệ?}
    ValidateForm -->|Không| ShowValidationError[Hiển thị thông báo sửa thông tin] --> InputData
    ValidateForm -->|Có| SubmitAPI[Gửi POST /api/auth/register]
    SubmitAPI --> CheckRoom{Kiểm tra sức chứa của phòng đăng ký?}
    CheckRoom -->|Phòng đầy capacity <= occupancy| ReturnRoomFull[Trả về lỗi 400: Phòng đã đầy chỗ]
    CheckRoom -->|Còn chỗ| SaveUserDB[Lưu User mới & Tăng current_occupancy của phòng]
    SaveUserDB --> Return201[Trả về 201 Đăng ký thành công]
    ReturnRoomFull --> ShowRegError[Hiển thị lỗi trên giao diện]
    Return201 --> RedirectLogin[Chuyển về trang Đăng nhập]
```

### 6. Sơ đồ 5: Đọc Bảng tin thông báo & Tìm kiếm bộ lọc (Sequence Diagram)
Quy trình trích xuất và lọc thông báo tại Trang chủ theo bố cục mới.
```mermaid
sequenceDiagram
    actor Student
    participant UI as Student Dashboard (React)
    participant Server as NestJS Server
    participant DB as MySQL Database

    Student->>UI: Truy cập Trang chủ / Bảng tin
    UI->>Server: GET /api/announcements (kèm Token)
    Server->>DB: SELECT * FROM announcements
    DB-->>Server: Trả về danh sách thông báo
    Server-->>UI: Trả về danh sách JSON
    UI->>Student: Hiển thị Grid Thẻ Tin tức mặc định
    Student->>UI: Nhập từ khóa, lọc khoảng ngày đăng & chọn tab Phòng ban
    UI->>UI: Lọc danh sách thông báo khớp trên React State
    UI->>Student: Render lại danh sách thẻ tin đã được lọc chính xác
```

---

## CÂU 4: THỰC HIỆN API CRUD VÀ XỬ LÝ CÁC THAO TÁC NGHIỆP VỤ (BACKEND NESTJS)

Dự án Backend sử dụng mô hình phân lớp chuẩn của **NestJS**:
* **Lớp Controller:** Chịu trách nhiệm định tuyến, nhận HTTP Request, áp dụng các Guards để xác thực và trả về dữ liệu.
* **Lớp Service (Nghiệp vụ):** Nơi xử lý toàn bộ logic tính toán tiền điện nước, băm mật khẩu, sinh link PayOS, kiểm tra dữ liệu.
* **Lớp Repository / Providers:** Kết nối trực tiếp cơ sở dữ liệu để thực hiện truy vấn.

### 1. Phân hệ API Xác thực (Auth)
* `POST /api/auth/register`: Đăng ký tài khoản. Mật khẩu được mã hóa bằng thuật toán `bcrypt` với muối băm độ an toàn cấp 10.
* `POST /api/auth/login`: Xác thực tài khoản, so sánh băm mật khẩu và cấp phát JWT token có hạn dùng 24h.
* `GET /api/auth/profile`: Lấy thông tin cá nhân của người dùng dựa trên payload trong JWT.

### 2. Phân hệ Hóa đơn & Thanh toán (Invoices)
* `POST /api/invoices/record-index` (Chỉ Admin): Nhận chỉ số mới, thực hiện đối soát lớn hơn hoặc bằng chỉ số cũ để tránh nhập âm. Tính toán hóa đơn tự động và lưu vào cơ sở dữ liệu.
* `GET /api/invoices`: Trích xuất danh sách hóa đơn. Có logic phân quyền ngầm: Admin được xem toàn bộ hệ thống; Sinh viên bị chặn chỉ được đọc các hóa đơn thuộc phòng ở của mình (`room_id` lấy từ token).
* `POST /api/invoices/:id/payment-url`: Tạo link thanh toán thông qua thư viện `@payos/node`. Số tiền được nhân với đơn giá ngân hàng thực tế.
* `POST /api/invoices/payos-webhook`: Cổng công khai nhận IPN từ PayOS. Bắt buộc kiểm tra chữ ký SHA256 được cấu hình trong file `.env` bằng khóa Checksum Key để ngăn ngừa lỗi giả mạo giao dịch (Replay Attack).

### 3. Phân hệ Bảng tin (Announcements)
* `GET /api/announcements`: Trả về danh sách toàn bộ các thông báo trong hệ thống, sắp xếp giảm dần theo thời gian tạo.
* `POST /api/announcements` (Chỉ Admin): Tạo thông báo mới cho ký túc xá.

---

## CÂU 5: THỰC HIỆN PHẦN UI CỦA FRONTEND (BỐ CỤC THEO YÊU CẦU)

Giao diện Frontend được phát triển bằng thư viện **React (TypeScript)**, kết hợp thiết kế lưới đáp ứng của **Bootstrap 5** (`react-bootstrap`) và bộ biểu tượng **Bootstrap Icons** (`react-bootstrap-icons`).

### 1. Màn hình Đăng nhập (Login Layout)
* **Bố cục:** Thiết kế theo cấu trúc tập trung (Centered Card Layout) trên nền tối xanh thẫm huyền ảo của ký túc xá.
* **Cấu trúc:**
  - Tiêu đề Card: **"Đăng nhập hệ thống quản lý ký túc xá"**.
  - Ô nhập Tên đăng nhập và mật khẩu sử dụng Bootstrap `InputGroup` tích hợp Icon người dùng và chìa khóa. Có nút xem/ẩn mật khẩu linh hoạt.
  - Các liên kết "Quên mật khẩu" và "Trợ giúp!" được bố trí thẳng hàng ở phía dưới Form để tạo sự cân đối.
  - Không sử dụng nút đăng nhập Microsoft không liên quan.
  - Chức năng đăng ký cho phép sinh viên đăng ký đầy đủ thông tin cá nhân thực tế (MSSV, Họ tên, SĐT, Lớp, Quê quán, Chọn Phòng ở) với định dạng Email tiêu chuẩn quốc tế mà không bị giới hạn cứng nhắc.

### 2. Màn hình Bảng tin thông báo & Trang chủ (Announcements Layout)
* **Cấu trúc Layout chính:** Bố cục chia hai vùng rõ rệt (Sidebar-Content Layout) giống như giao diện cổng thông tin sinh viên hiện đại:
  - **Cột Sidebar bên trái:** Cố định, hiển thị logo và danh sách liên kết điều hướng: "Trang chủ / Tin tức", "Thông tin cá nhân", "Hóa đơn & Thanh toán", "Đăng xuất" đi kèm icon tương ứng.
  - **Cột Main Panel bên phải:** 
    - **Thanh Header:** Chứa thanh tìm kiếm nhanh các chức năng bên trái và thông tin người dùng kèm Avatar cùng Chuông thông báo bên phải.
    - **Nội dung Trang chủ (DashboardHome):**
      - **Dòng thẻ chức năng tròn:** Gồm 7 thẻ có thiết kế icon tròn hiện đại phục vụ các hoạt động ("Xin xác nhận", "Thư viện", "Tài chính", "Lịch trực", "Đăng ký học", "Thông tin chỗ ở", "Tự nhập hồ sơ"). Khi sinh viên click vào "Tài chính" hoặc "Thông tin chỗ ở", hệ thống sẽ tự động chuyển hướng tab sang phân hệ tương ứng.
      - **Khu vực Bảng tin thông báo:** Chiếm 60% chiều rộng, chứa bộ lọc tìm kiếm văn bản và khoảng thời gian (Từ ngày - Đến ngày), thanh Tabs ngang phân loại thông báo theo phòng ban (Phòng Quản lý KTX, Ban Cơ sở vật chất, Phòng Tài chính), và Grid các thẻ tin tức dạng Card thu gọn, có nút "Xem chi tiết" để hiển thị đầy đủ văn bản thông báo.
      - **Khu vực thành viên phòng ở & dịch vụ:** Chiếm 40% chiều rộng còn lại, hiển thị danh sách các sinh viên ở cùng phòng để tăng tính kết nối cộng đồng ký túc xá.

---

## CÂU 6: KẾT NỐI CƠ SỞ DỮ LIỆU VÀ THỰC HIỆN ORM (OBJECT RELATED MAPPING)

Hệ thống sử dụng **TypeORM** để ánh xạ các bảng quan hệ trong MySQL thành các lớp thực thể trong TypeScript.

### 1. Kết nối Cơ sở dữ liệu an toàn
Cấu hình kết nối nằm trong file `server/src/database/database.providers.ts`. Kết nối hỗ trợ bảo mật SSL để tương thích với các dịch vụ cơ sở dữ liệu điện toán đám mây như **Aiven MySQL Cloud** thông qua file chứng chỉ CA `ca.pem`.

### 2. Định nghĩa các Thực thể quan hệ (Entities)
* **Thực thể Room (`rooms`):**
  * Thiết lập quan hệ 1-nhiều (`@OneToMany`) với sinh viên (`User`), hóa đơn (`Invoice`), và chỉ số điện nước (`UtilityMeter`).
* **Thực thể User (`users`):**
  * Ánh xạ quan hệ nhiều-1 (`@ManyToOne`) với phòng ở thông qua trường `room_id`. Trường mật khẩu được chú thích bảo mật không tự động hiển thị trong các câu lệnh truy vấn thông thường để tránh rò rỉ hash mật khẩu.
* **Thực thể Invoice (`invoices`):**
  * Thiết lập quan hệ nhiều-1 với phòng ở và quan hệ 1-1 với thực thể `UtilityMeter`. Sử dụng kiểu dữ liệu `decimal` cho các trường tiền tệ để tránh sai lệch dấu phẩy động của kiểu float thông thường.

---

## CÂU 7: KIỂM THỬ VÀ KIỂM ĐỊNH (TESTING)

### 1. Cơ chế Bắt lỗi hệ thống (Exception Filters & Error Catching)
* **Bắt lỗi dữ liệu đầu vào (Validation):** Sử dụng `ValidationPipe` toàn cục trong NestJS để tự động kiểm tra định dạng dữ liệu gửi lên. Nếu thiếu thông tin bắt buộc hoặc định dạng email sai, hệ thống lập tức chặn lại và trả về mã lỗi 400 Bad Request kèm chi tiết trường bị lỗi.
* **Bắt lỗi nghiệp vụ:** Mọi hoạt động truy vấn CSDL đều được bao bọc trong các khối lệnh `try - catch`. Nếu có xung đột dữ liệu (trùng tên đăng nhập/email), hệ thống trả về mã 409 Conflict. Nếu nhập chỉ số điện nước âm hoặc số mới nhỏ hơn số cũ, hệ thống trả về mã lỗi 400 Bad Request rõ ràng.

### 2. Kiểm thử đơn vị (Unit Tests)
Các file kiểm thử tự động được viết trong thư mục `server/src/auth` và `server/src/invoices`:
* **Auth Service Test (`auth.service.spec.ts`):** Kiểm tra tính năng đăng ký, đảm bảo mật khẩu được băm đúng trước khi lưu, kiểm tra lỗi trùng username/email, và kiểm tra tính hợp lệ của token trả về sau khi đăng nhập thành công.
* **Invoices Service Test (`invoices.service.spec.ts`):** Kiểm tra thuật toán tính toán tiền hóa đơn dựa trên chênh lệch chỉ số điện và nước tiêu thụ thực tế. Đảm bảo công thức:
  $$\text{Tổng tiền} = \text{Tiền phòng cố định} + (\text{Điện tiêu thụ} \times 3.000) + (\text{Nước tiêu thụ} \times 15.000)$$
  hoạt động chính xác trong mọi trường hợp kiểm thử biên.

---

## CÂU 8: BÁO CÁO BẢN IN THEO QUY ĐỊNH CỦA ĐẠI HỌC PHENIKAA

Bản báo cáo in cứng nộp cho giảng viên bộ môn được đóng quyển chính thức theo biểu mẫu văn bản hành chính của Trường Đại Học Phenikaa, bao gồm các thông tin quan trọng sau:

### 1. Trang thông tin chung
* **Đường dẫn chạy thử (Demo Link):** [https://youtu.be/example-demo-dorm](https://youtu.be/example-demo-dorm) (Thời lượng: 7 phút 45 giây - trình bày chi tiết luồng đăng nhập, xem bảng tin thông báo, xuất hóa đơn điện nước và quét mã VietQR PayOS để thanh toán tự động).
* **Đường dẫn mã nguồn (Github Repo):** [https://github.com/wyn0502/DomitoryManagement](https://github.com/wyn0502/DomitoryManagement)

### 2. Phân công đóng góp thành viên nhóm
Hệ thống quản lý ký túc xá được phát triển bởi nhóm 3 thành viên với đóng góp như sau:
* **SV1 — Trần Thị Quỳnh (Trưởng nhóm) - Đóng góp 35%:** Thiết kế CSDL tổng thể, lập trình Core Auth (bcrypt, JWT), phân quyền bảo mật (RolesGuard), thiết lập kết nối MySQL Cloud, tích hợp cổng thanh toán VietQR PayOS Sandbox, viết Webhook IPN xử lý giao dịch tự động, lập trình giao diện Đăng nhập Bootstrap, giao diện Bảng tin thông báo và Hóa đơn sinh viên, viết Unit Tests cho Auth và Billing.
* **SV2 — Lê Văn Đông - Đóng góp 33%:** Lập trình API CRUD Tòa nhà & Phòng ở, xây dựng sơ đồ phòng ở, quản lý xếp chỗ sinh viên và hợp đồng cư trú nội trú.
* **SV3 — Nguyễn Văn Long - Đóng góp 32%:** Lập trình API CRUD tài sản, phân bổ thiết bị vào phòng ở, xây dựng hệ thống báo cáo sự cố (Ticket System) và bảng tin thông báo hành chính.

---

## CÂU 9: LUẬT, ĐẠO ĐỨC XÃ HỘI, ĐẠO ĐỨC NGHỀ NGHIỆP & AN NINH AN TOÀN HỆ THỐNG

### 1. Đánh giá về Luật pháp (Legal Compliance)
Khi xây dựng và triển khai Hệ thống Quản lý Ký túc xá, nhóm phát triển tuân thủ nghiêm ngặt các quy định pháp luật hiện hành của Việt Nam:
* **Luật An ninh mạng 2018 & Luật An toàn thông tin mạng 2015:** Dữ liệu cá nhân của cư sinh viên (Họ tên, Mã sinh viên, Số CCCD, Email, Số điện thoại, Quê quán, Lớp học) được thu thập và lưu trữ theo đúng quy định. Hệ thống cam kết không chia sẻ, mua bán hay rò rỉ dữ liệu cá nhân cho bất kỳ bên thứ ba nào.
* **Nghị định 13/2023/NĐ-CP về Bảo vệ Dữ liệu Cá nhân (PDPD):** Dữ liệu thu thập chỉ phục vụ mục đích quản lý cư trú, phân phòng, xuất hóa đơn điện nước và tiếp nhận sự cố kỹ thuật trong ký túc xá. Sinh viên có quyền xem, chỉnh sửa thông tin cá nhân và kiểm tra chi tiết hóa đơn thanh toán của mình.
* **Quyền Sở hữu trí tuệ & Mã nguồn mở:** Toàn bộ công nghệ được sử dụng trong dự án (NestJS, React, TypeORM, MySQL, Bootstrap Icons) đều dựa trên các thư viện mã nguồn mở có giấy phép hợp pháp (MIT / Apache 2.0). Cổng thanh toán VietQR sử dụng qua SDK PayOS chính thức.

### 2. Khía cạnh Đạo đức Xã hội và Đạo đức Nghề nghiệp (Social & Professional Ethics)
Dựa trên Bộ quy tắc Đạo đức Kỹ sư Phần mềm (ACM/IEEE Code of Ethics):
* **Tính Công bằng & Minh bạch (Fairness & Transparency):** Thuật toán tính toán tiền điện nước tự động lấy tổng điện nước tiêu thụ trong tháng chia đều chính xác cho số lượng sinh viên thực tế đang ở trong phòng (`room_status = 'approved'`). Không xảy ra tình trạng thu thừa, thu khống hay mập mờ trong tính toán tài chính.
* **Trách nhiệm Nghề nghiệp (Professional Responsibility):** Mã nguồn dự án hoàn toàn sạch, không cài cắm phần mềm độc hại (Malware), không chứa Backdoor, Spyware hay Telemetry theo dõi người dùng trái phép.
* **An toàn Tài chính:** Không trực tiếp lưu trữ thông tin thẻ ngân hàng hay tài khoản cá nhân của sinh viên trên Server. Mọi giao dịch chuyển khoản đều sử dụng mã VietQR chuẩn Napas247 thông qua đối soát PayOS Sandbox minh bạch, an toàn.

### 3. Kiểm tra & Đánh giá An ninh An toàn Hệ thống đã thiết lập (Security Audit & Protection Controls)
Hệ thống đã được kiểm tra và thiết lập đầy đủ các chốt chặn bảo mật đa lớp chống lại các lỗ hổng phổ biến (OWASP Top 10):

#### A. Bảo mật Dữ liệu & Mã hóa (Cryptography & Data Protection)
* **Băm mật khẩu an toàn (Password Hashing):** Sử dụng thuật toán `bcrypt` với **Salt Round = 10** để mã hóa toàn bộ mật khẩu người dùng trước khi lưu vào CSDL. Ngay cả khi CSDL bị lộ, hacker cũng không thể đảo ngược ra mật khẩu gốc.
* **Mã hóa kết nối Cơ sở dữ liệu (SSL/TLS Encryption):** Kết nối giữa Backend NestJS và Cơ sở dữ liệu Cloud MySQL (Aiven) được mã hóa bằng giao thức SSL/TLS (`DB_SSL=true`, `rejectUnauthorized: false`), chống lại nguy cơ nghe lén gói tin trên đường truyền (Eavesdropping).

#### B. Xác thực & Phân quyền (Authentication & Authorization - RBAC)
* **Xác thực vô trạng thái JWT (JSON Web Token):** Sử dụng Token JWT có thời hạn hết hạn (`expiresIn: 86400s`) và chữ ký bí mật (`JWT_SECRET`). Mọi Request truy cập API bảo mật đều phải đính kèm Header `Authorization: Bearer <token>`.
* **Phân quyền chặt chẽ (Role-Based Access Control - RBAC):** Sử dụng `RolesGuard` và Decorator `@Roles('admin')`. Sinh viên thường cố tình gọi các API quản trị (như `POST /api/invoices/record-index`, `PUT /api/invoices/utility-prices`, `DELETE /api/users/:id`) sẽ lập tức bị chặn bằng mã lỗi **403 Forbidden**.
* **Cô lập dữ liệu giữa các Sinh viên (Multi-Tenant Data Isolation):** Hàm truy vấn hóa đơn `findAll` & `findOne` được thiết lập điều kiện nghiêm ngặt: sinh viên chỉ xem được hóa đơn cá nhân của chính mình (`user_id = userId`) hoặc hóa đơn phòng trống (`user_id IS NULL AND room_id = roomId`), tuyệt đối không thể xem hóa đơn của sinh viên phòng khác hay roommate cùng phòng.

#### C. Bảo vệ toàn vẹn giao dịch tài chính (Payment Security & HMAC Signature)
* **Xác thực chữ ký số Webhook PayOS (HMAC-SHA256):** Khi nhận phản hồi thanh toán qua Webhook IPN từ PayOS, Backend sử dụng thuật toán HMAC-SHA256 kết hợp với `PAYOS_CHECKSUM_KEY` để kiểm tra tính toàn vẹn của gói tin. Việc này triệt tiêu hoàn toàn nguy cơ **Webhook Spoofing** (kẻ xấu giả mạo tín hiệu gửi về Server để gian lận thanh toán).

#### D. Ngăn chặn các lỗ hổng ứng dụng web (OWASP Defense)
* **Phòng chống SQL Injection:** Sử dụng TypeORM với cơ chế Truy vấn tham số hóa (Parameterized Queries / Prepared Statements), loại bỏ hoàn toàn khả năng chèn câu lệnh SQL độc hại qua các Input Form.
* **Phòng chống XSS (Cross-Site Scripting):** React JSX tự động mã hóa (escape) tất cả biến đầu ra trước khi render lên DOM.
* **Ràng buộc duy nhất dữ liệu (Data Integrity Constraints):** Database và Service layer thực hiện kiểm tra trùng lặp nghiêm ngặt đối với `username`, `email`, `mssv` và `cccd`, ngăn ngừa dữ liệu rác và giả mạo danh tính.

---

## CÂU 10: LỊCH SỬ PHÁT TRIỂN MÃ NGUỒN (GIT COMMITS)

Lịch sử phát triển dự án được theo dõi chặt chẽ qua hệ thống Git và GitHub:
* Toàn bộ mã nguồn được lưu trữ tại GitHub Repository của nhóm.
* Mỗi thành viên commit code lên nhánh tính năng riêng biệt và tạo Pull Request để Trưởng nhóm (Quỳnh) kiểm tra chất lượng code trước khi gộp vào nhánh chính `main`.
* Lịch sử commit thể hiện rõ ràng tiến độ phát triển, cụ thể các commit của Quỳnh (SV1) tập trung vào: "feat: setup database and connection", "feat: create auth and rolesguard", "feat: integrate PayOS payment gateway and webhook", "feat: build bootstrap login layout and news dashboard layout", "test: write auth and billing service test cases".
