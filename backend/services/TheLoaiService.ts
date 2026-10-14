/**
 * @file TheLoaiService.ts
 * @description Tầng Service - Quản lý danh mục Thể Loại Âm Nhạc
 * Cho phép lọc bài hát theo thể loại và quản trị viên CRUD
 */

import { TheLoaiModel, type ITheLoai } from '../models/TheLoaiModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const TheLoaiService = {
  // Lấy toàn bộ danh sách thể loại
  async layTatCa() {
    return await TheLoaiModel.find();
  },

  // Lấy chi tiết thể loại kèm danh sách bài hát thuộc thể loại đó
  async layChiTiet(idOrName: string) {
    let theLoai = await TheLoaiModel.findById(idOrName);
    if (!theLoai) {
      theLoai = await TheLoaiModel.findOne({ ten_the_loai: idOrName });
    }
    if (!theLoai) {
      throw new Error('Không tìm thấy thể loại âm nhạc này!');
    }

    const tatCaBaiHat = await BaiHatModel.find({ trang_thai: 'da_duyet' });
    const danhSachBaiHat = tatCaBaiHat.filter(bh => 
      bh.the_loai.toLowerCase() === theLoai!.ten_the_loai.toLowerCase()
    );

    return {
      the_loai: theLoai,
      bai_hat: danhSachBaiHat
    };
  },

  // Quản trị viên thêm thể loại mới
  async adminThem(duLieu: Omit<ITheLoai, '_id'>) {
    if (!duLieu.ten_the_loai) {
      throw new Error('Tên thể loại không được để trống!');
    }
    return await TheLoaiModel.create({
      ...duLieu,
      mau_sac: duLieu.mau_sac || '#6366f1',
      anh_the_loai: duLieu.anh_the_loai || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'
    });
  },

  // Quản trị viên cập nhật thể loại
  async adminCapNhat(id: string, duLieu: Partial<ITheLoai>) {
    delete duLieu._id;
    if ('ten_the_loai' in duLieu && (typeof duLieu.ten_the_loai !== 'string' || !duLieu.ten_the_loai.trim())) throw new Error('Tên không được để trống!');
    const ketQua = await TheLoaiModel.findByIdAndUpdate(id, duLieu);
    if (!ketQua) throw new Error('Không tìm thấy thể loại để cập nhật!');
    return ketQua;
  },

  // Quản trị viên xóa thể loại
  async adminXoa(id: string) {
    const ketQua = await TheLoaiModel.findByIdAndDelete(id);
    if (!ketQua) throw new Error('Không tìm thấy thể loại để xóa!');
    return { thanh_cong: true, thong_bao: 'Đã xóa thể loại thành công!' };
  }
};
