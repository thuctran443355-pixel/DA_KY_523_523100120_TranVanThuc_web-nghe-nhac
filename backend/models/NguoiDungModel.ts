/**
 * @file NguoiDungModel.ts
 * @description Tầng Model - Mô hình Người Dùng (User Model)
 * Quản lý thông tin tài khoản người dùng, phân quyền (khách, người dùng, quản trị viên)
 */

import { NguoiDungDB } from '../database/co_so_du_lieu.ts';

// Kiểu dữ liệu TypeScript cho Người Dùng
export interface INguoiDung {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  ho_ten: string;
  vai_tro: 'khach' | 'nguoi_dung' | 'quan_tri_vien';
  avatar?: string;
  tieu_su?: string;
  trang_thai: 'hoat_dong' | 'bi_khoa';
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

// Đối tượng Model tương tác với CSDL
export const NguoiDungModel = {
  // Tìm kiếm danh sách người dùng
  find: (dieuKien: Partial<INguoiDung> = {}) => NguoiDungDB.find(dieuKien),

  // Tìm 1 người dùng theo điều kiện
  findOne: (dieuKien: Partial<INguoiDung>) => NguoiDungDB.findOne(dieuKien),

  // Tìm theo ID
  findById: (id: string) => NguoiDungDB.findById(id),

  // Tạo người dùng mới
  create: (data: Omit<INguoiDung, '_id'>) => NguoiDungDB.create(data),

  // Cập nhật người dùng theo ID
  findByIdAndUpdate: (id: string, data: Partial<INguoiDung>) => NguoiDungDB.findByIdAndUpdate(id, data),

  // Xóa người dùng theo ID
  findByIdAndDelete: (id: string) => NguoiDungDB.findByIdAndDelete(id),

  // Đếm số lượng người dùng
  countDocuments: (dieuKien: Partial<INguoiDung> = {}) => NguoiDungDB.countDocuments(dieuKien)
};
