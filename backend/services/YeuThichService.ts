/**
 * @file YeuThichService.ts
 * @description Tầng Service - Quản lý Bài Hát Yêu Thích
 * Thả tim, hủy tim và lấy danh sách các bài hát yêu thích của người dùng
 */

import { YeuThichModel } from '../models/YeuThichModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const YeuThichService = {
  // Thả tim hoặc Bỏ thả tim (Toggle Like)
  async toggleYeuThich(nguoiDungId: string, baiHatId: string) {
    const song = await BaiHatModel.findById(baiHatId);
    if (!song || song.trang_thai !== 'da_duyet') throw new Error('Bài hát không tồn tại hoặc chưa được duyệt!');
    const daThich = await YeuThichModel.findOne({
      nguoi_dung_id: nguoiDungId,
      bai_hat_id: baiHatId
    });

    if (daThich && daThich._id) {
      await YeuThichModel.findByIdAndDelete(daThich._id);
      return { da_thich: false, thong_bao: 'Đã xóa bài hát khỏi danh sách yêu thích!' };
    }

    await YeuThichModel.create({
      nguoi_dung_id: nguoiDungId,
      bai_hat_id: baiHatId,
      ngay_thich: new Date().toISOString()
    });

    return { da_thich: true, thong_bao: 'Đã thêm bài hát vào danh sách yêu thích!' };
  },

  // Lấy danh sách ID các bài hát đã thích của người dùng
  async layDanhSachId(nguoiDungId: string) {
    const list = await YeuThichModel.find({ nguoi_dung_id: nguoiDungId });
    return list.map(item => item.bai_hat_id);
  },

  // Lấy danh sách đầy đủ bài hát yêu thích của người dùng
  async layDanhSachDayDu(nguoiDungId: string) {
    const list = await YeuThichModel.find({ nguoi_dung_id: nguoiDungId });
    // Sắp xếp bài thích mới nhất lên đầu
    list.sort((a, b) => new Date(b.ngay_thich || 0).getTime() - new Date(a.ngay_thich || 0).getTime());

    const tatCaBaiHat = await BaiHatModel.find();
    const ketQua = list.map(item => {
      const baiHat = tatCaBaiHat.find(bh => bh._id === item.bai_hat_id);
      return baiHat ? { ...baiHat, ngay_thich: item.ngay_thich } : null;
    }).filter(Boolean);

    return ketQua;
  }
};
