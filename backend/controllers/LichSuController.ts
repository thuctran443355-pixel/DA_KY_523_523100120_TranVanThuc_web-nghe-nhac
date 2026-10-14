/**
 * @file LichSuController.ts
 * @description Tầng Controller - Tiếp nhận yêu cầu HTTP liên quan đến Lịch Sử Nghe Nhạc
 */

import type { Response } from 'express';
import { LichSuService } from '../services/LichSuService.ts';
import type { RequestXacThuc } from '../middlewares/xac_thuc_token.ts';

export const LichSuController = {
  // Ghi nhận bài hát khi người dùng nghe
  async ghiNhan(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.json({ thanh_cong: true, thong_bao: 'Khách vãng lai nghe nhạc (không lưu lịch sử)' });
      }
      const { bai_hat_id } = req.body;
      const banGhi = await LichSuService.ghiNhan(req.nguoiDungHienTai._id, bai_hat_id);
      return res.json({ thanh_cong: true, du_lieu: banGhi });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Lấy lịch sử nghe nhạc của người dùng
  async layDanhSach(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const danhSach = await LichSuService.layTheoNguoiDung(req.nguoiDungHienTai._id);
      return res.json({ thanh_cong: true, tong_so: danhSach.length, du_lieu: danhSach });
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Xóa một bài hát khỏi lịch sử nghe
  async xoaMot(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const { id } = req.params;
      const ketQua = await LichSuService.xoaMot(id, req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(400).json({ thanh_cong: false, thong_bao: error.message });
    }
  },

  // Xóa toàn bộ lịch sử nghe
  async xoaTatCa(req: RequestXacThuc, res: Response) {
    try {
      if (!req.nguoiDungHienTai?._id) {
        return res.status(401).json({ thanh_cong: false, thong_bao: 'Vui lòng đăng nhập!' });
      }
      const ketQua = await LichSuService.xoaTatCa(req.nguoiDungHienTai._id);
      return res.json(ketQua);
    } catch (error: any) {
      return res.status(500).json({ thanh_cong: false, thong_bao: error.message });
    }
  }
};
