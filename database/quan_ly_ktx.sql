-- BÀI KIỂM TRA GIỮA KỲ MÔN WEB NÂNG CAO
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ KÝ TÚC XÁ (Dormitory Management System)
-- File CSDL toàn bộ dự án nhóm: quan_ly_ktx.sql
-- Tác giả: SV1 - Quỳnh (Trưởng nhóm) thiết kế & tích hợp

CREATE DATABASE IF NOT EXISTS `quan_ly_ktx` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quan_ly_ktx`;

-- =========================================================================
-- PHẦN I: THIẾT KẾ CƠ SỞ HẠ TẦNG & QUẢN LÝ PHÒNG (SV2 - ĐÔNG)
-- =========================================================================

-- 1. Bảng quản lý Tòa nhà (Buildings)
CREATE TABLE IF NOT EXISTS `buildings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng quản lý Phòng ở (Rooms)
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `building_id` INT NOT NULL,
    `room_name` VARCHAR(50) NOT NULL UNIQUE,
    `capacity` INT NOT NULL DEFAULT 4, -- Số lượng giường tối đa (loại phòng 4, 6...)
    `current_occupancy` INT NOT NULL DEFAULT 0, -- Số sinh viên hiện tại trong phòng
    `type` VARCHAR(50) NOT NULL DEFAULT 'Thường', -- Loại phòng
    `fixed_rent` DECIMAL(12, 2) NOT NULL DEFAULT 1500000.00, -- Giá tiền thuê gốc cố định
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- PHẦN II: NỀN TẢNG THÀNH VIÊN, TÀI KHOẢN & PHÂN QUYỀN (SV1 - QUỲNH)
-- =========================================================================

-- 3. Bảng quản lý Tài khoản Người dùng (Users)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL, -- Sẽ lưu mật khẩu mã hóa bcrypt
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    `room_id` INT NULL, -- Phòng được xếp (Admin thì NULL)
    -- Các thông tin sinh viên nội trú (SV2 - Đông)
    `full_name` VARCHAR(100) NULL,
    `mssv` VARCHAR(20) NULL UNIQUE,
    `hometown` VARCHAR(100) NULL,
    `phone` VARCHAR(15) NULL,
    `class_name` VARCHAR(50) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng quản lý Hợp đồng cư trú sinh viên (Contracts - SV2 - Đông)
CREATE TABLE IF NOT EXISTS `contracts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `room_id` INT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` ENUM('active', 'expired') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- PHẦN III: TÀI CHÍNH, CHỈ SỐ ĐIỆN NƯỚC & HÓA ĐƠN (SV1 - QUỲNH)
-- =========================================================================

-- 5. Bảng quản lý Chỉ số Điện Nước hàng tháng (Utility Meters)
CREATE TABLE IF NOT EXISTS `utility_meters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `month` INT NOT NULL,
    `year` INT NOT NULL,
    `electricity_index` INT NOT NULL, -- Chỉ số điện cuối tháng
    `water_index` INT NOT NULL,       -- Chỉ số nước cuối tháng
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_room_month_year` (`room_id`, `month`, `year`),
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng quản lý Hóa đơn Tài chính (Invoices)
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `utility_meter_id` INT NULL,
    `month` INT NOT NULL,
    `year` INT NOT NULL,
    `room_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,       -- Tiền phòng cố định
    `electricity_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,  -- Tiền điện (chênh lệch chỉ số * đơn giá)
    `water_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,        -- Tiền nước tiêu thụ
    `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,     -- Tổng = phòng + điện + nước
    `status` ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
    `payos_order_code` BIGINT NULL UNIQUE, -- Mã đơn hàng duy nhất dùng để đối soát qua cổng thanh toán PayOS
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`utility_meter_id`) REFERENCES `utility_meters`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- PHẦN IV: THIẾT BỊ, BÁO CÁO SỰ CỐ & BẢNG TIN (SV3 - LONG)
-- =========================================================================

