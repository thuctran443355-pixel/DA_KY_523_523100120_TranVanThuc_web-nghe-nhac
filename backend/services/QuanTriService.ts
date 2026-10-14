/**
 * @file QuanTriService.ts
 * @description Tầng Service - Dành riêng cho Quản Trị Viên (Admin)
 * Xem thống kê toàn hệ thống, quản lý người dùng, phân quyền và khóa tài khoản
 */

import { NguoiDungModel } from '../models/NguoiDungModel.ts';
import { BaiHatModel } from '../models/BaiHatModel.ts';
import { PlaylistModel } from '../models/PlaylistModel.ts';
import { NgheSiModel } from '../models/NgheSiModel.ts';
import { AlbumModel } from '../models/AlbumModel.ts';
import { TheLoaiModel } from '../models/TheLoaiModel.ts';
import { LichSuDB, YeuThichDB } from '../database/co_so_du_lieu.ts';

export const QuanTriService = {
  // Lấy dữ liệu thống kê tổng quan toàn hệ thống
  async layThongKeHeThong() {
    const [
      tatCaNguoiDung,
      tatCaBaiHat,
      tatCaPlaylist,
      tatCaNgheSi,
      tatCaAlbum,
      tatCaTheLoai
    ] = await Promise.all([
      NguoiDungModel.find(),
      BaiHatModel.find(),
      PlaylistModel.find(),
      NgheSiModel.find(),
      AlbumModel.find(),
      TheLoaiModel.find()
    ]);

    // Đếm bài hát chờ duyệt
    const soBaiChoDuyet = tatCaBaiHat.filter(b => b.trang_thai === 'cho_duyet').length;
    const soBaiDaDuyet = tatCaBaiHat.filter(b => b.trang_thai === 'da_duyet').length;
    const soBaiTuChoi = tatCaBaiHat.filter(b => b.trang_thai === 'tu_choi').length;

    // Tổng số lượt nghe toàn hệ thống
    const tongLuotNghe = tatCaBaiHat.reduce((tong, b) => tong + (b.luot_nghe || 0), 0);

    // Phân loại người dùng theo vai trò
    const soQuanTriVien = tatCaNguoiDung.filter(u => u.vai_tro === 'quan_tri_vien').length;
    const soNguoiDungThuong = tatCaNguoiDung.filter(u => u.vai_tro === 'nguoi_dung').length;
    const soTaiKhoanBiKhoa = tatCaNguoiDung.filter(u => u.trang_thai === 'bi_khoa').length;

    // Thống kê theo thể loại
    const thongKeTheLoai = tatCaTheLoai.map(tl => {
      const baiHatThuocTheLoai = tatCaBaiHat.filter(b => b.the_loai.toLowerCase() === tl.ten_the_loai.toLowerCase());
      const luotNghe = baiHatThuocTheLoai.reduce((sum, b) => sum + (b.luot_nghe || 0), 0);
      return {
        ten_the_loai: tl.ten_the_loai,
        so_bai_hat: baiHatThuocTheLoai.length,
        luot_nghe: luotNghe,
        mau_sac: tl.mau_sac
      };
    });

    // Top 5 bài hát có lượt nghe cao nhất
    const topBaiHat = [...tatCaBaiHat]
      .filter(b => b.trang_thai === 'da_duyet')
      .sort((a, b) => (b.luot_nghe || 0) - (a.luot_nghe || 0))
      .slice(0, 5);

    return {
      tong_so_bai_hat: tatCaBaiHat.length,
      so_bai_cho_duyet: soBaiChoDuyet,
      so_bai_da_duyet: soBaiDaDuyet,
      so_bai_tu_choi: soBaiTuChoi,
      tong_luot_nghe: tongLuotNghe,
      tong_so_nguoi_dung: tatCaNguoiDung.length,
      so_quan_tri_vien: soQuanTriVien,
      so_nguoi_dung_thuong: soNguoiDungThuong,
      so_tai_khoan_bi_khoa: soTaiKhoanBiKhoa,
      tong_so_playlist: tatCaPlaylist.length,
      tong_so_nghe_si: tatCaNgheSi.length,
      tong_so_album: tatCaAlbum.length,
      thong_ke_the_loai: thongKeTheLoai,
      top_bai_hat: topBaiHat
    };
  },

  // Quản lý người dùng: Lấy danh sách tất cả người dùng (không trả về password)
  async layTatCaNguoiDung() {
    const list = await NguoiDungModel.find();
    return list.map(({ password, ...info }) => info);
  },

  // Khóa hoặc mở khóa tài khoản người dùng
  async khoaHoacMoKhoaNguoiDung(userId: string, trang_thai: 'hoat_dong' | 'bi_khoa') {
    const user = await NguoiDungModel.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng!');

    if (!['hoat_dong', 'bi_khoa'].includes(trang_thai)) throw new Error('Trạng thái không hợp lệ!');
    const capNhat = await NguoiDungModel.findByIdAndUpdate(userId, { trang_thai });
    const { password, ...info } = capNhat || {};
    return info;
  },

  // Thay đổi phân quyền vai trò người dùng (nguoi_dung <-> quan_tri_vien)
  async thayDoiVaiTro(userId: string, vai_tro: 'nguoi_dung' | 'quan_tri_vien') {
    const user = await NguoiDungModel.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng!');

    if (!['nguoi_dung', 'quan_tri_vien'].includes(vai_tro)) throw new Error('Vai trò không hợp lệ!');
    const capNhat = await NguoiDungModel.findByIdAndUpdate(userId, { vai_tro });
    const { password, ...info } = capNhat || {};
    return info;
  },

  // Xóa tài khoản người dùng
  async xoaNguoiDung(userId: string) {
    const user = await NguoiDungModel.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng để xóa!');

    const ketQua = await NguoiDungModel.findByIdAndDelete(userId);
    if (!ketQua) throw new Error('Không thể xóa người dùng này!');

    try {
      // 1. Xóa các playlist của người dùng này
      await PlaylistModel.deleteMany({ nguoi_dung_id: userId });
      // 2. Xóa lịch sử nghe và danh sách bài hát yêu thích
      await LichSuDB.deleteMany({ nguoi_dung_id: userId });
      await YeuThichDB.deleteMany({ nguoi_dung_id: userId });
      // 3. Xử lý các bài hát do người dùng tải lên
      const baiHatUser = await BaiHatModel.find({ nguoi_dang_id: userId });
      for (const bh of baiHatUser) {
        if (bh._id) {
          if (bh.trang_thai === 'cho_duyet' || bh.trang_thai === 'tu_choi') {
            await BaiHatModel.findByIdAndDelete(bh._id);
          } else {
            await BaiHatModel.findByIdAndUpdate(bh._id, { nguoi_dang_id: 'nd_admin_01' });
          }
        }
      }
    } catch (e) {
      throw new Error('Không thể hoàn tất dọn dẹp dữ liệu người dùng.', { cause: e });
    }

    return { thanh_cong: true, thong_bao: `Đã xóa tài khoản "${user.ho_ten || user.username}" thành công!` };
  }
};
