/**
 * @file QuanTriController.ts
 * @description Tầng Controller - Dành riêng cho Quản Trị Viên (Admin)
 * Thống kê toàn diện hệ thống, Quản lý tài khoản và phân quyền người dùng
 */

import type { Response } from 'express';
import { QuanTriService } from '../services/QuanTriService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const QuanTriController = {
  // Xem thống kê hệ thống (bài hát, lượt nghe, user, playlist, thể loại)
  async layThongKe(req: RequestXacThuc, res: Response) {
    try {
      const thongKe = await QuanTriService.layThongKeHeThong();
      return res.json({ thanh_cong: true, du_lieu: thongKe });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Lấy danh sách toàn bộ người dùng
  async layTatCaNguoiDung(req: RequestXacThuc, res: Response) {
    try {
      const danhSach = await QuanTriService.layTatCaNguoiDung();
      return res.json({ thanh_cong: true, tong_so: danhSach.length, du_lieu: danhSach });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Khóa hoặc mở khóa tài khoản
  async khoaHoacMoKhoa(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const { trang_thai } = req.body;
      const capNhat = await QuanTriService.khoaHoacMoKhoaNguoiDung(id, trang_thai);
      return res.json({
        thanh_cong: true,
        thong_bao: trang_thai === 'bi_khoa' ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Thay đổi vai trò người dùng (nguoi_dung <-> quan_tri_vien)
  async thayDoiVaiTro(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      const { vai_tro } = req.body;
      const capNhat = await QuanTriService.thayDoiVaiTro(id, vai_tro);
      return res.json({
        thanh_cong: true,
        thong_bao: 'Cập nhật quyền hạn người dùng thành công!',
        du_lieu: capNhat
      });
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Xóa tài khoản người dùng
  async xoaNguoiDung(req: RequestXacThuc, res: Response) {
    try {
      const { id } = req.params;
      if (req.nguoiDungHienTai?._id === id) {
        return res.status(400).json({
          thanh_cong: false,
          thong_bao: 'Bạn không thể tự xóa tài khoản quản trị viên của chính mình đang đăng nhập!'
        });
      }
      const ketQua = await QuanTriService.xoaNguoiDung(id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
