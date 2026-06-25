# Sơ Đồ Hoạt Động (Activity Diagrams) - Quỳnh (SV1)

Tài liệu này chứa các sơ đồ hoạt động (Activity Diagrams) chi tiết cho các nhiệm vụ của **Quỳnh (SV1 - Trưởng nhóm)**, bao gồm:
1. **Quản lý Xác thực & Phân quyền** (Đăng ký, Đăng nhập, RolesGuard chặn truy cập theo vai trò).
2. **Quản lý Chỉ số Điện Nước & Hóa đơn** (Quy trình CRUD của Admin).
3. **Quy trình Thanh toán Tự động tích hợp Cổng thanh toán PayOS (VietQR)** (Quy trình tạo link thanh toán, quét mã QR ngân hàng, xử lý Webhook IPN, và cập nhật trạng thái hóa đơn).

---

## 1. Quy Trình Xác Thực & Phân Quyền (Auth & RolesGuard)

Quy trình này mô tả hoạt động từ lúc người dùng đăng ký tài khoản, đăng nhập hệ thống, cho đến khi gửi yêu cầu truy cập các API được bảo vệ bởi `RolesGuard`.

```mermaid
flowchart TD
    %% Định nghĩa các Subgraph (Phân vùng vai trò)
    subgraph Client ["Client (React Frontend)"]
        Start([Khởi động]) --> ChooseAction{Chọn hành động}
        
        %% Nhánh Đăng ký
        ChooseAction -->|Đăng ký| FillRegForm[Nhập thông tin Đăng ký<br/>Email, Mật khẩu, Họ tên, Mã phòng]
        FillRegForm --> RegFormValid{Dữ liệu hợp lệ?}
        RegFormValid -->|Không| ShowRegError[Hiển thị lỗi Validation] --> FillRegForm
        RegFormValid -->|Có| SendRegReq[Gửi POST /auth/register]
        
        %% Nhánh Đăng nhập
        ChooseAction -->|Đăng nhập| FillLoginForm[Nhập Email & Mật khẩu]
        FillLoginForm --> LoginValid{Dữ liệu hợp lệ?}
        LoginValid -->|Không| ShowLoginError[Hiển thị lỗi Validation] --> FillLoginForm
        LoginValid -->|Có| SendLoginReq[Gửi POST /auth/login]
        
        %% Nhánh Truy cập Tài nguyên có phân quyền
        SendReqWithToken[Gửi API Request kèm<br/>Header Authorization: Bearer AccessToken]
    end

    subgraph Server ["Server (NestJS Backend)"]
        %% Xử lý Đăng ký
        SendRegReq --> CheckEmailExist{Email đã tồn tại?}
        CheckEmailExist -->|Có| RegConflict[Trả về lỗi 409 Conflict]
        CheckEmailExist -->|Không| HashPassword[Mã hóa mật khẩu bằng bcrypt]
        
        %% Xử lý Đăng nhập
        SendLoginReq --> CheckUserDB{User tồn tại?}
        CheckUserDB -->|Không| AuthError[Trả về lỗi 401 Unauthorized]
        CheckUserDB -->|Có| CompareHash[So sánh hash mật khẩu bằng bcrypt]
        CompareHash --> CompareResult{Mật khẩu khớp?}
        CompareResult -->|Không| AuthError
        CompareResult -->|Có| GenerateTokens[Tạo JWT Access Token & Refresh Token]
        
        %% Xử lý Phân quyền (RolesGuard)
        SendReqWithToken --> AuthGuard[JWT AuthGuard: Xác thực Token]
        AuthGuard --> TokenValid{Token hợp lệ?}
        TokenValid -->|Không| Return401[Trả về 401 Unauthorized]
        TokenValid -->|Có| ExtractUser[Trích xuất User & Roles từ JWT Payload]
        ExtractUser --> RolesGuard{RolesGuard: Vai trò của User<br/>có được phép truy cập route này?}
        RolesGuard -->|Không| Return403[Trả về 403 Forbidden]
        RolesGuard -->|Có| ExecuteController[Thực thi API Controller & Trả về dữ liệu]
    end

    subgraph DB ["Database (MySQL Aiven)"]
        CheckEmailExist -.->|Truy vấn| QueryReg{Tìm User}
        HashPassword --> SaveUser[Lưu User mới vào CSDL]
        CheckUserDB -.->|Truy vấn| QueryUser{Tìm User}
    end

    %% Luồng phản hồi & Lưu trữ phía Client
    RegConflict --> ShowRegError
    SaveUser -->|Thành công| RegSuccess[Trả về 201 Created]
    RegSuccess --> ShowRegSuccess[Hiển thị Đăng ký Thành công] --> FillLoginForm
    
    AuthError --> ShowLoginError
    GenerateTokens -->|Trả về 200 OK + Tokens| ReceiveTokens[Nhận Token]
    ReceiveTokens --> StoreTokens[Lưu Tokens vào localStorage / Cookies]
    StoreTokens --> RouteDashboard[Chuyển hướng màn hình dựa trên Role]
    
    Return401 --> RedirectLogin[Xóa Token & Chuyển về trang Đăng nhập]
    Return403 --> ShowForbidden[Hiển thị thông báo Không có quyền truy cập]
    ExecuteController --> RenderData[Render dữ liệu lên giao diện]
```

