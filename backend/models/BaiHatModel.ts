/**
 * @file BaiHatModel.ts
 * @description Tầng Model - Mô hình Bài Hát (Song Model)
 * Quản lý bài hát, trạng thái kiểm duyệt (chờ duyệt, đã duyệt, từ chối), lượt nghe, file nhạc
 */

import { BaiHatDB } from '../database/co_so_du_lieu.ts';

// Kiểu dữ liệu Bài Hát
export interface IBaiHat {
  _id?: string;
  tieu_de: string;
  nghe_si: string;
  album?: string;
  the_loai: string;
  file_url: string;
  anh_bia?: string;
  thoi_luong?: number; // Đơn vị giây (ví dụ: 240 = 4 phút)
  luot_nghe?: number;
  trang_thai: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  nguoi_dang_id: string; // ID của người dùng hoặc quản trị viên tải lên
  loi_bai_hat?: string;
  ly_do_tu_choi?: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

// Đối tượng Model tương tác với CSDL
export const BaiHatModel = {
  // Lấy danh sách bài hát theo điều kiện lọc
  find: (dieuKien: Partial<IBaiHat> = {}) => BaiHatDB.find(dieuKien),

  // Tìm 1 bài hát
  findOne: (dieuKien: Partial<IBaiHat>) => BaiHatDB.findOne(dieuKien),

  // Tìm bài hát theo ID
  findById: (id: string) => BaiHatDB.findById(id),

  // Thêm mới bài hát
  create: (data: Omit<IBaiHat, '_id'>) => BaiHatDB.create(data),

  // Cập nhật thông tin bài hát (Duyệt, sửa thông tin, tăng lượt nghe)
  findByIdAndUpdate: (id: string, data: Partial<IBaiHat>) => BaiHatDB.findByIdAndUpdate(id, data),

  // Xóa bài hát theo ID
  findByIdAndDelete: (id: string) => BaiHatDB.findByIdAndDelete(id),

  // Đếm số lượng bài hát
  countDocuments: (dieuKien: Partial<IBaiHat> = {}) => BaiHatDB.countDocuments(dieuKien)
};
