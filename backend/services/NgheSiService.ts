/**
 * @file NgheSiService.ts
 * @description Tầng Service - Quản lý thông tin Nghệ Sĩ / Ca Sĩ
 * Hỗ trợ Khách & Người dùng xem nghệ sĩ + bài hát, Quản trị viên quản lý CRUD
 */

import { NgheSiModel, type INgheSi } from '../models/NgheSiModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const NgheSiService = {
  // Lấy toàn bộ danh sách nghệ sĩ
  async layTatCa() {
    return await NgheSiModel.find();
  },

  // Lấy chi tiết nghệ sĩ cùng với các bài hát của nghệ sĩ đó
  async layChiTiet(id: string) {
    const ngheSi = await NgheSiModel.findById(id);
    if (!ngheSi) {
      throw new Error('Không tìm thấy thông tin nghệ sĩ!');
    }

    // Lấy các bài hát đã duyệt của nghệ sĩ này
    const tatCaBaiHat = await BaiHatModel.find({ trang_thai: 'da_duyet' });
    const danhSachBaiHat = tatCaBaiHat.filter(bh => 
      bh.nghe_si.toLowerCase().includes(ngheSi.ten.toLowerCase())
    );

    return {
      nghe_si: ngheSi,
      bai_hat: danhSachBaiHat
    };
  },

  // Quản trị viên thêm mới nghệ sĩ
  async adminThem(duLieu: Omit<INgheSi, '_id'>) {
    if (!duLieu.ten) {
      throw new Error('Tên nghệ sĩ không được để trống!');
    }
    return await NgheSiModel.create({
      ...duLieu,
      anh_dai_dien: duLieu.anh_dai_dien || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'
    });
  },

  // Quản trị viên cập nhật nghệ sĩ
  async adminCapNhat(id: string, duLieu: Partial<INgheSi>) {
    delete duLieu._id;
    if ('ten' in duLieu && (typeof duLieu.ten !== 'string' || !duLieu.ten.trim())) throw new Error('Tên không được để trống!');
    const ketQua = await NgheSiModel.findByIdAndUpdate(id, duLieu);
    if (!ketQua) throw new Error('Không tìm thấy nghệ sĩ để cập nhật!');
    return ketQua;
  },

  // Quản trị viên xóa nghệ sĩ
  async adminXoa(id: string) {
    const ketQua = await NgheSiModel.findByIdAndDelete(id);
    if (!ketQua) throw new Error('Không tìm thấy nghệ sĩ để xóa!');
    return { thanh_cong: true, thong_bao: 'Đã xóa nghệ sĩ thành công!' };
  }
};
