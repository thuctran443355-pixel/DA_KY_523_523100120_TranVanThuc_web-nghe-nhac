/**
 * @file YeuThichModel.ts
 * @description Tầng Model - Mô hình Bài Hát Yêu Thích (Favorite Model)
 * Quản lý danh sách các bài hát mà người dùng đã thả tim / yêu thích
 */

import { YeuThichDB } from '../database/co_so_du_lieu.ts';

export interface IYeuThich {
  _id?: string;
  nguoi_dung_id: string;
  bai_hat_id: string;
  ngay_thich?: string;
}

export const YeuThichModel = {
  find: (dieuKien: Partial<IYeuThich> = {}) => YeuThichDB.find(dieuKien),
  findOne: (dieuKien: Partial<IYeuThich>) => YeuThichDB.findOne(dieuKien),
  findById: (id: string) => YeuThichDB.findById(id),
  create: (data: Omit<IYeuThich, '_id'>) => YeuThichDB.create(data),
  findByIdAndDelete: (id: string) => YeuThichDB.findByIdAndDelete(id),
  deleteMany: (dieuKien: Partial<IYeuThich>) => YeuThichDB.deleteMany(dieuKien)
};
