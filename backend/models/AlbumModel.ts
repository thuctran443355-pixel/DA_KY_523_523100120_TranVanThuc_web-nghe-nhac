/**
 * @file AlbumModel.ts
 * @description Tầng Model - Mô hình Album (Album Model)
 * Quản lý album phát hành, nghệ sĩ, năm phát hành, danh sách bài hát trong album
 */

import { AlbumDB } from '../database/co_so_du_lieu.ts';

export interface IAlbum {
  _id?: string;
  ten_album: string;
  nghe_si: string;
  anh_bia?: string;
  nam_phat_hanh?: number;
  mo_ta?: string;
  danh_sach_bai_hat?: string[]; // Mảng các ID bài hát
  ngay_tao?: string;
}

export const AlbumModel = {
  find: (dieuKien: Partial<IAlbum> = {}) => AlbumDB.find(dieuKien),
  findOne: (dieuKien: Partial<IAlbum>) => AlbumDB.findOne(dieuKien),
  findById: (id: string) => AlbumDB.findById(id),
  create: (data: Omit<IAlbum, '_id'>) => AlbumDB.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IAlbum>) => AlbumDB.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => AlbumDB.findByIdAndDelete(id),
  countDocuments: (dieuKien: Partial<IAlbum> = {}) => AlbumDB.countDocuments(dieuKien)
};