---

## 2. Quy Trình Quản Lý Chỉ Số Điện Nước & Hóa Đơn (CRUD - Admin)

Quy trình này mô tả các hoạt động của Quản trị viên (Admin) khi thực hiện tạo mới, xem, sửa đổi, và xóa các hóa đơn cũng như chỉ số điện nước của từng phòng.

```mermaid
flowchart TD
    subgraph AdminUI ["Admin (React Client)"]
        AdminStart([Bắt đầu]) --> ChooseCRUD{Chọn thao tác CRUD}
        
        %% Nhánh CREATE (Tạo hóa đơn)
        ChooseCRUD -->|CREATE| SelectRoom[Chọn Phòng, Tháng/Năm]
        SelectRoom --> InputMeters[Nhập chỉ số Điện Mới, Nước Mới]
        InputMeters --> SubmitCreate[Gửi POST /invoices]
        
        %% Nhánh READ (Xem danh sách)
        ChooseCRUD -->|READ| LoadInvoices[Gửi GET /invoices kèm Bộ lọc]
        
        %% Nhánh UPDATE (Cập nhật)
        ChooseCRUD -->|UPDATE| SelectInvoiceEdit[Chọn Hóa đơn & Nhập thông tin sửa đổi]
        SelectInvoiceEdit --> SubmitUpdate[Gửi PATCH /invoices/:id]
        
        %% Nhánh DELETE (Xóa)
        ChooseCRUD -->|DELETE| SelectInvoiceDel[Chọn Hóa đơn & Nhấp Xóa]
        SelectInvoiceDel --> ConfirmDelete{Xác nhận xóa?}
        ConfirmDelete -->|Đồng ý| SendDelete[Gửi DELETE /invoices/:id]
        ConfirmDelete -->|Hủy| CancelDelete[Hủy bỏ thao tác] --> AdminStart
    end

    subgraph BackendServer ["Server (NestJS Backend)"]
        %% Xử lý CREATE
        SubmitCreate --> QueryPrevMeter[Truy vấn chỉ số Điện/Nước cũ của tháng trước]
        QueryPrevMeter --> CompareMeters{Chỉ số Mới >= Chỉ số Cũ?}
        CompareMeters -->|Không| ErrMeter[Trả về lỗi 400 Bad Request: Chỉ số không hợp lệ]
        CompareMeters -->|Có| CalcAmount[Tính lượng tiêu thụ & Thành tiền]
        
        %% Công thức tính tiền
        style CalcAmount fill:#f9f,stroke:#333,stroke-width:2px
        CalcAmount --> CreateRecord[Tạo UtilityMeter & Invoice mới<br/>Trạng thái = 'Chưa thanh toán']
        
        %% Xử lý READ
        LoadInvoices --> QueryInvoicesDB[Truy vấn danh sách hóa đơn theo bộ lọc]
        
        %% Xử lý UPDATE
        SubmitUpdate --> ValidateUpdate{Chỉ số cập nhật hợp lệ?}
        ValidateUpdate -->|Không| ErrMeter
        ValidateUpdate -->|Có| RecalculateBill[Tính toán lại tổng tiền]
        RecalculateBill --> UpdateDB[Cập nhật bản ghi Invoice & UtilityMeter]
        
        %% Xử lý DELETE
        SendDelete --> DeleteDB[Xóa bản ghi Invoice & UtilityMeter liên quan]
    end

    subgraph DatabaseSystem ["Database (MySQL Aiven)"]
        QueryPrevMeter -.->|Đọc| DBMeters[(Bảng UtilityMeter)]
        CreateRecord --> SaveInvoice[Lưu Invoice & UtilityMeter mới]
        QueryInvoicesDB -.->|Đọc| DBInvoices[(Bảng Invoice & Room)]
        UpdateDB --> SaveUpdate[Lưu thông tin cập nhật]
        DeleteDB --> RemoveRecord[Xóa khỏi CSDL]
    end

    %% Trả kết quả về Client
    ErrMeter --> ShowErrForm[Hiển thị thông báo lỗi trên Form]
    SaveInvoice -->|Trả về 201 Created| ShowCreateSuccess[Thông báo tạo thành công & Reload danh sách]
    QueryInvoicesDB -->|Trả về 200 OK + Data| RenderInvoicesList[Hiển thị danh sách hóa đơn lên bảng]
    SaveUpdate -->|Trả về 200 OK| ShowUpdateSuccess[Thông báo cập nhật thành công & Reload]
    RemoveRecord -->|Trả về 200 OK| ShowDeleteSuccess[Thông báo xóa thành công & Reload]
```

