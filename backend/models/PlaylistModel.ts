/**
 * @file PlaylistModel.ts
 * @description Tầng Model - Mô hình Danh Sách Phát (Playlist Model)
 * Quản lý danh sách phát của người dùng, thêm/bớt bài hát, trạng thái công khai
 */

import { PlaylistDB } from '../database/co_so_du_lieu.ts';

export interface IPlaylist {
  _id?: string;
  ten_playlist: string;
  nguoi_dung_id: string; // ID người tạo playlist
  mo_ta?: string;
  anh_bia?: string;
  danh_sach_bai_hat: string[]; // Mảng các ID bài hát
  cong_khai?: boolean;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export const PlaylistModel = {
  find: (dieuKien: Partial<IPlaylist> = {}) => PlaylistDB.find(dieuKien),
  findOne: (dieuKien: Partial<IPlaylist>) => PlaylistDB.findOne(dieuKien),
  findById: (id: string) => PlaylistDB.findById(id),
  create: (data: Omit<IPlaylist, '_id'>) => PlaylistDB.create(data),
  findByIdAndUpdate: (id: string, data: Partial<IPlaylist>) => PlaylistDB.findByIdAndUpdate(id, data),
  findByIdAndDelete: (id: string) => PlaylistDB.findByIdAndDelete(id),
  deleteMany: (dieuKien: Partial<IPlaylist> = {}) => PlaylistDB.deleteMany(dieuKien),
  countDocuments: (dieuKien: Partial<IPlaylist> = {}) => PlaylistDB.countDocuments(dieuKien)
};
