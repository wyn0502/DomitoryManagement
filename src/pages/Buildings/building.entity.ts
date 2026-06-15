/**
 * Building Entity - Định nghĩa cấu trúc dữ liệu của Building trong database
 * Chứa thông tin cơ bản về một tòa nhà ký túc xá
 */

export interface Building {
  // Basic Info
  id: number;
  name: string;               // Tên tòa nhà (ví dụ: 'Tòa A', 'Tòa B')
  description?: string;       // Mô tả tòa nhà
  location?: string;          // Vị trí địa lý (optional)
  
  // Timestamps
  createdAt: Date;            // Thời điểm tạo
  updatedAt: Date;            // Thời điểm cập nhật lần cuối
}