---

## 3. Quy Trình Thanh Toán Hóa Đơn Tích Hợp PayOS (VietQR)

Đây là quy trình chi tiết nhất, mô tả sự tương tác giữa **Sinh viên (React)**, **Hệ thống Backend (NestJS)**, và **Cổng thanh toán PayOS** thông qua các bước khởi tạo link thanh toán, quét mã QR VietQR, xử lý Webhook xác thực (IPN) an toàn bằng chữ ký bảo mật, và phản hồi trạng thái thanh toán theo thời gian thực.

```mermaid
flowchart TD
    subgraph StudentUI ["Sinh viên (React Frontend)"]
        PayStart([Bắt đầu]) --> ViewRoomBill[Xem Hóa Đơn Phòng Mình]
        ViewRoomBill --> ClickPay[Nhấn nút 'Thanh toán qua PayOS']
        ClickPay --> SendPayReq[Gửi POST /invoices/:id/pay-link]
        
        %% Nhận Link thanh toán
        ReceivePayLink[Nhận link checkout từ Backend] --> RedirectPayOS[Chuyển hướng đến trang thanh toán PayOS]
        
        %% Chuyển khoản qua App Ngân hàng
        RedirectPayOS --> ScanVietQR[Quét mã QR VietQR bằng App Ngân hàng & Xác nhận chuyển tiền]
        
        %% Chuyển hướng quay về Client
        ReturnRedirect[Sinh viên được chuyển hướng về Return URL<br/>client/student-billing?status=success&orderCode=...] --> GetUrlParams[Đọc tham số url: status, orderCode]
        GetUrlParams --> SendVerifyReq[Gửi GET /invoices/verify/:orderCode]
        SendVerifyReq --> FinalStatus{Hóa đơn đã thanh toán?}
        FinalStatus -->|Đã thanh toán| ShowSuccessPayment[Hiển thị Banner thành công & Cập nhật UI]
        FinalStatus -->|Chưa thanh toán| ShowPendingPayment[Hiển thị trạng thái Chờ xử lý / Thất bại]
    end

    subgraph NestJSBackend ["Server (NestJS Backend)"]
        %% Khởi tạo link thanh toán
        SendPayReq --> GetInvoiceInfo[Truy vấn Hóa Đơn & Kiểm tra trạng thái]
        GetInvoiceInfo --> CheckPaid{Hóa đơn đã thanh toán?}
        CheckPaid -->|Đã thanh toán| ErrAlreadyPaid[Trả về lỗi 400: Hóa đơn đã thanh toán trước đó]
        CheckPaid -->|Chưa thanh toán| PreparePayOSData[Chuẩn bị dữ liệu gửi PayOS]
        
        %% Chuẩn bị dữ liệu PayOS
        %% orderCode: Phải là số nguyên duy nhất (VD: lấy ID hóa đơn tự tăng)
        %% description: Không dấu, dưới 25 ký tự
        PreparePayOSData --> CallPayOSApi[Gọi API PayOS: createPaymentLink]
        CallPayOSApi --> SendLinkToClient[Trả link thanh toán về client]
        
        %% Nhận và xử lý Webhook (IPN) từ PayOS
        ReceiveWebhook[POST /invoices/payos-webhook<br/>Nhận data giao dịch + signature] --> VerifyWebhookSignature{Xác minh chữ ký signature<br/>bằng Checksum Key cấu hình trong .env}
        VerifyWebhookSignature -->|Không hợp lệ| Return400IPN[Trả về 400 Bad Request cho PayOS]
        VerifyWebhookSignature -->|Hợp lệ| ExtractPaymentData[Giải mã dữ liệu & lấy orderCode]
        ExtractPaymentData --> GetInvoiceByOrderCode[Truy vấn Hóa đơn theo orderCode]
        GetInvoiceByOrderCode --> CompareAmount{Số tiền nhận được khớp?}
        CompareAmount -->|Không| LogMismatch[Ghi nhận log sai lệch số tiền] --> Return200IPN[Trả về 200 OK để xác nhận đã nhận webhook]
        CompareAmount -->|Có| UpdateInvoiceStatus[Cập nhật trạng thái Hóa đơn thành 'paid'<br/>Lưu thông tin giao dịch]
        UpdateInvoiceStatus --> Return200IPN
        
        %% Client xác nhận trạng thái trực tiếp
        SendVerifyReq --> CheckDBStatus[Truy vấn trạng thái mới nhất từ DB]
        CheckDBStatus --> SendVerifyResponse[Trả về trạng thái hóa đơn]
    end

    subgraph PayOSGateway ["Cổng Thanh Toán PayOS"]
        CallPayOSApi --> GenerateCheckoutLink[Tạo Link Checkout chứa mã QR VietQR động]
        GenerateCheckoutLink -->|Trả về Link| CallPayOSApi
        
        ScanVietQR --> ProcessTransaction[Hệ thống ghi nhận giao dịch thành công]
        ProcessTransaction --> TriggerWebhook[Gửi thông báo IPN qua Webhook url đăng ký]
        ProcessTransaction --> RedirectReturnUrl[Redirect Sinh viên về Return URL]
    end

    subgraph AivenDB ["Database (MySQL)"]
        GetInvoiceInfo -.->|Đọc| DBInvoiceTable[(Bảng Invoice)]
        UpdateInvoiceStatus --> WriteSuccessDB[Cập nhật status = 'paid']
        CheckDBStatus -.->|Đọc| DBInvoiceTable
    end

    %% Đường kết nối bổ sung
    ErrAlreadyPaid --> ShowErrForm
    SendLinkToClient --> ReceivePayLink
    TriggerWebhook --> ReceiveWebhook
    RedirectReturnUrl --> ReturnRedirect
    Return200IPN -->|Xác nhận| PayOSGateway
```

