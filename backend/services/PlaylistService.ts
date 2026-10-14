/**
 * @file PlaylistService.ts
 * @description Tầng Service - Quản lý Danh Sách Phát (Playlist)
 * Phục vụ người dùng: Tạo playlist, thêm bài hát, xóa bài hát, xóa playlist, xem chi tiết
 */

import { PlaylistModel, type IPlaylist } from '../models/PlaylistModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const PlaylistService = {
  // Lấy tất cả playlist của một người dùng
  async layTheoNguoiDung(nguoiDungId: string) {
    return await PlaylistModel.find({ nguoi_dung_id: nguoiDungId });
  },

  // Lấy chi tiết playlist kèm danh sách đầy đủ đối tượng bài hát bên trong
  async layChiTiet(playlistId: string) {
    const playlist = await PlaylistModel.findById(playlistId);
    if (!playlist) {
      throw new Error('Danh sách phát không tồn tại!');
    }

    const tatCaBaiHat = await BaiHatModel.find();
    // Map theo thứ tự trong playlist
    const danhSachChiTiet = (playlist.danh_sach_bai_hat || [])
      .map((id: string) => tatCaBaiHat.find(bh => bh._id === id))
      .filter(Boolean);

    return {
      playlist,
      bai_hat: danhSachChiTiet
    };
  },

  // Tạo playlist mới
  async taoMoi(duLieu: { ten_playlist: string; nguoi_dung_id: string; mo_ta?: string; anh_bia?: string }) {
    if (!duLieu.ten_playlist || duLieu.ten_playlist.trim() === '') {
      throw new Error('Tên playlist không được để trống!');
    }

    return await PlaylistModel.create({
      ten_playlist: duLieu.ten_playlist.trim(),
      nguoi_dung_id: duLieu.nguoi_dung_id,
      mo_ta: duLieu.mo_ta || '',
      anh_bia: duLieu.anh_bia || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      danh_sach_bai_hat: [],
      cong_khai: true
    });
  },

  // Thêm bài hát vào playlist
  async themBaiHatVaoPlaylist(playlistId: string, baiHatId: string, nguoiDungId: string) {
    const playlist = await PlaylistModel.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist không tồn tại!');
    }

    if (playlist.nguoi_dung_id !== nguoiDungId) {
      throw new Error('Bạn không có quyền chỉnh sửa playlist này!');
    }

    const song = await BaiHatModel.findById(baiHatId);
    if (!song || song.trang_thai !== 'da_duyet') throw new Error('Bài hát không tồn tại hoặc chưa được duyệt!');
    const danhSach = playlist.danh_sach_bai_hat || [];
    if (danhSach.includes(baiHatId)) {
      return { thanh_cong: false, thong_bao: 'Bài hát đã có trong playlist này rồi!' };
    }

    danhSach.push(baiHatId);
    await PlaylistModel.findByIdAndUpdate(playlistId, { danh_sach_bai_hat: danhSach });
    return { thanh_cong: true, thong_bao: 'Đã thêm bài hát vào playlist thành công!' };
  },

  // Xóa bài hát khỏi playlist
  async xoaBaiHatKhoiPlaylist(playlistId: string, baiHatId: string, nguoiDungId: string) {
    const playlist = await PlaylistModel.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist không tồn tại!');
    }

    if (playlist.nguoi_dung_id !== nguoiDungId) {
      throw new Error('Bạn không có quyền chỉnh sửa playlist này!');
    }

    const danhSach = (playlist.danh_sach_bai_hat || []).filter((id: string) => id !== baiHatId);
    await PlaylistModel.findByIdAndUpdate(playlistId, { danh_sach_bai_hat: danhSach });
    return { thanh_cong: true, thong_bao: 'Đã xóa bài hát khỏi playlist!' };
  },

  // Sửa tên / mô tả playlist
  async capNhat(playlistId: string, nguoiDungId: string, duLieu: { ten_playlist?: string; mo_ta?: string; anh_bia?: string }) {
    const playlist = await PlaylistModel.findById(playlistId);
    if (!playlist) throw new Error('Playlist không tồn tại!');
    if (playlist.nguoi_dung_id !== nguoiDungId) throw new Error('Bạn không có quyền sửa playlist này!');

    const safe: { ten_playlist?: string; mo_ta?: string; anh_bia?: string } = {};
    for (const key of ['ten_playlist', 'mo_ta', 'anh_bia'] as const) {
      if (duLieu[key] !== undefined) {
        if (typeof duLieu[key] !== 'string') throw new Error('Thông tin playlist không hợp lệ!');
        safe[key] = duLieu[key].trim();
      }
    }
    if (safe.ten_playlist === '') throw new Error('Tên playlist không được để trống!');
    return await PlaylistModel.findByIdAndUpdate(playlistId, safe);
  },

  // Xóa playlist
  async xoa(playlistId: string, nguoiDungId: string) {
    const playlist = await PlaylistModel.findById(playlistId);
    if (!playlist) throw new Error('Playlist không tồn tại!');
    if (playlist.nguoi_dung_id !== nguoiDungId) throw new Error('Bạn không có quyền xóa playlist này!');

    await PlaylistModel.findByIdAndDelete(playlistId);
    return { thanh_cong: true, thong_bao: 'Đã xóa playlist thành công!' };
  }
};
