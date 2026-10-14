/**
 * @file LichSuService.ts
 * @description Tầng Service - Quản lý Lịch Sử Nghe Nhạc
 * Tự động ghi nhận khi người dùng nghe nhạc và cung cấp danh sách nghe gần đây
 */

import { LichSuModel } from '../models/LichSuModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';

export const LichSuService = {
  // Ghi nhận hoặc tăng số lần nghe của bài hát vào lịch sử
  async ghiNhan(nguoiDungId: string, baiHatId: string) {
    const song = await BaiHatModel.findById(baiHatId);
    if (!song) throw new Error('Bài hát không tồn tại!');
    const banGhiCu = await LichSuModel.findOne({
      nguoi_dung_id: nguoiDungId,
      bai_hat_id: baiHatId
    });

    if (banGhiCu && banGhiCu._id) {
      return await LichSuModel.findByIdAndUpdate(banGhiCu._id, {
        thoi_gian_nghe: new Date().toISOString(),
        so_lan_nghe: (banGhiCu.so_lan_nghe || 1) + 1
      });
    }

    return await LichSuModel.create({
      nguoi_dung_id: nguoiDungId,
      bai_hat_id: baiHatId,
      thoi_gian_nghe: new Date().toISOString(),
      so_lan_nghe: 1
    });
  },

  // Lấy lịch sử nghe nhạc của người dùng (kèm thông tin chi tiết bài hát)
  async layTheoNguoiDung(nguoiDungId: string) {
    const danhSachLichSu = await LichSuModel.find({ nguoi_dung_id: nguoiDungId });
    // Sắp xếp theo thời gian nghe mới nhất
    danhSachLichSu.sort((a, b) => new Date(b.thoi_gian_nghe).getTime() - new Date(a.thoi_gian_nghe).getTime());

    const tatCaBaiHat = await BaiHatModel.find();

    const ketQua = danhSachLichSu.map(ls => {
      const baiHat = tatCaBaiHat.find(bh => bh._id === ls.bai_hat_id);
      return {
        _id: ls._id,
        thoi_gian_nghe: ls.thoi_gian_nghe,
        so_lan_nghe: ls.so_lan_nghe,
        bai_hat: baiHat || null
      };
    }).filter(item => item.bai_hat !== null);

    return ketQua;
  },

  // Xóa một bài hát khỏi lịch sử nghe
  async xoaMot(id: string, nguoiDungId: string) {
    const item = await LichSuModel.findById(id);
    if (!item) throw new Error('Không tìm thấy bản ghi lịch sử!');
    if (item.nguoi_dung_id !== nguoiDungId) {
      throw new Error('Bạn không có quyền xóa bản ghi này!');
    }
    await LichSuModel.findByIdAndDelete(id);
    return { thanh_cong: true, thong_bao: 'Đã xóa bài hát khỏi lịch sử!' };
  },

  // Xóa toàn bộ lịch sử nghe
  async xoaTatCa(nguoiDungId: string) {
    await LichSuModel.deleteMany({ nguoi_dung_id: nguoiDungId });
    return { thanh_cong: true, thong_bao: 'Đã xóa toàn bộ lịch sử nghe nhạc!' };
  }
};