---

## 4. Đặc Điểm Kỹ Thuật Quan Trọng Khi Tích Hợp PayOS

Khi phát triển và tích hợp cổng thanh toán PayOS trên thực tế, Quỳnh (SV1) cần đặc biệt lưu ý các quy tắc nghiệp vụ sau để tránh lỗi giao dịch:

1. **Kiểu dữ liệu của Mã Đơn Hàng (`orderCode`)**:
   - PayOS chỉ chấp nhận `orderCode` dưới dạng **số nguyên (integer)** (ví dụ: `17812903`). Không được gửi chuỗi UUID hoặc ký tự không thuộc kiểu số.
   - Giải pháp: Sử dụng chính ID tự tăng của bảng `Invoice` trong Database làm `orderCode`, hoặc kết hợp với thời gian hiện tại (`Number(new Date().getTime().toString().slice(-8))`) để đảm bảo tính duy nhất.

2. **Mô tả Giao dịch (`description`)**:
   - Độ dài tối đa **25 ký tự**.
   - Chỉ được chứa chữ cái không dấu, số, dấu cách (không có ký tự đặc biệt hay dấu tiếng Việt).
   - Ví dụ hợp lệ: `Thanh toan tien phong 101` (độ dài 24 ký tự).

3. **Bảo mật Webhook (IPN Signature)**:
   - Tất cả dữ liệu webhook gửi từ PayOS đều kèm theo chữ ký bảo mật. Backend bắt buộc phải dùng `Checksum Key` được cung cấp trong dashboard PayOS để giải mã/xác thực tính toàn vẹn của dữ liệu trước khi cập nhật trạng thái hóa đơn trong database.
