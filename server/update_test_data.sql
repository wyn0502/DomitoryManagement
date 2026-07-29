-- Script cập nhật dữ liệu test cho sinh viên
-- Chạy trong MySQL: USE quan_ly_ktx; SOURCE update_test_data.sql;

-- Cập nhật thông tin sinh viên test (thay đổi username phù hợp với tài khoản của bạn)
UPDATE users 
SET 
    full_name = 'Nguyễn Văn A',
    hometown = 'Hà Nội',
    phone = '0912345678',
    class_name = 'DHKTPM15A',
    created_at = NOW()
WHERE username = 'student';

-- Hoặc cập nhật theo email
-- UPDATE users 
-- SET 
--     full_name = 'Nguyễn Văn A',
--     hometown = 'Hà Nội',
--     phone = '0912345678',
--     class_name = 'DHKTPM15A',
--     created_at = NOW()
-- WHERE email = 'student@example.com';
