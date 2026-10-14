/**
 * @file LichSuModel.ts
 * @description Tầng Model - Mô hình Lịch Sử Nghe Nhạc (Listening History Model)
 * Lưu trữ lịch sử bài hát đã nghe của từng người dùng, thời gian và số lần nghe
 */

import { LichSuDB } from '../database/co_so_du_lieu.ts';

export interface ILichSu {
  _id?: string;
  nguoi_dung_id: string;
  bai_hat_id: string;
  thoi_gian_nghe: string;
  so_lan_nghe: number;
}

export const LichSuModel = {
  find: (dieuKien: Partial<ILichSu> = {}) => LichSuDB.find(dieuKien),
  findOne: (dieuKien: Partial<ILichSu>) => LichSuDB.findOne(dieuKien),
  findById: (id: string) => LichSuDB.findById(id),
  create: (data: Omit<ILichSu, '_id'>) => LichSuDB.create(data),
  findByIdAndUpdate: (id: string, data: Partial<ILichSu>) => LichSuDB.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => LichSuDB.findByIdAndDelete(id),
  deleteMany: (dieuKien: Partial<ILichSu>) => LichSuDB.deleteMany(dieuKien)
};