-- 7. Danh mục tài sản KTX (Assets Catalog)
CREATE TABLE IF NOT EXISTS `assets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Phân bổ tài sản vào từng phòng (Room Assets Allocation)
CREATE TABLE IF NOT EXISTS `room_assets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `asset_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `status` ENUM('new', 'used', 'broken') NOT NULL DEFAULT 'new',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_room_asset` (`room_id`, `asset_id`),
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Hệ thống Báo cáo sự cố / Sửa chữa (Ticket System)
CREATE TABLE IF NOT EXISTS `tickets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `urgency` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `status` ENUM('pending', 'processing', 'completed') NOT NULL DEFAULT 'pending',
    `image_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bảng tin & Thông báo (Announcements)
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DỮ LIỆU MẪU ĐỂ CHẠY KIỂM THỬ (MOCK DATA)
-- =========================================================================

-- Thêm tòa nhà mẫu (SV2)
INSERT INTO `buildings` (`name`, `description`) VALUES
('Tòa A', 'Khu ký túc xá nam'),
('Tòa B', 'Khu ký túc xá nữ')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Thêm phòng ở mẫu (SV2)
INSERT INTO `rooms` (`building_id`, `room_name`, `capacity`, `current_occupancy`, `type`, `fixed_rent`) VALUES
(1, 'Phòng A101', 4, 1, 'Thường', 1500000.00),
(1, 'Phòng A102', 4, 1, 'Thường', 1500000.00),
(1, 'Phòng A201', 6, 0, 'Dịch vụ VIP', 2200000.00),
(2, 'Phòng B101', 4, 0, 'Thường', 1500000.00)
ON DUPLICATE KEY UPDATE `fixed_rent` = VALUES(`fixed_rent`);

-- Thêm tài khoản Admin & Sinh viên mẫu (SV1)
-- Mật khẩu mã hóa bcrypt cho 'admin123' và 'student123'
INSERT INTO `users` (`username`, `password`, `email`, `role`, `room_id`, `full_name`, `mssv`, `hometown`, `phone`, `class_name`) VALUES
('admin', '$2b$10$wY9/RjE1b3nJ2qGz2sC80eyp/tQZ2xLq3k7NqZ9eDq76u/0N71qS.', 'admin@ktx.com', 'admin', NULL, 'Nguyễn Văn Quản Lý', 'ADMIN01', 'Hà Nội', '0988888888', 'N/A'),
('student1', '$2b$10$iM.P0Y3d7p5mO58u2m.R2u.vGgR38W1hG44p/K5l26R.oG3X26l2G', 'student1@ktx.com', 'student', 1, 'Trần Thị Quỳnh', 'SV202401', 'Hải Phòng', '0977777777', 'CNTT01'),
('student2', '$2b$10$iM.P0Y3d7p5mO58u2m.R2u.vGgR38W1hG44p/K5l26R.oG3X26l2G', 'student2@ktx.com', 'student', 2, 'Lê Văn Đông', 'SV202402', 'Đà Nẵng', '0966666666', 'Kế Toán 02')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- Thêm hợp đồng mẫu (SV2)
INSERT INTO `contracts` (`user_id`, `room_id`, `start_date`, `end_date`, `status`) VALUES
(2, 1, '2026-01-01', '2026-12-31', 'active'),
(3, 2, '2026-01-01', '2026-12-31', 'active')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Thêm tài sản mẫu (SV3)
INSERT INTO `assets` (`name`, `description`) VALUES
('Giường tầng sắt', 'Giường sắt 2 tầng tiêu chuẩn'),
('Điều hòa 12000 BTU', 'Điều hòa Daikin làm mát phòng'),
('Quạt trần Điện Cơ', 'Quạt trần 3 cánh'),
('Tủ lạnh mini 90L', 'Tủ lạnh trữ nước uống và hoa quả')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Phân bổ tài sản vào phòng mẫu (SV3)
INSERT INTO `room_assets` (`room_id`, `asset_id`, `quantity`, `status`) VALUES
(1, 1, 2, 'new'),
(1, 2, 1, 'used'),
(1, 3, 2, 'new')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`);

-- Đăng thông báo mẫu (SV3)
INSERT INTO `announcements` (`title`, `content`) VALUES
('Thông báo đóng tiền phòng tháng 6/2026', 'Yêu cầu toàn bộ sinh viên kiểm tra hóa đơn trên hệ thống và hoàn thành thanh toán trực tuyến qua cổng VietQR PayOS trước ngày 20/06/2026.'),
('Bảo trì điều hòa phòng VIP ngày 22/06', 'Phòng ban cơ sở vật chất sẽ tiến hành vệ sinh bảo trì hệ thống điều hòa tại tầng 2 các tòa nhà.')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`);
