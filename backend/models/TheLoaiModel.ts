/**
 * @file TheLoaiModel.ts
 * @description Tầng Model - Mô hình Thể Loại Âm Nhạc (Genre Model)
 * Quản lý các thể loại nhạc (V-Pop, Ballad, EDM, Lo-Fi, Rap, Rock, v.v.)
 */

import { TheLoaiDB } from '../database/co_so_du_lieu.ts';

export interface ITheLoai {
  _id?: string;
  ten_the_loai: string;
  mo_ta?: string;
  anh_the_loai?: string;
  mau_sac?: string;
  ngay_tao?: string;
}

export const TheLoaiModel = {
  find: (dieuKien: Partial<ITheLoai> = {}) => TheLoaiDB.find(dieuKien),
  findOne: (dieuKien: Partial<ITheLoai>) => TheLoaiDB.findOne(dieuKien),
  findById: (id: string) => TheLoaiDB.findById(id),
  create: (data: Omit<ITheLoai, '_id'>) => TheLoaiDB.create(data),
  findByIdAndUpdate: (id: string, data: Partial<ITheLoai>) => TheLoaiDB.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => TheLoaiDB.findByIdAndDelete(id),
  countDocuments: (dieuKien: Partial<ITheLoai> = {}) => TheLoaiDB.countDocuments(dieuKien)
};
