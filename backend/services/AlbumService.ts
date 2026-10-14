/**
 * @file AlbumService.ts
 * @description Tầng Service - Quản lý thông tin Album phát hành
 * Hỗ trợ Khách & Người dùng xem album + bài hát, Quản trị viên quản lý CRUD
 */

import { AlbumModel, type IAlbum } from '../models/AlbumModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const AlbumService = {
  // Lấy toàn bộ danh sách album
  async layTatCa() {
    return await AlbumModel.find();
  },

  // Lấy chi tiết album cùng các bài hát thuộc album
  async layChiTiet(id: string) {
    const album = await AlbumModel.findById(id);
    if (!album) {
      throw new Error('Không tìm thấy thông tin album!');
    }

    // Lấy bài hát theo danh_sach_bai_hat hoặc theo tên album
    const tatCaBaiHat = await BaiHatModel.find({ trang_thai: 'da_duyet' });
    const danhSachBaiHat = tatCaBaiHat.filter(bh => 
      (album.danh_sach_bai_hat && album.danh_sach_bai_hat.includes(bh._id || '')) ||
      (bh.album && bh.album.toLowerCase() === album.ten_album.toLowerCase())
    );

    return {
      album,
      bai_hat: danhSachBaiHat
    };
  },

  // Quản trị viên tạo album mới
  async adminThem(duLieu: Omit<IAlbum, '_id'>) {
    if (!duLieu.ten_album || !duLieu.nghe_si) {
      throw new Error('Tên album và tên nghệ sĩ không được để trống!');
    }
    return await AlbumModel.create({
      ...duLieu,
      anh_bia: duLieu.anh_bia || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
      nam_phat_hanh: duLieu.nam_phat_hanh || new Date().getFullYear(),
      danh_sach_bai_hat: duLieu.danh_sach_bai_hat || []
    });
  },

  // Quản trị viên cập nhật album
  async adminCapNhat(id: string, duLieu: Partial<IAlbum>) {
    delete duLieu._id;
    if ('ten_album' in duLieu && (typeof duLieu.ten_album !== 'string' || !duLieu.ten_album.trim())) throw new Error('Tên không được để trống!');
    const ketQua = await AlbumModel.findByIdAndUpdate(id, duLieu);
    if (!ketQua) throw new Error('Không tìm thấy album để cập nhật!');
    return ketQua;
  },

  // Quản trị viên xóa album
  async adminXoa(id: string) {
    const ketQua = await AlbumModel.findByIdAndDelete(id);
    if (!ketQua) throw new Error('Không tìm thấy album để xóa!');
    return { thanh_cong: true, thong_bao: 'Đã xóa album thành công!' };
  }
};
